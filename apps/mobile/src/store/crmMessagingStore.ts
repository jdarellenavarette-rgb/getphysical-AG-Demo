import { create } from "zustand";
import { getSodiaSupabaseClient, type CrmBroadcast, type CrmChatMessage } from "sodia-core";
import type { DMThread } from "../components/sodia/InboxView";
import { INITIAL_MESSAGES, INITIAL_THREADS } from "../data/crmSeedThreads";
import {
  ATHLETE_ID,
  ATHLETE_NAME,
  CRM_CHANNEL,
  broadcastToMessage,
  deliverReply,
  fetchBroadcastHistory,
  isBroadcastForAthlete,
  threadIdForSuite,
  type CrmDirectPayload,
  type CrmRealtimeChannel,
} from "../services/crmTransport";

export interface CrmNotificationToast {
  id: string;
  title: string;
  body: string;
  senderName: string;
  senderAvatar: string;
  threadId: string;
  promoCode?: string;
  timestamp: string;
}

export interface CrmMessagingState {
  threads: DMThread[];
  threadMessages: Record<string, CrmChatMessage[]>;
  activeToast: CrmNotificationToast | null;
  hasSubscribed: boolean;
  initRealtimeSubscription: () => void;
  teardownRealtimeSubscription: () => void;
  dismissToast: () => void;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  markThreadAsRead: (threadId: string) => void;
  loadBroadcastHistory: () => Promise<void>;
}

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80";
let realtimeChannelRef: CrmRealtimeChannel | null = null;

type StoreSet = (fn: (s: CrmMessagingState) => Partial<CrmMessagingState>) => void;

/** Append a message to a thread, bump unread + preview, and raise the in-app banner. */
function receive(set: StoreSet, threadId: string, msg: CrmChatMessage, preview: string, toast: CrmNotificationToast, badgeText?: string) {
  set((state) => ({
    threadMessages: { ...state.threadMessages, [threadId]: [...(state.threadMessages[threadId] ?? []), msg] },
    threads: state.threads.map((t) =>
      t.id === threadId ? { ...t, lastMessage: preview, timeAgo: "Just now", unreadCount: t.unreadCount + 1, badgeText: badgeText ?? t.badgeText } : t
    ),
    activeToast: toast,
  }));
}

export const useCrmMessagingStore = create<CrmMessagingState>((set, get) => ({
  threads: INITIAL_THREADS,
  threadMessages: INITIAL_MESSAGES,
  activeToast: null,
  hasSubscribed: false,

  dismissToast: () => set({ activeToast: null }),

  markThreadAsRead: (threadId) =>
    set((state) => ({ threads: state.threads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)) })),

  initRealtimeSubscription: () => {
    if (get().hasSubscribed || realtimeChannelRef) return;
    try {
      const channel = getSodiaSupabaseClient().channel(CRM_CHANNEL, { config: { broadcast: { self: false } } });

      channel.on("broadcast", { event: "crm_broadcast" }, ({ payload }: { payload: CrmBroadcast }) => {
        if (!payload || !isBroadcastForAthlete(payload)) return;
        const threadId = threadIdForSuite(payload.suiteMode);
        const msg = broadcastToMessage(payload, threadId, `crm_msg_${payload.id || Date.now()}`, "Just now");
        receive(set, threadId, msg, `📢 ${payload.title}`, {
          id: `toast_${Date.now()}`,
          title: payload.title,
          body: payload.body,
          senderName: payload.senderName,
          senderAvatar: payload.senderAvatar,
          threadId,
          promoCode: payload.promoCode,
          timestamp: "Just now",
        }, payload.badgeText);
      });

      channel.on("broadcast", { event: "crm_direct" }, ({ payload }: { payload: CrmDirectPayload }) => {
        if (!payload) return;
        const threadId = payload.threadId || "thread_metro_core";
        const senderName = payload.senderName || "Business Suite Support";
        const text = payload.text ?? "";
        const msg: CrmChatMessage = {
          id: `crm_direct_${Date.now()}`,
          threadId,
          senderId: "business",
          senderName,
          text,
          time: "Just now",
          createdAt: new Date().toISOString(),
        };
        receive(set, threadId, msg, text, {
          id: `toast_${Date.now()}`,
          title: senderName,
          body: text,
          senderName,
          senderAvatar: payload.senderAvatar || FALLBACK_AVATAR,
          threadId,
          timestamp: "Just now",
        });
      });

      channel.subscribe();
      realtimeChannelRef = channel;
      set({ hasSubscribed: true });
    } catch (err) {
      console.warn("[CRM Realtime Subscribe Error]:", err);
    }
    get().loadBroadcastHistory();
  },

  // AGENTS.md §7: every supabase.channel() must be released with removeChannel().
  teardownRealtimeSubscription: () => {
    if (!realtimeChannelRef) return;
    getSodiaSupabaseClient().removeChannel(realtimeChannelRef).catch(() => undefined);
    realtimeChannelRef = null;
    set({ hasSubscribed: false });
  },

  sendMessage: async (threadId, text) => {
    const body = text.trim();
    if (!body) return;
    const reply: CrmChatMessage = {
      id: `msg_reply_${Date.now()}`,
      threadId,
      senderId: ATHLETE_ID,
      senderName: ATHLETE_NAME,
      text: body,
      time: "Just now",
      createdAt: new Date().toISOString(),
    };
    // Optimistic insert; delivery is best-effort below.
    set((state) => ({
      threadMessages: { ...state.threadMessages, [threadId]: [...(state.threadMessages[threadId] ?? []), reply] },
      threads: state.threads.map((t) => (t.id === threadId ? { ...t, lastMessage: body, timeAgo: "Just now" } : t)),
    }));
    await deliverReply(reply);
  },

  loadBroadcastHistory: async () => {
    const broadcasts = await fetchBroadcastHistory();
    if (broadcasts.length === 0) return;
    set((state) => {
      const threadId = "thread_metro_core";
      const existing = state.threadMessages[threadId] ?? [];
      const fresh = broadcasts
        .filter((bc) => !existing.some((m) => m.broadcastData?.title === bc.title || m.text.includes(bc.title)))
        .map((bc) => broadcastToMessage(bc, threadId, `hist_bc_${bc.id}`, "Recent"));
      if (fresh.length === 0) return state;
      return { threadMessages: { ...state.threadMessages, [threadId]: [...existing, ...fresh] } };
    });
  },
}));
