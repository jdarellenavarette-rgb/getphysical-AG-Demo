'use client';

import React from 'react';
import { Signal, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../../lib/use-network-status';

/** Global connectivity banner (no_internet / slow_network canonical states). */
export function OfflineBanner() {
  const status = useNetworkStatus();
  if (status === 'online') return null;
  const offline = status === 'offline';
  return (
    <div className="gp-offline-banner" role="status" aria-live="polite">
      {offline ? <WifiOff size={16} aria-hidden="true" /> : <Signal size={16} aria-hidden="true" />}
      <span>
        {offline
          ? 'You’re offline. Turnstile checks fall back to locally verified passes and 60s TOTP codes; changes sync when you reconnect.'
          : 'Slow connection detected. Live counters may lag and duplicate taps are blocked.'}
      </span>
    </div>
  );
}
