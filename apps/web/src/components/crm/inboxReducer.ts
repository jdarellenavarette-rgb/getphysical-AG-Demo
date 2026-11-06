import type { CrmBroadcast } from 'sodia-core';
import { LIVE_THREAD_ID, type ChatMessage, type DeliveryStatus, type MessageTicket } from './types';
import type { IncomingReply } from './useCrmRealtime';

export type InboxAction =
  | { type: 'select'; id: string }
  | { type: 'markUnread'; id: string }
  | { type: 'reply'; reply: IncomingReply; receivedAt: number }
  | { type: 'broadcast'; broadcast: CrmBroadcast }
  | { type: 'appendBusiness'; id: string; message: ChatMessage }
  | { type: 'delivery'; id: string; messageId: string; delivery: DeliveryStatus }
  | { type: 'setStatus'; id: string; status: MessageTicket['status'] }
  | { type: 'renewPass'; id: string };

export interface InboxState {
  tickets: MessageTicket[];
  selectedId: string;
  /** `${sender}|${text}` → epoch ms, used to drop the duplicate realtime + HTTP echo of one reply. */
  recentReplies: Record<string, number>;
}

const DEDUPE_WINDOW_MS = 15_000;

function updateTicket(state: InboxState, id: string, fn: (t: MessageTicket) => MessageTicket): InboxState {
  return { ...state, tickets: state.tickets.map((t) => (t.id === id ? fn(t) : t)) };
}

function bump(tickets: MessageTicket[], id: string): MessageTicket[] {
  const target = tickets.find((t) => t.id === id);
  return target ? [target, ...tickets.filter((t) => t.id !== id)] : tickets;
}

export function inboxReducer(state: InboxState, action: InboxAction): InboxState {
  switch (action.type) {
    case 'select':
      return { ...updateTicket(state, action.id, (t) => ({ ...t, unread: false })), selectedId: action.id };
    case 'markUnread':
      return updateTicket(state, action.id, (t) => ({ ...t, unread: true }));
    case 'reply': {
      const { reply, receivedAt } = action;
      const key = `${reply.senderName ?? ''}|${reply.text}`;
      const seen = state.recentReplies[key];
      if (seen !== undefined && receivedAt - seen < DEDUPE_WINDOW_MS) return state;
      const target =
        state.tickets.find((t) => t.athleteName === reply.senderName || t.handle === reply.senderHandle) ??
        state.tickets.find((t) => t.id === LIVE_THREAD_ID);
      if (!target) return state;
      const msg: ChatMessage = { id: reply.id ?? `rt_${receivedAt}`, sender: 'athlete', text: reply.text, time: reply.time ?? 'Just now' };
      const next = updateTicket(state, target.id, (t) => ({
        ...t,
        messages: [...t.messages, msg],
        lastMessage: reply.text,
        unread: state.selectedId !== t.id,
        status: 'OPEN',
        time: 'Just now',
      }));
      return { ...next, tickets: bump(next.tickets, target.id), recentReplies: { ...state.recentReplies, [key]: receivedAt } };
    }
    case 'broadcast': {
      const bc = action.broadcast;
      const target = state.tickets.find((t) => t.id === LIVE_THREAD_ID);
      if (!target || target.messages.some((m) => m.id === bc.id)) return state;
      const text = `[Broadcast: ${bc.title}] ${bc.body}${bc.promoCode ? ` (Promo: ${bc.promoCode})` : ''}`;
      return updateTicket(state, target.id, (t) => ({
        ...t,
        messages: [...t.messages, { id: bc.id, sender: 'business', text, time: 'Just now', delivery: 'sent' }],
        lastMessage: `Broadcast: ${bc.title}`,
        time: 'Just now',
      }));
    }
    case 'appendBusiness': {
      const next = updateTicket(state, action.id, (t) => ({
        ...t,
        messages: [...t.messages, action.message],
        lastMessage: action.message.text,
        unread: false,
        time: 'Just now',
      }));
      return { ...next, tickets: bump(next.tickets, action.id) };
    }
    case 'delivery':
      return updateTicket(state, action.id, (t) => ({
        ...t,
        messages: t.messages.map((m) => (m.id === action.messageId ? { ...m, delivery: action.delivery } : m)),
      }));
    case 'setStatus':
      return updateTicket(state, action.id, (t) => ({ ...t, status: action.status }));
    case 'renewPass':
      return updateTicket(state, action.id, (t) => ({
        ...t,
        messages: [
          ...t.messages,
          { id: `renew_${t.messages.length}`, sender: 'business', text: 'Digital pass provisioned! Turnstile Gate 01 is cleared for 30 days.', time: 'Just now', delivery: 'sent' },
        ],
        status: 'RESOLVED',
        tag: 'Resolved (Renewed)',
        tagTone: 'success',
      }));
  }
}
