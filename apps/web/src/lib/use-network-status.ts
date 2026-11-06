'use client';

import { useSyncExternalStore } from 'react';
import { SLOW_NETWORK_THRESHOLD_MS } from 'sodia-core/states';

/** Subset of the Network Information API (not yet in lib.dom for all targets). */
interface NetworkInformationLike extends EventTarget {
  readonly effectiveType?: string;
  readonly rtt?: number;
  readonly saveData?: boolean;
}

function getConnection(): NetworkInformationLike | undefined {
  const nav: Navigator & { connection?: NetworkInformationLike } = navigator;
  return nav.connection;
}

export type NetworkStatus = 'online' | 'offline' | 'slow';

function readStatus(): NetworkStatus {
  if (!navigator.onLine) return 'offline';
  const conn = getConnection();
  if (!conn) return 'online';
  const slowType = conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
  const slowRtt = typeof conn.rtt === 'number' && conn.rtt >= SLOW_NETWORK_THRESHOLD_MS;
  return slowType || slowRtt ? 'slow' : 'online';
}

function subscribe(cb: () => void): () => void {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  const conn = getConnection();
  conn?.addEventListener('change', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
    conn?.removeEventListener('change', cb);
  };
}

/** Live connectivity driven by navigator.onLine events and the Network Information API. */
export function useNetworkStatus(): NetworkStatus {
  return useSyncExternalStore<NetworkStatus>(subscribe, readStatus, () => 'online');
}
