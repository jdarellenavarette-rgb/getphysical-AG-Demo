'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ScanLine, WifiOff } from 'lucide-react';
import { createEmptyState, createSuccessState, type TenStateEnvelope } from 'sodia-core/states';
import { StateView } from '../ui/StateView';
import { useNetworkStatus } from '../../lib/use-network-status';

type ScanStatus = 'GRANTED' | 'DENIED_EXPIRED' | 'OFFLINE_TOTP';

interface ScanEvent {
  id: string;
  name: string;
  avatar: string;
  time: string;
  status: ScanStatus;
  membership: string;
}

const INITIAL_SCANS: ScanEvent[] = [
  { id: '1', name: 'Marcus Cruz', avatar: 'MC', time: '10:42 AM', status: 'GRANTED', membership: 'Nexus VIP Black' },
  { id: '2', name: 'Alyssa Ramos', avatar: 'AR', time: '10:39 AM', status: 'GRANTED', membership: 'Daily Punchpass' },
  { id: '3', name: 'Jake Torralba', avatar: 'JT', time: '10:35 AM', status: 'DENIED_EXPIRED', membership: 'Expired 2d ago' },
  { id: '4', name: 'Elena Rostova', avatar: 'ER', time: '10:28 AM', status: 'OFFLINE_TOTP', membership: 'Verified 60s Token' },
];

const MAX_CAPACITY = 100;
const LEDGER_LIMIT = 8;

const STATUS_LABEL: Record<ScanStatus, string> = { GRANTED: 'Granted', DENIED_EXPIRED: 'Denied', OFFLINE_TOTP: 'Offline TOTP' };

/** Turnstile gate monitor with live "Inside Now" counter and gate event ledger. */
export function TurnstilePanel() {
  const offline = useNetworkStatus() === 'offline';
  const [occupancy, setOccupancy] = useState(42);
  const [gate, setGate] = useState<'IDLE' | 'GREEN' | 'RED'>('IDLE');
  const [scans, setScans] = useState<ScanEvent[]>(INITIAL_SCANS);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const scan = (requested: ScanStatus) => {
    // Offline: valid passes are verified against the locally cached pass list + 60s TOTP.
    const status: ScanStatus = offline && requested === 'GRANTED' ? 'OFFLINE_TOTP' : requested;
    const granted = status !== 'DENIED_EXPIRED';
    if (granted && occupancy >= MAX_CAPACITY) {
      setGate('RED');
    } else {
      setGate(granted ? 'GREEN' : 'RED');
      if (granted) setOccupancy((p) => p + 1);
    }
    const n = Math.floor(100 + Math.random() * 900);
    setScans((prev) =>
      [
        {
          id: `${Date.now()}`,
          name: granted ? `Member #${n}` : 'Unrecognised pass',
          avatar: granted ? 'LM' : '??',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status,
          membership: status === 'OFFLINE_TOTP' ? 'Local TOTP 482-911' : granted ? 'Active All-Access' : 'No valid pass',
        },
        ...prev,
      ].slice(0, LEDGER_LIMIT)
    );
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setGate('IDLE'), 1800);
  };

  const ledger: TenStateEnvelope<readonly ScanEvent[]> =
    scans.length === 0 ? createEmptyState('No gate scans yet this shift.', 'Simulate a scan') : createSuccessState<readonly ScanEvent[]>(scans);
  const nearCapacity = occupancy / MAX_CAPACITY > 0.85;

  return (
    <section className="gp-card" aria-labelledby="gp-gate-title" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="gp-row-between">
        <div>
          <h2 id="gp-gate-title" className="gp-section-title" style={{ fontSize: 18 }}>
            Turnstile Gate 01
          </h2>
          <p className="gp-row" style={{ fontSize: 12, fontWeight: 700, color: offline ? 'var(--gp-warning)' : 'var(--gp-accent-green)', gap: 6 }}>
            {offline ? <WifiOff size={12} aria-hidden="true" /> : <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'currentColor' }} />}
            {offline ? 'Offline · local pass verification' : 'Realtime relay connected'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }} aria-live="polite">
          <span style={{ fontSize: 12, color: 'var(--gp-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Inside now</span>
          <div style={{ fontSize: 26, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: nearCapacity ? 'var(--gp-danger)' : 'var(--gp-accent-green)' }}>
            {occupancy} <span style={{ fontSize: 14, color: 'var(--gp-text-muted)' }}>/ {MAX_CAPACITY}</span>
          </div>
        </div>
      </div>

      <div
        role="status"
        aria-live="assertive"
        className="gp-subcard"
        style={{
          textAlign: 'center',
          borderWidth: 2,
          borderColor: gate === 'GREEN' ? 'var(--gp-accent-green)' : gate === 'RED' ? 'var(--gp-danger)' : 'var(--gp-border-color)',
          backgroundColor: gate === 'GREEN' ? 'var(--gp-accent-green-muted)' : gate === 'RED' ? 'var(--gp-accent-muted)' : 'var(--gp-bg-card-secondary)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <p className="gp-row" style={{ justifyContent: 'center', fontSize: 14, fontWeight: 800, color: gate === 'GREEN' ? 'var(--gp-accent-green)' : gate === 'RED' ? 'var(--gp-danger)' : 'var(--gp-text-secondary)' }}>
          <ScanLine size={16} aria-hidden="true" />
          {gate === 'GREEN' ? 'Access granted · turnstile unlocked' : gate === 'RED' ? (occupancy >= MAX_CAPACITY ? 'Capacity reached · entry held' : 'Access denied · expired or invalid pass') : 'Awaiting NFC / dynamic QR scan'}
        </p>
        <div className="gp-row" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
          <button type="button" className="gp-btn gp-btn-success gp-btn-sm" onClick={() => scan('GRANTED')}>
            Simulate valid pass
          </button>
          <button type="button" className="gp-btn gp-btn-info gp-btn-sm" onClick={() => scan('OFFLINE_TOTP')}>
            Simulate offline TOTP
          </button>
          <button type="button" className="gp-btn gp-btn-primary gp-btn-sm" onClick={() => scan('DENIED_EXPIRED')}>
            Simulate squatter
          </button>
        </div>
      </div>

      <h3 className="gp-label" style={{ marginBottom: 0 }}>
        Live gate event ledger
      </h3>
      <StateView state={ledger} compact onPrimaryAction={() => scan('GRANTED')}>
        {(rows) => (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }} aria-label="Recent gate scans">
            {rows.map((s) => (
              <li key={s.id} className="gp-subcard gp-row-between" style={{ padding: 10, borderRadius: 10, flexWrap: 'nowrap' }}>
                <span className="gp-row" style={{ gap: 10, minWidth: 0 }}>
                  <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'var(--gp-bg-card-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                    {s.avatar}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>{s.name}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--gp-text-muted)' }}>{s.membership}</span>
                  </span>
                </span>
                <span style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={`gp-badge ${s.status === 'DENIED_EXPIRED' ? 'gp-badge-danger' : s.status === 'OFFLINE_TOTP' ? 'gp-badge-info' : 'gp-badge-success'}`}>{STATUS_LABEL[s.status]}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--gp-text-muted)', marginTop: 3 }}>{s.time}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </StateView>
    </section>
  );
}
