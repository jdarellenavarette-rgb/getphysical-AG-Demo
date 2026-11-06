'use client';

import React, { forwardRef } from 'react';
import { Loader2, Megaphone, MessageSquare, Search, X } from 'lucide-react';
import { StateView } from '../ui/StateView';
import { INBOX_FILTERS, TAG_BADGE_CLASS, type InboxFilter, type MessageTicket } from './types';
import type { useInbox } from './useInbox';

type Inbox = ReturnType<typeof useInbox>;

function Avatar({ ticket, size = 32 }: { ticket: MessageTicket; size?: number }) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: 'var(--gp-bg-card-tertiary)',
    color: 'var(--gp-text-primary)',
    fontSize: 11,
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  };
  return ticket.id === 't_darelle' ? (
    <img src="/profiles/darelle/avatar.png" alt="" width={size} height={size} style={{ ...style, objectFit: 'cover' }} />
  ) : (
    <span aria-hidden="true" style={style}>
      {ticket.avatar}
    </span>
  );
}

export { Avatar as ThreadAvatar };

interface ThreadListProps {
  inbox: Inbox;
  onOpen: (id: string) => void;
  onCompose: () => void;
}

/** Left column: search, channel filters with unread counts, and the thread list (with all list states). */
export const ThreadList = forwardRef<HTMLInputElement, ThreadListProps>(function ThreadList({ inbox, onOpen, onCompose }, searchRef) {
  const clearSearch = () => {
    inbox.setQuery('');
    if (searchRef && typeof searchRef !== 'function') searchRef.current?.focus();
  };

  return (
    <div className="gp-inbox-list">
      <div style={{ padding: 16, borderBottom: '1px solid var(--gp-border-color)', backgroundColor: 'var(--gp-bg-card)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="gp-row-between" style={{ flexWrap: 'nowrap' }}>
          <h2 className="gp-row" style={{ fontSize: 16, fontWeight: 900, color: 'var(--gp-text-primary)' }}>
            <MessageSquare size={18} color="var(--gp-accent)" aria-hidden="true" />
            Inbox
            {inbox.totalUnread > 0 && (
              <span className="gp-chip-count" aria-label={`${inbox.totalUnread} unread`}>
                {inbox.totalUnread}
              </span>
            )}
          </h2>
          <button type="button" className="gp-btn gp-btn-primary gp-btn-sm" onClick={onCompose} aria-haspopup="dialog">
            <Megaphone size={13} aria-hidden="true" /> Broadcast
          </button>
        </div>

        <div role="search" style={{ position: 'relative' }}>
          <label htmlFor="gp-inbox-search" className="gp-sr-only">
            Search conversations
          </label>
          <Search size={14} aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gp-text-muted)' }} />
          <input
            ref={searchRef}
            id="gp-inbox-search"
            className="gp-input"
            type="search"
            value={inbox.query}
            onChange={(e) => inbox.setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                if (inbox.query) inbox.setQuery('');
                else e.currentTarget.blur();
              }
              if (e.key === 'Enter' && inbox.visible[0]) onOpen(inbox.visible[0].id);
            }}
            placeholder="Search name, handle, message…"
            aria-describedby="gp-inbox-shortcuts"
            style={{ paddingLeft: 34, paddingRight: 36 }}
          />
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
            {inbox.isSearchPending ? (
              <Loader2 size={14} aria-hidden="true" color="var(--gp-text-muted)" />
            ) : inbox.query ? (
              <button type="button" onClick={clearSearch} aria-label="Clear search" style={{ display: 'flex', color: 'var(--gp-text-muted)' }}>
                <X size={14} aria-hidden="true" />
              </button>
            ) : (
              <kbd className="gp-kbd" aria-hidden="true">/</kbd>
            )}
          </span>
        </div>

        <div className="gp-scroll-x" role="group" aria-label="Filter by channel">
          {INBOX_FILTERS.map((f) => {
            const count = inbox.counts[f.id];
            return (
              <button key={f.id} type="button" className="gp-chip" aria-pressed={inbox.filter === f.id} onClick={() => inbox.setFilter(f.id satisfies InboxFilter)}>
                {f.label}
                {count > 0 && (
                  <span className="gp-chip-count" aria-label={`${count} unread`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p id="gp-inbox-shortcuts" style={{ fontSize: 11, color: 'var(--gp-text-muted)' }} className="gp-hide-mobile">
          <kbd className="gp-kbd">j</kbd>/<kbd className="gp-kbd">k</kbd> next/previous · <kbd className="gp-kbd">/</kbd> search · <kbd className="gp-kbd">r</kbd> reply
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} aria-live="polite">
        <StateView
          state={inbox.listState}
          compact
          emptyTitle={inbox.filter === 'UNREAD' ? 'Inbox zero' : 'No conversations'}
          onPrimaryAction={() => inbox.setFilter('ALL')}
          onClearSearch={clearSearch}
          onRetry={inbox.realtime.retry}
        >
          {(tickets) => (
            <ul style={{ listStyle: 'none' }} aria-label="Conversations">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    id={`gp-thread-${t.id}`}
                    className="gp-thread-item"
                    aria-current={inbox.selected?.id === t.id ? 'true' : undefined}
                    onClick={() => onOpen(t.id)}
                  >
                    <span className="gp-row-between" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                      <span className="gp-row" style={{ minWidth: 0 }}>
                        <Avatar ticket={t} />
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 13, fontWeight: t.unread ? 900 : 700, color: 'var(--gp-text-primary)' }}>{t.athleteName}</span>
                          <span style={{ display: 'block', fontSize: 11, color: 'var(--gp-text-muted)', fontWeight: 600 }}>{t.handle}</span>
                        </span>
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--gp-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{t.time}</span>
                    </span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--gp-text-secondary)', lineHeight: '16px', margin: '6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: t.unread ? 700 : 500 }}>
                      {t.lastMessage}
                    </span>
                    <span className="gp-row" style={{ gap: 6 }}>
                      <span className={`gp-badge ${TAG_BADGE_CLASS[t.tagTone]}`} style={{ borderRadius: 4 }}>
                        {t.tag}
                      </span>
                      {t.status === 'RESOLVED' && <span className="gp-badge gp-badge-success">Resolved</span>}
                      {t.unread && (
                        <>
                          <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'var(--gp-accent)' }} />
                          <span className="gp-sr-only">Unread</span>
                        </>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </StateView>
      </div>
    </div>
  );
});
