'use client';

import React, { useCallback, useRef, useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { createEmptyState } from 'sodia-core/states';
import type { SuiteMode } from '../../lib/suite-routes';
import { BROADCAST_SENDERS } from '../../lib/broadcast-senders';
import { useNetworkStatus } from '../../lib/use-network-status';
import { CreateMessageModal } from './CreateMessageModal';
import { StateView } from '../ui/StateView';
import { ThreadList } from '../crm/ThreadList';
import { ThreadView } from '../crm/ThreadView';
import { useInbox } from '../crm/useInbox';
import { useInboxKeyboard } from '../crm/useInboxKeyboard';
import { useReplySender } from '../crm/useReplySender';
import type { MessageTicket } from '../crm/types';

interface AthleticInboxCRMViewProps {
  suiteMode: SuiteMode;
  initialTickets: readonly MessageTicket[];
}

/** Unified athletic inbox (Intercom/Front-style): filters, debounced search, unread counts, j/k navigation. */
export function AthleticInboxCRMView({ suiteMode, initialTickets }: AthleticInboxCRMViewProps) {
  const inbox = useInbox(initialTickets);
  const network = useNetworkStatus();
  const offline = network === 'offline';
  const sender = useReplySender(inbox.dispatch, BROADCAST_SENDERS[suiteMode].name);
  const [composeOpen, setComposeOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');
  const searchRef = useRef<HTMLInputElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const focusThread = useCallback((id: string | null) => {
    if (id) requestAnimationFrame(() => document.getElementById(`gp-thread-${id}`)?.focus());
  }, []);

  useInboxKeyboard({
    onNext: () => focusThread(inbox.move(1)),
    onPrev: () => focusThread(inbox.move(-1)),
    onFocusSearch: () => searchRef.current?.focus(),
    onFocusReply: () => {
      setMobileView('thread');
      requestAnimationFrame(() => replyRef.current?.focus());
    },
  });

  const open = (id: string) => {
    inbox.select(id);
    setMobileView('thread');
  };

  const selected = inbox.selected;
  const { status, errorCode, retry } = inbox.realtime;

  return (
    <>
      {(offline || status === 'error') && (
        <div className={`gp-notice ${offline ? 'gp-notice-warning' : 'gp-notice-danger'}`} role="status" style={{ marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <WifiOff size={16} aria-hidden="true" />
          <span style={{ flex: 1 }}>
            {offline
              ? 'Offline — showing cached conversations. New athlete replies will appear when you reconnect.'
              : `Live sync with the Sodia app is interrupted. Conversations below may be out of date. Reference: ${errorCode ?? 'GP-503'}`}
          </span>
          {!offline && (
            <button type="button" className="gp-btn gp-btn-secondary gp-btn-sm" onClick={retry}>
              <RefreshCw size={13} aria-hidden="true" /> Retry
            </button>
          )}
        </div>
      )}
      <div className="gp-card gp-inbox" data-view={mobileView}>
        <ThreadList ref={searchRef} inbox={inbox} onOpen={open} onCompose={() => setComposeOpen(true)} />
        {selected ? (
          <ThreadView
            ref={replyRef}
            ticket={selected}
            offline={offline}
            onBack={() => setMobileView('list')}
            onSend={(text) => sender.send(selected, text)}
            onRetry={(messageId) => sender.retry(selected, messageId)}
            onRenew={() => inbox.dispatch({ type: 'renewPass', id: selected.id })}
            onVerify={() => sender.send(selected, '1RM verified ✓ — your PR stamp is now on your Sodia profile.')}
            onToggleResolved={() => inbox.dispatch({ type: 'setStatus', id: selected.id, status: selected.status === 'OPEN' ? 'RESOLVED' : 'OPEN' })}
            onMarkUnread={() => {
              inbox.dispatch({ type: 'markUnread', id: selected.id });
              setMobileView('list');
            }}
          />
        ) : (
          <div className="gp-inbox-thread">
            <StateView state={createEmptyState('Pick a conversation on the left to read and reply.', 'Open newest')} emptyTitle="No conversation selected" onPrimaryAction={() => inbox.visible[0] && open(inbox.visible[0].id)} />
          </div>
        )}
      </div>
      <p className="gp-sr-only" aria-live="polite">
        {status === 'live' ? 'Live sync connected.' : ''}
      </p>
      <CreateMessageModal visible={composeOpen} onClose={() => setComposeOpen(false)} suiteMode={suiteMode} />
    </>
  );
}
