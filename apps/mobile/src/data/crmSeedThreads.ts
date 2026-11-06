import type { CrmChatMessage } from "sodia-core";
import type { DMThread } from "../components/sodia/InboxView";

/**
 * Inbox shown while signed out (product preview). Once a user signs in, the
 * store replaces these with their real conversations from Supabase.
 */
export const SIGNED_OUT_THREADS: DMThread[] = [
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

export const SIGNED_OUT_MESSAGES: Record<string, CrmChatMessage[]> = {
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
