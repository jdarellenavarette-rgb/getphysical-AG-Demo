import { create } from 'zustand';
import Constants from 'expo-constants';
import { getSodiaSupabaseClient, CrmBroadcast, CrmChatMessage } from 'sodia-core';
import type { DMThread } from '../components/sodia/InboxView';

const getApiBaseUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }
  return 'http://192.168.1.3:3000';
};

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

  // Actions
  initRealtimeSubscription: () => void;
  dismissToast: () => void;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  markThreadAsRead: (threadId: string) => void;
  loadBroadcastHistory: () => Promise<void>;
}

const INITIAL_THREADS: DMThread[] = [
  {
    id: 'thread_metro_core',
    name: 'Metro Core Arena (GymDash)',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Facility Broadcast: Flash 48-Hour Recovery Clinic & Sauna Access',
    timeAgo: 'Just now',
    unreadCount: 1,
    isOnline: true,
    type: 'handshake',
    badgeText: 'GYMDASH CRM',
  },
  {
    id: 'thread_coach_ramos',
    name: 'Coach Miguel Ramos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Shared your Lift PR: View Raw Data (sets, reps & RPE)',
    timeAgo: '12m ago',
    unreadCount: 0,
    isOnline: true,
    type: 'coach',
    badgeText: 'COACH PRO',
  },
  {
    id: 'thread_bgc_pickleball',
    name: 'BGC Pickleball Saturday 3v3',
    avatar: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Dave: Court A booked for 4:00 PM. See everyone there!',
    timeAgo: '3h ago',
    unreadCount: 0,
    isOnline: true,
    type: 'group',
    badgeText: 'GROUP (6)',
  },
  {
    id: 'thread_sarah',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Sent you a 1-day pass for Twins Fitness 🎟️',
    timeAgo: '1d ago',
    unreadCount: 0,
    isOnline: false,
    type: 'direct',
  },
];

const INITIAL_MESSAGES: Record<string, CrmChatMessage[]> = {
  thread_metro_core: [
    {
      id: 'm_seed_core_01',
      threadId: 'thread_metro_core',
      senderId: 'business',
      senderName: 'Metro Core Arena (GymDash)',
      text: 'Welcome Darelle! Flash 48-Hour Recovery Clinic & Sauna Access is now live for all Titanium VIP members. Use code METROVIP2026 at the front desk.',
      time: '08:30 AM',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isCrmBroadcast: true,
      broadcastData: {
        title: 'Flash 48-Hour Recovery Clinic & Sauna Access',
        body: 'Welcome Darelle! Flash 48-Hour Recovery Clinic & Sauna Access is now live for all Titanium VIP members. Use code METROVIP2026 at the front desk.',
        promoCode: 'METROVIP2026',
        suiteMode: 'GYMDASH',
      },
    },
  ],
};

let realtimeChannelRef: any = null;

