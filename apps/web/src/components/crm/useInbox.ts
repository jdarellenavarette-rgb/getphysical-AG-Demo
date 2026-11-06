'use client';

import { useCallback, useMemo, useReducer, useState } from 'react';
import { createEmptyState, createNoSearchResultsState, createSuccessState, createErrorState, type TenStateEnvelope } from 'sodia-core/states';
import { useDebouncedValue } from '../../lib/use-debounced-value';
import { inboxReducer, type InboxState } from './inboxReducer';
import { INBOX_FILTERS, type InboxFilter, type MessageTicket } from './types';
import { useCrmRealtime } from './useCrmRealtime';

export const SEARCH_DEBOUNCE_MS = 200;

function matchesFilter(t: MessageTicket, f: InboxFilter): boolean {
  if (f === 'ALL') return true;
  if (f === 'UNREAD') return t.unread;
  return t.channel === f;
}

function matchesQuery(t: MessageTicket, q: string): boolean {
  if (!q) return true;
  const hay = [t.athleteName, t.handle, t.tag, t.lastMessage, t.athleteMeta.membership, ...t.messages.map((m) => m.text)];
  return hay.some((s) => s.toLowerCase().includes(q));
}

/** Inbox data model: reducer, realtime sync, channel filter, debounced search, unread counts and list state. */
export function useInbox(initialTickets: readonly MessageTicket[]) {
  const [state, dispatch] = useReducer(inboxReducer, initialTickets, (tickets): InboxState => ({
    tickets: [...tickets],
    selectedId: tickets[0]?.id ?? '',
    recentReplies: {},
  }));
  const [filter, setFilter] = useState<InboxFilter>('ALL');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const debounced = useDebouncedValue(normalizedQuery, SEARCH_DEBOUNCE_MS);
  // Typing is debounced; clearing the box restores the full list immediately.
  const debouncedQuery = normalizedQuery === '' ? '' : debounced;

  const realtime = useCrmRealtime({
    onReply: (reply) => dispatch({ type: 'reply', reply, receivedAt: Date.now() }),
    onBroadcast: (broadcast) => dispatch({ type: 'broadcast', broadcast }),
  });

  const counts = useMemo(() => {
    const out = {} as Record<InboxFilter, number>;
    INBOX_FILTERS.forEach(({ id }) => {
      out[id] = state.tickets.filter((t) => t.unread && matchesFilter(t, id)).length;
    });
    return out;
  }, [state.tickets]);

  const visible = useMemo(
    () => state.tickets.filter((t) => matchesFilter(t, filter) && matchesQuery(t, debouncedQuery)),
    [state.tickets, filter, debouncedQuery]
  );

  const listState: TenStateEnvelope<readonly MessageTicket[]> = useMemo(() => {
    if (state.tickets.length === 0 && realtime.status === 'error') {
      return createErrorState(realtime.errorCode ?? 'GP-503', 'We couldn’t reach the messaging service.', true);
    }
    if (visible.length > 0) return createSuccessState<readonly MessageTicket[]>(visible);
    if (debouncedQuery) {
      const label = INBOX_FILTERS.find((f) => f.id === filter)?.label ?? 'All';
      return createNoSearchResultsState(debouncedQuery, [], filter === 'ALL' ? [] : [label]);
    }
    if (filter === 'UNREAD') return createEmptyState('You’re all caught up — no unread conversations.', 'Show all conversations');
    return createEmptyState('No conversations in this channel yet.', 'Show all conversations');
  }, [visible, debouncedQuery, filter, state.tickets.length, realtime.status, realtime.errorCode]);

  const selected = state.tickets.find((t) => t.id === state.selectedId) ?? null;

  const select = useCallback((id: string) => dispatch({ type: 'select', id }), []);

  const move = useCallback(
    (delta: 1 | -1) => {
      if (visible.length === 0) return null;
      const idx = visible.findIndex((t) => t.id === state.selectedId);
      const nextIdx = idx === -1 ? 0 : Math.min(visible.length - 1, Math.max(0, idx + delta));
      const next = visible[nextIdx];
      if (next) dispatch({ type: 'select', id: next.id });
      return next?.id ?? null;
    },
    [visible, state.selectedId]
  );

  return {
    tickets: state.tickets,
    visible,
    selected,
    listState,
    counts,
    totalUnread: counts.ALL,
    filter,
    setFilter,
    query,
    setQuery,
    isSearchPending: normalizedQuery !== debouncedQuery,
    realtime,
    dispatch,
    select,
    move,
  };
}
