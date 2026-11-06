'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Mail, RefreshCw, RotateCcw, Send, Zap } from 'lucide-react';
import { ThreadAvatar } from './ThreadList';
import { TAG_BADGE_CLASS, type ChatMessage, type MessageTicket } from './types';

interface ThreadViewProps {
  ticket: MessageTicket;
  offline: boolean;
  onBack: () => void;
  onSend: (text: string) => boolean;
  onRetry: (messageId: string) => void;
  onRenew: () => void;
  onVerify: () => void;
  onToggleResolved: () => void;
  onMarkUnread: () => void;
}

function DeliveryLabel({ message, onRetry }: { message: ChatMessage; onRetry: () => void }) {
  if (message.delivery === 'sending') {
    return (
      <span className="gp-row" style={{ gap: 4 }}>
        <Clock size={11} aria-hidden="true" /> Sending…
      </span>
    );
  }
  if (message.delivery === 'failed') {
    return (
      <button type="button" onClick={onRetry} className="gp-row" style={{ gap: 4, color: '#FFFFFF', textDecoration: 'underline', fontSize: 11, fontWeight: 800 }}>
        <AlertCircle size={11} aria-hidden="true" /> Not delivered · Retry
      </button>
    );
  }
  return <span>{message.time}</span>;
}

/** Right column: conversation, quick automations and reply composer. */
export const ThreadView = forwardRef<HTMLTextAreaElement, ThreadViewProps>(function ThreadView(
  { ticket, offline, onBack, onSend, onRetry, onRenew, onVerify, onToggleResolved, onMarkUnread },
  replyRef
) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [ticket.id, ticket.messages.length]);

  const submit = () => {
    if (offline) return;
    if (onSend(draft)) setDraft('');
  };

  return (
    <section className="gp-inbox-thread" aria-label={`Conversation with ${ticket.athleteName}`}>
      <header className="gp-row-between" style={{ padding: '14px 20px', borderBottom: '1px solid var(--gp-border-color)', backgroundColor: 'var(--gp-bg-card-secondary)' }}>
        <div className="gp-row" style={{ gap: 12, minWidth: 0 }}>
          <button type="button" className="gp-icon-btn gp-inbox-back" onClick={onBack} aria-label="Back to conversations">
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <ThreadAvatar ticket={ticket} size={38} />
          <div style={{ minWidth: 0 }}>
            <div className="gp-row" style={{ flexWrap: 'wrap', gap: 6 }}>
              <h2 style={{ fontSize: 15, fontWeight: 900, color: 'var(--gp-text-primary)' }}>{ticket.athleteName}</h2>
              <span className={`gp-badge ${TAG_BADGE_CLASS[ticket.tagTone]}`} style={{ borderRadius: 4 }}>
                {ticket.tag}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--gp-text-secondary)', marginTop: 2, fontWeight: 600 }}>
              {ticket.athleteMeta.membership} • Last visit: {ticket.athleteMeta.lastVisit} • {ticket.athleteMeta.phone}
            </p>
          </div>
        </div>
        <div className="gp-row" style={{ flexWrap: 'wrap' }}>
          {ticket.channel === 'GATE_EXPIRATION' && ticket.status === 'OPEN' && (
            <button type="button" className="gp-btn gp-btn-success gp-btn-sm" onClick={onRenew}>
              <CheckCircle size={14} aria-hidden="true" /> Approve pass
            </button>
          )}
          {ticket.channel === 'FORM_CHECK' && (
            <button type="button" className="gp-btn gp-btn-info gp-btn-sm" onClick={onVerify}>
              <Zap size={14} aria-hidden="true" /> Verify 1RM
            </button>
          )}
          <button type="button" className="gp-btn gp-btn-secondary gp-btn-sm" onClick={onMarkUnread}>
            <Mail size={14} aria-hidden="true" /> Mark unread
          </button>
          <button type="button" className="gp-btn gp-btn-secondary gp-btn-sm" onClick={onToggleResolved}>
            {ticket.status === 'OPEN' ? <CheckCircle size={14} aria-hidden="true" /> : <RotateCcw size={14} aria-hidden="true" />}
            {ticket.status === 'OPEN' ? 'Resolve' : 'Reopen'}
          </button>
        </div>
      </header>

      <ol style={{ flex: 1, minHeight: 0, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none' }} aria-label="Messages">
        {ticket.messages.map((m) => {
          const isBiz = m.sender === 'business';
          const failed = m.delivery === 'failed';
          return (
            <li
              key={m.id}
              style={{
                alignSelf: isBiz ? 'flex-end' : 'flex-start',
                maxWidth: 'min(75%, 560px)',
                backgroundColor: isBiz ? (failed ? 'var(--gp-danger)' : 'var(--gp-accent)') : 'var(--gp-bg-card-secondary)',
                color: isBiz ? 'var(--gp-text-on-accent)' : 'var(--gp-text-primary)',
                borderRadius: 16,
                padding: '10px 14px',
                border: isBiz ? 'none' : '1px solid var(--gp-border-color)',
                opacity: m.delivery === 'sending' ? 0.75 : 1,
              }}
            >
              <span className="gp-sr-only">{isBiz ? 'You' : ticket.athleteName}: </span>
              <p style={{ fontSize: 14, lineHeight: '20px', fontWeight: isBiz ? 600 : 500, overflowWrap: 'anywhere' }}>{m.text}</p>
              <div style={{ fontSize: 11, marginTop: 4, textAlign: 'right', fontWeight: 600, display: 'flex', justifyContent: 'flex-end', color: isBiz ? 'rgba(255,255,255,0.9)' : 'var(--gp-text-muted)' }}>
                <DeliveryLabel message={m} onRetry={() => onRetry(m.id)} />
              </div>
            </li>
          );
        })}
        <li ref={bottomRef} aria-hidden="true" />
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        style={{ padding: '14px 20px', borderTop: '1px solid var(--gp-border-color)', backgroundColor: 'var(--gp-bg-card-secondary)', display: 'flex', gap: 10, alignItems: 'flex-end' }}
      >
        <label htmlFor="gp-reply" className="gp-sr-only">
          Reply to {ticket.athleteName}
        </label>
        <textarea
          ref={replyRef}
          id="gp-reply"
          className="gp-input"
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
            if (e.key === 'Escape') e.currentTarget.blur();
          }}
          placeholder={offline ? 'Offline — reconnect to send replies' : 'Write a reply… (Enter to send, Shift+Enter for new line)'}
          aria-describedby={offline ? 'gp-reply-offline' : undefined}
          style={{ flex: 1, resize: 'none', minHeight: 44, maxHeight: 140 }}
        />
        <button type="submit" className="gp-btn gp-btn-primary" disabled={offline || draft.trim() === ''} style={{ minHeight: 44 }}>
          {offline ? <RefreshCw size={15} aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
          <span>Send</span>
        </button>
        {offline && (
          <span id="gp-reply-offline" className="gp-sr-only">
            You are offline. Replies are disabled until the connection returns.
          </span>
        )}
      </form>
    </section>
  );
});