export const useCrmMessagingStore = create<CrmMessagingState>((set, get) => ({
  threads: INITIAL_THREADS,
  threadMessages: INITIAL_MESSAGES,
  activeToast: null,
  hasSubscribed: false,

  dismissToast: () => set({ activeToast: null }),

  markThreadAsRead: (threadId: string) => {
    set((state) => ({
      threads: state.threads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)),
    }));
  },

  initRealtimeSubscription: () => {
    if (get().hasSubscribed || realtimeChannelRef) return;

    try {
      const client = getSodiaSupabaseClient();
      const channel = client.channel('sodia_crm_broadcasts', {
        config: { broadcast: { self: false } },
      });

      // 1. Listen for CRM Broadcasts sent to ALL or Darelle
      channel.on('broadcast', { event: 'crm_broadcast' }, ({ payload }: { payload: CrmBroadcast }) => {
        if (!payload) return;

        const isTargetedToDarelle =
          payload.audience === 'ALL' ||
          !payload.targetAthleteId ||
          payload.targetAthleteId === 'usr_athlete_01';

        if (!isTargetedToDarelle) return;

        const threadId =
          payload.suiteMode === 'COACHDASH'
            ? 'thread_coach_ramos'
            : payload.suiteMode === 'CLUBDASH'
            ? 'thread_bgc_pickleball'
            : 'thread_metro_core';

        const newMsg: CrmChatMessage = {
          id: `crm_msg_${payload.id || Date.now()}`,
          threadId,
          senderId: 'business',
          senderName: payload.senderName || 'Metro Core Arena (GymDash)',
          senderAvatar: payload.senderAvatar,
          text: `${payload.title}\n\n${payload.body}`,
          time: 'Just now',
          createdAt: payload.createdAt || new Date().toISOString(),
          isCrmBroadcast: true,
          broadcastData: {
            title: payload.title,
            body: payload.body,
            promoCode: payload.promoCode,
            suiteMode: payload.suiteMode,
          },
        };

        set((state) => {
          const currentThreadMsgs = state.threadMessages[threadId] || [];
          const updatedMessages = {
            ...state.threadMessages,
            [threadId]: [...currentThreadMsgs, newMsg],
          };

          const updatedThreads = state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  lastMessage: `📢 ${payload.title}`,
                  timeAgo: 'Just now',
                  unreadCount: t.unreadCount + 1,
                  badgeText: payload.badgeText || t.badgeText,
                }
              : t
          );

          return {
            threads: updatedThreads,
            threadMessages: updatedMessages,
            activeToast: {
              id: `toast_${Date.now()}`,
              title: payload.title,
              body: payload.body,
              senderName: payload.senderName,
              senderAvatar: payload.senderAvatar,
              threadId,
              promoCode: payload.promoCode,
              timestamp: 'Just now',
            },
          };
        });
      });

      // 2. Listen for Direct CRM Responses from the Business Suite
      channel.on('broadcast', { event: 'crm_direct' }, ({ payload }: any) => {
        if (!payload) return;
        const threadId = payload.threadId || 'thread_metro_core';
        const newMsg: CrmChatMessage = {
          id: `crm_direct_${Date.now()}`,
          threadId,
          senderId: 'business',
          senderName: payload.senderName || 'Business Suite Support',
          text: payload.text || '',
          time: 'Just now',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          threadMessages: {
            ...state.threadMessages,
            [threadId]: [...(state.threadMessages[threadId] || []), newMsg],
          },
          threads: state.threads.map((t) =>
            t.id === threadId
              ? { ...t, lastMessage: payload.text, timeAgo: 'Just now', unreadCount: t.unreadCount + 1 }
              : t
          ),
          activeToast: {
            id: `toast_${Date.now()}`,
            title: payload.senderName || 'Business Suite',
            body: payload.text,
            senderName: payload.senderName || 'Business Suite',
            senderAvatar: payload.senderAvatar || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
            threadId,
            timestamp: 'Just now',
          },
        }));
      });

      channel.subscribe();
      realtimeChannelRef = channel;
      set({ hasSubscribed: true });
    } catch (err) {
      console.warn('[CRM Realtime Subscribe Error]:', err);
    }

    // Also fetch any missed historical broadcasts
    get().loadBroadcastHistory();
  },

  sendMessage: async (threadId: string, text: string) => {
    if (!text.trim()) return;

    const replyMsg: CrmChatMessage = {
      id: `msg_reply_${Date.now()}`,
      threadId,
      senderId: 'usr_athlete_01',
      senderName: 'Darelle Navarette',
      text: text.trim(),
      time: 'Just now',
      createdAt: new Date().toISOString(),
    };

    // Optimistically update local store
    set((state) => {
      const msgs = state.threadMessages[threadId] || [];
      return {
        threadMessages: {
          ...state.threadMessages,
          [threadId]: [...msgs, replyMsg],
        },
        threads: state.threads.map((t) =>
          t.id === threadId ? { ...t, lastMessage: text.trim(), timeAgo: 'Just now' } : t
        ),
      };
    });

    // 1. Dispatch over Supabase Realtime channel
    try {
      const client = getSodiaSupabaseClient();
      const channel = client.channel('sodia_crm_broadcasts');
      await channel.send({
        type: 'broadcast',
        event: 'crm_reply',
        payload: {
          id: replyMsg.id,
          threadId,
          senderId: 'usr_athlete_01',
          senderName: 'Darelle Navarette',
          senderHandle: '@darellenavarette',
          text: replyMsg.text,
          time: 'Just now',
          createdAt: replyMsg.createdAt,
        },
      });
    } catch (err) {
      console.warn('[CRM Send Realtime Error]:', err);
    }

    // 2. HTTP POST fallback to web server
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/crm/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          senderId: 'usr_athlete_01',
          senderName: 'Darelle Navarette',
          text: replyMsg.text,
        }),
      });
    } catch {
      // Ignored if offline
    }
  },

  loadBroadcastHistory: async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/crm/broadcast`);
      if (res.ok) {
        const json = await res.json();
        if (json.broadcasts && Array.isArray(json.broadcasts)) {
          // Verify any non-existing broadcast is added
          const bcs: CrmBroadcast[] = json.broadcasts;
          set((state) => {
            const threadId = 'thread_metro_core';
            const existingMsgs = state.threadMessages[threadId] || [];
            const newToAdd: CrmChatMessage[] = [];

            for (const bc of bcs) {
              const alreadyHas = existingMsgs.some(
                (m) => m.broadcastData?.title === bc.title || m.text.includes(bc.title)
              );
              if (!alreadyHas) {
                newToAdd.push({
                  id: `hist_bc_${bc.id}`,
                  threadId,
                  senderId: 'business',
                  senderName: bc.senderName,
                  senderAvatar: bc.senderAvatar,
                  text: `${bc.title}\n\n${bc.body}`,
                  time: 'Recent',
                  createdAt: bc.createdAt,
                  isCrmBroadcast: true,
                  broadcastData: {
                    title: bc.title,
                    body: bc.body,
                    promoCode: bc.promoCode,
                    suiteMode: bc.suiteMode,
                  },
                });
              }
            }

            if (newToAdd.length === 0) return state;

            return {
              threadMessages: {
                ...state.threadMessages,
                [threadId]: [...existingMsgs, ...newToAdd],
              },
            };
          });
        }
      }
    } catch {
      // Fallback silent
    }
  },
}));
