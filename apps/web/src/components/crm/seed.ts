import type { MessageTicket } from './types';

/** Seed threads (until the CRM tickets table ships); live replies merge in via realtime + server store. */
export const INITIAL_TICKETS: readonly MessageTicket[] = [
  {
    id: 't_darelle',
    athleteName: 'Darelle Navarette',
    avatar: 'DN',
    handle: '@darellenavarette',
    channel: 'GENERAL_INQUIRY',
    lastMessage: 'IFBB Certified Trainer • Titanium VIP Member connected via Sodia Messaging.',
    time: 'Just now',
    unread: false,
    status: 'OPEN',
    tag: 'IFBB Certified Trainer',
    tagTone: 'accent',
    athleteMeta: {
      membership: 'Titanium VIP All-Access • IFBB Pro Trainer',
      lastVisit: 'Today at BGC High Street Arena',
      primary1RM: 'Deadlift 225kg PR (Verified)',
      phone: '+63 917 888 1994',
    },
    messages: [
      { id: 'seed_1', sender: 'business', text: 'Welcome Darelle! Your IFBB Trainer credential and facility all-access pass are active.', time: '08:00 AM' },
    ],
  },
  {
    id: 't1',
    athleteName: 'Jake Torralba',
    avatar: 'JT',
    handle: '@jake.torralba',
    channel: 'GATE_EXPIRATION',
    lastMessage: 'Turnstile access denied: Pass expired 2 days ago. Sent 1-click renewal prompt.',
    time: '10:42 AM',
    unread: true,
    status: 'OPEN',
    tag: 'Turnstile Denial',
    tagTone: 'danger',
    athleteMeta: {
      membership: 'Expired VIP All-Access',
      lastVisit: 'Today at Gate 01 (Denied)',
      primary1RM: 'Bench 120kg',
      phone: '+63 917 555 0192',
    },
    messages: [
      { id: 'seed_2', sender: 'business', text: 'Turnstile Alert: Your 60s dynamic pass expired on Nov 2. Would you like to renew with your saved Maya account?', time: '10:40 AM' },
      { id: 'seed_3', sender: 'athlete', text: 'Hey, I am at the front desk right now, can you approve a renewal pass?', time: '10:42 AM' },
    ],
  },
  {
    id: 't2',
    athleteName: 'Marcus Cruz',
    avatar: 'MC',
    handle: '@marcus.cruz',
    channel: 'FORM_CHECK',
    lastMessage: 'Uploaded video: 180kg Squat 1RM attempt for PR review.',
    time: '09:15 AM',
    unread: true,
    status: 'OPEN',
    tag: 'Coach Review',
    tagTone: 'info',
    athleteMeta: {
      membership: '12-Wk Strength Peak Client',
      lastVisit: 'Yesterday (Leg Power Cycle)',
      primary1RM: 'Squat 180kg Attempt',
      phone: '+63 920 888 3412',
    },
    messages: [
      { id: 'seed_4', sender: 'athlete', text: 'Coach, just logged my 180kg squat set in the app with the video clip attached. Depth was borderline, check my hips.', time: '09:15 AM' },
    ],
  },
  {
    id: 't3',
    athleteName: 'Alyssa Ramos',
    avatar: 'AR',
    handle: '@alyssa.runs',
    channel: 'AT_RISK',
    lastMessage: 'Automated CRM trigger: Absent 14 days from regular court slots.',
    time: 'Yesterday',
    unread: false,
    status: 'OPEN',
    tag: 'At-Risk Win-Back',
    tagTone: 'warning',
    athleteMeta: {
      membership: 'Hyrox & Padel Member',
      lastVisit: '14 days ago',
      primary1RM: '5km Pace 21:40',
      phone: '+63 918 333 9921',
    },
    messages: [
      { id: 'seed_5', sender: 'business', text: 'Hey Alyssa, we missed you at the track! Here is an exclusive 30% recovery court voucher for this weekend.', time: 'Yesterday' },
      { id: 'seed_6', sender: 'athlete', text: 'Thanks! Had a mild ankle sprain, resuming light drills this Saturday.', time: 'Yesterday' },
    ],
  },
  {
    id: 't4',
    athleteName: 'Metro Padel League',
    avatar: 'MP',
    handle: '@metropadel.org',
    channel: 'GENERAL_INQUIRY',
    lastMessage: 'Requested parent court lock for Saturday Tournament Quarterfinals.',
    time: 'Nov 2',
    unread: false,
    status: 'RESOLVED',
    tag: 'Organizer League',
    tagTone: 'success',
    athleteMeta: {
      membership: 'Affiliated League Host',
      lastVisit: 'Nov 1 (Spatial Booking Confirmed)',
      phone: '+63 915 222 7701',
    },
    messages: [
      { id: 'seed_7', sender: 'athlete', text: 'Can we reserve Court Alpha and Beta with 20-min buffers instead of 15-min?', time: 'Nov 2' },
      { id: 'seed_8', sender: 'business', text: 'Approved! Buffers updated in Clubdash Spatial Engine.', time: 'Nov 2' },
    ],
  },
];

/** Merges athlete replies captured by the server store (mobile HTTP fallback) into the live thread. */
export function mergeStoredReplies(
  tickets: readonly MessageTicket[],
  replies: readonly { id: string; senderName: string; text: string; time: string }[]
): MessageTicket[] {
  if (replies.length === 0) return [...tickets];
  return tickets.map((t) => {
    const mine = replies.filter((r) => r.senderName === t.athleteName);
    if (mine.length === 0) return t;
    const last = mine[mine.length - 1]!;
    return {
      ...t,
      messages: [...t.messages, ...mine.map((r) => ({ id: r.id, sender: 'athlete' as const, text: r.text, time: r.time }))],
      lastMessage: last.text,
      time: last.time,
      unread: true,
    };
  });
}
