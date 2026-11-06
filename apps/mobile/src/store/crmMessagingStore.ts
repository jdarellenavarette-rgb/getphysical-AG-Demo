import { create } from "zustand";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { CrmChatMessage, MessageRow } from "sodia-core";
import type { DMThread } from "../components/sodia/InboxView";
import { SIGNED_OUT_MESSAGES, SIGNED_OUT_THREADS } from "../data/crmSeedThreads";
import { getSessionUserId, getSupabase } from "../lib/supabase";
import { loadInbox, toChatMessage } from "../services/messagingService";

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

export type InboxSyncState = "signed_out" | "loading" | "live" | "error";

export interface CrmMessagingState {
  threads: DMThread[];
  threadMessages: Record<string, CrmChatMessage[]>;
  activeToast: CrmNotificationToast | null;
  syncState: InboxSyncState;
  lastError: string | null;

  /** Load the inbox and subscribe to new messages. Returns the teardown. */
  initRealtimeSubscription: () => () => void;
  dismissToast: () => void;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  markThreadAsRead: (threadId: string) => void;
  refreshInbox: () => Promise<void>;
}

let channel: RealtimeChannel | null = null;
let currentUserId: string | null = null;

function teardown(): void {
  const supabase = getSupabase();
  if (supabase && channel) void supabase.removeChannel(channel);
  channel = null;
}

export const useCrmMessagingStore = create<CrmMessagingState>((set, get) => ({
  threads: SIGNED_OUT_THREADS,
  threadMessages: SIGNED_OUT_MESSAGES,
  activeToast: null,
  syncState: "signed_out",
  lastError: null,

  dismissToast: () => set({ activeToast: null }),

  markThreadAsRead: (threadId) => {
    set((state) => ({
      threads: state.threads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)),
    }));
    const supabase = getSupabase();
    if (supabase && currentUserId) void supabase.rpc("mark_conversation_read", { p_conversation_id: threadId });
  },

  refreshInbox: async () => {
    const supabase = getSupabase();
    const userId = await getSessionUserId();
    currentUserId = userId;
    if (!supabase || !userId) {
      set({ threads: SIGNED_OUT_THREADS, threadMessages: SIGNED_OUT_MESSAGES, syncState: "signed_out" });
      return;
    }
    set({ syncState: "loading" });
    try {
      const inbox = await loadInbox(supabase, userId);
      set({ threads: inbox.threads, threadMessages: inbox.messages, syncState: "live", lastError: null });
    } catch (error) {
      set({ syncState: "error", lastError: error instanceof Error ? error.message : "Could not load messages" });
    }
  },

  initRealtimeSubscription: () => {
    const supabase = getSupabase();
    if (!supabase) return () => undefined;

    const start = async () => {
      await get().refreshInbox();
      if (!currentUserId || channel) return;
      // postgres_changes honours RLS: only rows from the user's own threads arrive.
      channel = supabase
        .channel(`inbox:${currentUserId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, ({ new: row }) => {
          const message = row as MessageRow;
          const thread = get().threads.find((t) => t.id === message.conversation_id);
          if (!thread) {
            void get().refreshInbox(); // new conversation (e.g. first broadcast)
            return;
          }
          const existing = get().threadMessages[thread.id] ?? [];
          if (existing.some((m) => m.id === message.id)) return;
          const fromMe = message.sender_id === currentUserId && message.sender_kind === "USER";
          const chat = toChatMessage(message, fromMe ? "You" : thread.name, thread.avatar || undefined);
          set((state) => ({
            threadMessages: { ...state.threadMessages, [thread.id]: [...existing, chat] },
            threads: state.threads.map((t) =>
              t.id === thread.id
                ? { ...t, lastMessage: message.body, timeAgo: "Just now", unreadCount: fromMe ? t.unreadCount : t.unreadCount + 1 }
                : t
            ),
            activeToast: fromMe
              ? state.activeToast
              : {
                  id: message.id,
                  title: message.broadcast_id ? message.body.split("\n")[0] ?? thread.name : thread.name,
                  body: message.body,
                  senderName: thread.name,
                  senderAvatar: thread.avatar,
                  threadId: thread.id,
                  timestamp: "Just now",
                },
          }));
        })
        .subscribe();
    };

    void start();
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        teardown();
        void start();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      teardown();
    };
  },

  sendMessage: async (threadId, text) => {
    const body = text.trim();
    if (!body) return;
    const optimisticId = `pending_${Date.now()}`;
    const optimistic: CrmChatMessage = {
      id: optimisticId,
      threadId,
      senderId: currentUserId ?? "me",
      senderName: "You",
      text: body,
      time: "Just now",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      threadMessages: { ...state.threadMessages, [threadId]: [...(state.threadMessages[threadId] ?? []), optimistic] },
      threads: state.threads.map((t) => (t.id === threadId ? { ...t, lastMessage: body, timeAgo: "Just now" } : t)),
    }));

    const supabase = getSupabase();
    if (!supabase || !currentUserId || get().syncState !== "live") return; // signed-out preview: local only

    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: threadId, body })
      .select("id, created_at")
      .single();

    set((state) => ({
      threadMessages: {
        ...state.threadMessages,
        [threadId]: (state.threadMessages[threadId] ?? []).flatMap((m) => {
          if (m.id !== optimisticId) return [m];
          if (error) return []; // roll back the optimistic bubble
          // Drop it if the Realtime echo already delivered the confirmed row.
          if ((state.threadMessages[threadId] ?? []).some((x) => x.id === data.id)) return [];
          return [{ ...m, id: data.id, createdAt: data.created_at ?? m.createdAt }];
        }),
      },
      lastError: error ? "Message not sent. Check your connection and retry." : state.lastError,
    }));
  },
}));
