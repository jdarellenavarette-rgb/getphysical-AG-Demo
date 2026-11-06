import type { SuiteMode } from './suite-routes';

export const BROADCAST_SENDERS: Record<SuiteMode, { name: string; avatar: string }> = {
  GYMDASH: {
    name: 'Metro Core Arena (GymDash)',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
  },
  CLUBDASH: {
    name: 'ClubDash Facility Broadcast',
    avatar: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=200&q=80',
  },
  COACHDASH: {
    name: 'Coach Miguel Ramos (Studio)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  ORGANIZERDASH: {
    name: 'Metro Padel & Tournament Desk',
    avatar: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=200&q=80',
  },
};
