import type { CrmChatMessage } from "sodia-core";
import type { DMThread } from "../components/sodia/InboxView";

/**
 * Inbox shown while signed out (product preview). Once a user signs in, the
 * store replaces these with their real conversations from Supabase.
 */
export const SIGNED_OUT_THREADS: DMThread[] = [
  {
    id: "thread_metro_core",
    name: "Metro Core Arena",
    avatar: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80",
    lastMessage: "📢 Flash 48-Hour Recovery Clinic & Sauna Access",
    timeAgo: "2h ago",
    unreadCount: 1,
    isOnline: true,
    type: "facility",
    badgeText: "FACILITY",
  },
  {
    id: "thread_coach_ramos",
    name: "Coach Miguel Ramos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    lastMessage: "Bar path looked clean. Add 2.5 kg next week.",
    timeAgo: "12m ago",
    unreadCount: 0,
    isOnline: true,
    type: "coach",
    badgeText: "COACH PRO",
  },
  {
    id: "thread_bgc_pickleball",
    name: "BGC Pickleball Saturday 3v3",
    avatar: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=200&q=80",
    lastMessage: "Dave: Court A booked for 4:00 PM. See everyone there!",
    timeAgo: "3h ago",
    unreadCount: 0,
    isOnline: true,
    type: "group",
    badgeText: "GROUP (6)",
  },
  {
    id: "thread_sarah",
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    lastMessage: "Sent you a 1-day pass for Metro Core Arena 🎟️",
    timeAgo: "1d ago",
    unreadCount: 0,
    isOnline: false,
    type: "direct",
  },
];

const minutesAgo = (minutes: number): string => new Date(Date.now() - minutes * 60_000).toISOString();

function line(
  threadId: string,
  index: number,
  senderId: string,
  senderName: string,
  text: string,
  time: string,
  minutes: number,
): CrmChatMessage {
  return {
    id: `m_seed_${threadId}_${index}`,
    threadId,
    senderId,
    senderName,
    text,
    time,
    createdAt: minutesAgo(minutes),
  };
}

export const SIGNED_OUT_MESSAGES: Record<string, CrmChatMessage[]> = {
  thread_coach_ramos: [
    line("thread_coach_ramos", 1, "me", "You", "Sent you this morning's deadlift video.", "25m ago", 25),
    line("thread_coach_ramos", 2, "usr_coach_miguel", "Coach Miguel Ramos", "Got it. Watching now.", "20m ago", 20),
    line(
      "thread_coach_ramos",
      3,
      "usr_coach_miguel",
      "Coach Miguel Ramos",
      "Bar path looked clean. Add 2.5 kg next week.",
      "12m ago",
      12,
    ),
  ],
  thread_bgc_pickleball: [
    line("thread_bgc_pickleball", 1, "usr_group_bea", "Bea", "Are we still on for Saturday?", "4h ago", 240),
    line("thread_bgc_pickleball", 2, "me", "You", "I'm in. Who is booking?", "4h ago", 235),
    line(
      "thread_bgc_pickleball",
      3,
      "usr_group_dave",
      "Dave",
      "Court A booked for 4:00 PM. See everyone there!",
      "3h ago",
      180,
    ),
  ],
  thread_sarah: [
    line(
      "thread_sarah",
      1,
      "usr_sarah",
      "Sarah Jenkins",
      "Sent you a 1-day pass for Metro Core Arena 🎟️",
      "1d ago",
      1440,
    ),
  ],
  thread_metro_core: [
    {
      id: "m_seed_core_01",
      threadId: "thread_metro_core",
      senderId: "business",
      senderName: "Metro Core Arena",
      text: "Welcome Darelle! Flash 48-Hour Recovery Clinic & Sauna Access is now live for all Titanium VIP members. Use code METROVIP2026 at the front desk.",
      time: "2h ago",
      createdAt: minutesAgo(120),
      isCrmBroadcast: true,
      broadcastData: {
        title: "Flash 48-Hour Recovery Clinic & Sauna Access",
        body: "Welcome Darelle! Flash 48-Hour Recovery Clinic & Sauna Access is now live for all Titanium VIP members. Use code METROVIP2026 at the front desk.",
        promoCode: "METROVIP2026",
        suiteMode: "GYMDASH",
      },
    },
  ],
};
