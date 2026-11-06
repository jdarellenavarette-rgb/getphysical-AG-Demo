export type InboxChannel = 'GATE_EXPIRATION' | 'AT_RISK' | 'FORM_CHECK' | 'GENERAL_INQUIRY';
export type TagTone = 'accent' | 'danger' | 'info' | 'warning' | 'success';
export type DeliveryStatus = 'sent' | 'sending' | 'failed';

export interface ChatMessage {
  id: string;
  sender: 'athlete' | 'business';
  text: string;
  time: string;
  delivery?: DeliveryStatus;
}

export interface MessageTicket {
  id: string;
  athleteName: string;
  avatar: string;
  handle: string;
  channel: InboxChannel;
  lastMessage: string;
  time: string;
  unread: boolean;
  status: 'OPEN' | 'RESOLVED';
  tag: string;
  tagTone: TagTone;
  athleteMeta: {
    membership: string;
    lastVisit: string;
    primary1RM?: string;
    phone: string;
  };
  messages: ChatMessage[];
}

export type InboxFilter = 'ALL' | 'UNREAD' | InboxChannel;

export const INBOX_FILTERS: readonly { id: InboxFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'UNREAD', label: 'Unread' },
  { id: 'GATE_EXPIRATION', label: 'Turnstile' },
  { id: 'FORM_CHECK', label: 'Coach Reviews' },
  { id: 'AT_RISK', label: 'At-Risk' },
  { id: 'GENERAL_INQUIRY', label: 'General' },
];

export const TAG_BADGE_CLASS: Record<TagTone, string> = {
  accent: 'gp-badge-accent',
  danger: 'gp-badge-danger',
  info: 'gp-badge-info',
  warning: 'gp-badge-warning',
  success: 'gp-badge-success',
};

/** Thread that is bridged to the live Sodia mobile demo account. */
export const LIVE_THREAD_ID = 't_darelle';
export const LIVE_THREAD_META = {
  threadId: 'thread_metro_core',
  targetAthleteId: 'usr_athlete_01',
} as const;
