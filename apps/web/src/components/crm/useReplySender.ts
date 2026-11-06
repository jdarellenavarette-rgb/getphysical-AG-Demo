'use client';

import { useCallback, useTransition, type Dispatch } from 'react';
import { sendDirectMessageAction } from '../../app/actions/crm';
import type { InboxAction } from './inboxReducer';
import { LIVE_THREAD_ID, LIVE_THREAD_META, type MessageTicket } from './types';

/** Optimistic reply: append as "sending", then confirm or mark failed (retryable) based on the Server Action. */
export function useReplySender(dispatch: Dispatch<InboxAction>, senderName: string) {
  const [pending, startTransition] = useTransition();

  const deliver = useCallback(
    (ticket: MessageTicket, messageId: string, text: string) => {
      if (ticket.id !== LIVE_THREAD_ID) {
        dispatch({ type: 'delivery', id: ticket.id, messageId, delivery: 'sent' });
        return;
      }
      startTransition(async () => {
        try {
          const res = await sendDirectMessageAction({ ...LIVE_THREAD_META, senderName, text });
          dispatch({ type: 'delivery', id: ticket.id, messageId, delivery: res.ok && res.delivered ? 'sent' : 'failed' });
        } catch {
          dispatch({ type: 'delivery', id: ticket.id, messageId, delivery: 'failed' });
        }
      });
    },
    [dispatch, senderName]
  );

  const send = useCallback(
    (ticket: MessageTicket, rawText: string) => {
      const text = rawText.trim();
      if (!text) return false;
      const messageId = `biz_${Date.now()}`;
      dispatch({ type: 'appendBusiness', id: ticket.id, message: { id: messageId, sender: 'business', text, time: 'Just now', delivery: 'sending' } });
      deliver(ticket, messageId, text);
      return true;
    },
    [dispatch, deliver]
  );

  const retry = useCallback(
    (ticket: MessageTicket, messageId: string) => {
      const msg = ticket.messages.find((m) => m.id === messageId);
      if (!msg) return;
      dispatch({ type: 'delivery', id: ticket.id, messageId, delivery: 'sending' });
      deliver(ticket, messageId, msg.text);
    },
    [dispatch, deliver]
  );

  return { send, retry, pending };
}
