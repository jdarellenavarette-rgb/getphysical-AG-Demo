'use client';

import React from 'react';
import type { TenStateEnvelope } from 'sodia-core';
import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  KeyRound,
  Lock,
  RefreshCw,
  SearchX,
  Settings,
  Signal,
  WifiOff,
} from 'lucide-react';
import { Skeleton } from './Skeleton';

interface StateViewProps<T> {
  state: TenStateEnvelope<T>;
  /** Rendered for `success` and for degraded states that still carry data (no_internet, slow_network). */
  children?: (data: T) => React.ReactNode;
  onRetry?: () => void;
  onPrimaryAction?: () => void;
  onClearSearch?: () => void;
  onSuggestion?: (suggestion: string) => void;
  onReauthenticate?: () => void;
  emptyTitle?: string;
  /** Custom loading skeleton matching the real layout. */
  skeleton?: React.ReactNode;
  compact?: boolean;
}

function Shell({
  icon,
  title,
  body,
  tone = 'neutral',
  compact,
  role,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  tone?: 'neutral' | 'danger' | 'success' | 'warning';
  compact?: boolean;
  role?: 'alert' | 'status';
  children?: React.ReactNode;
}) {
  const toneColor =
    tone === 'danger' ? 'var(--gp-danger)' : tone === 'success' ? 'var(--gp-accent-green)' : tone === 'warning' ? 'var(--gp-warning)' : undefined;
  return (
    <div className="gp-state" role={role} style={compact ? { minHeight: 140, padding: '20px 16px' } : undefined}>
      <div className="gp-state-icon" style={toneColor ? { color: toneColor } : undefined} aria-hidden="true">
        {icon}
      </div>
      <p className="gp-state-title">{title}</p>
      {body && <div className="gp-state-body">{body}</div>}
      {children && (
        <div className="gp-row" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Renders any of the 10 canonical sodia-core states with a consistent,
 * accessible treatment. Success (and degraded-with-data) delegates to `children`.
 */
export function StateView<T>({
  state,
  children,
  onRetry,
  onPrimaryAction,
  onClearSearch,
  onSuggestion,
  onReauthenticate,
  emptyTitle = 'Nothing here yet',
  skeleton,
  compact,
}: StateViewProps<T>) {
  switch (state.status) {
    case 'loading':
      return (
        <div role="status" aria-busy="true" aria-live="polite">
          <span className="gp-sr-only">Loading…</span>
          {skeleton ?? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
              {Array.from({ length: state.skeletonCount }, (_, i) => (
                <Skeleton key={i} height={52} radius={12} />
              ))}
            </div>
          )}
        </div>
      );
    case 'empty':
      return (
        <Shell icon={<Inbox size={24} />} title={emptyTitle} body={state.emptyReason} compact={compact} role="status">
          {onPrimaryAction && (
            <button type="button" className="gp-btn gp-btn-primary" onClick={onPrimaryAction}>
              {state.primaryActionLabel}
            </button>
          )}
        </Shell>
      );
    case 'error': {
      const isServer = /-5\d\d/.test(state.errorCode) || state.errorCode.includes('SRV');
      return (
        <Shell
          icon={<AlertTriangle size={24} />}
          title={isServer ? 'Something went wrong on our side' : 'We couldn’t complete that'}
          body={
            <>
              <span>{state.userMessage}</span>
              <span className="gp-state-code" style={{ display: 'block', marginTop: 6 }}>
                Reference: {state.errorCode}
              </span>
            </>
          }
          tone="danger"
          compact={compact}
          role="alert"
        >
          {state.retryable && onRetry && (
            <button type="button" className="gp-btn gp-btn-secondary" onClick={onRetry}>
              <RefreshCw size={14} aria-hidden="true" /> Retry
            </button>
          )}
        </Shell>
      );
    }
    case 'no_search_results':
      return (
        <Shell
          icon={<SearchX size={24} />}
          title={state.search.query ? `No matches for “${state.search.query}”` : 'No matches for these filters'}
          body={
            state.search.activeFilters.length > 0
              ? `Filters: ${state.search.activeFilters.join(', ')}. Try a different term or clear the search.`
              : 'Check the spelling or try a broader term.'
          }
          compact={compact}
          role="status"
        >
          {onClearSearch && (
            <button type="button" className="gp-btn gp-btn-secondary" onClick={onClearSearch}>
              Clear search
            </button>
          )}
          {onSuggestion &&
            state.search.suggestedAlternatives.map((s) => (
              <button key={s} type="button" className="gp-chip" onClick={() => onSuggestion(s)}>
                {s}
              </button>
            ))}
        </Shell>
      );
    case 'permission_denied':
      return (
        <Shell
          icon={<Lock size={24} />}
          title={`${state.permissionMeta.permission.replace('_', ' ')} access is blocked`}
          body="You can keep working with the manual fallback, or enable access in your browser’s site settings."
          tone="warning"
          compact={compact}
          role="alert"
        >
          <span className="gp-badge gp-badge-warning">
            <Settings size={12} aria-hidden="true" /> Browser site settings → Permissions
          </span>
        </Shell>
      );
    case 'session_expired':
      return (
        <Shell
          icon={<KeyRound size={24} />}
          title="Your session expired"
          body="Your drafts are kept. Sign in again to continue where you left off."
          tone="warning"
          compact={compact}
          role="alert"
        >
          {onReauthenticate && (
            <button type="button" className="gp-btn gp-btn-primary" onClick={onReauthenticate}>
              Sign in again
            </button>
          )}
        </Shell>
      );
    case 'form_validation':
      return (
        <div className="gp-notice gp-notice-danger" role="alert">
          <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
          <ul style={{ listStyle: 'none' }}>
            {state.issues.map((issue) => (
              <li key={`${issue.field}-${issue.code}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      );
    case 'no_internet':
      return (
        <>
          <div className="gp-notice gp-notice-warning" role="status" style={{ marginBottom: 12 }}>
            <WifiOff size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Offline — showing cached data
              {state.offline.queuedMutationsCount > 0 ? ` · ${state.offline.queuedMutationsCount} change(s) queued` : ''}.
            </span>
          </div>
          {state.data !== null && children?.(state.data)}
        </>
      );
    case 'slow_network':
      return (
        <>
          <div className="gp-notice gp-notice-info" role="status" style={{ marginBottom: 12 }}>
            <Signal size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Slow connection ({Math.round(state.network.latencyMs)} ms) — updates may take longer.</span>
          </div>
          {state.data !== null && children?.(state.data)}
        </>
      );
    case 'success':
      return <>{children?.(state.data)}</>;
  }
}

/** Inline success confirmation used after mutations. */
export function SuccessNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="gp-notice gp-notice-success" role="status">
      <CheckCircle2 size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}
