'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Banknote, CreditCard, QrCode, Trash2, Wallet } from 'lucide-react';
import { createEmptyState, createSuccessState, type TenStateEnvelope } from 'sodia-core/states';
import { HYBRID_FEE_MODEL } from 'sodia-core/constants';
import { StateView, SuccessNotice } from '../ui/StateView';
import { useSuiteSession } from '../shell/SuiteSession';

type CartKind = 'ACCESS' | 'STORE';

interface CatalogItem {
  id: string;
  name: string;
  short: string;
  price: number;
  type: CartKind;
  feeNote?: string;
}

const CATALOG: Record<CartKind, readonly CatalogItem[]> = {
  ACCESS: [
    { id: 'a1', name: '1-Day Walk-in Pass', short: 'Walk-in day pass', price: 350, type: 'ACCESS', feeNote: `+₱${HYBRID_FEE_MODEL.ONE_TIME_FIXED_FEE_PHP} fee` },
    { id: 'a2', name: 'Monthly All-Access VIP', short: 'Monthly VIP sub', price: 2499, type: 'ACCESS', feeNote: `${HYBRID_FEE_MODEL.RECURRING_SUB_FEE_RATE * 100}% fee` },
  ],
  STORE: [
    { id: 's1', name: 'Electrolyte Hydration 500ml', short: 'Electrolyte bottle', price: 80, type: 'STORE' },
    { id: 's2', name: 'Whey Protein Isolate Shake', short: 'Protein shake', price: 180, type: 'STORE' },
  ],
};

interface CartLine extends CatalogItem {
  lineId: string;
}

/** Bifurcated POS till: access products and store inventory can never share a tender. */
export function PosTerminal() {
  const { shift, openFloatGate } = useSuiteSession();
  const [tab, setTab] = useState<CartKind>('ACCESS');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const locked = !shift?.isOpen;
  const total = cart.reduce((acc, i) => acc + i.price, 0);

  const add = (item: CatalogItem) => {
    if (cart.some((c) => c.type !== item.type)) {
      setBlocked('Access passes and store items must be tendered separately. Check out or clear the current cart first.');
      return;
    }
    setBlocked(null);
    setReceipt(null);
    setCart((prev) => [...prev, { ...item, lineId: `${item.id}_${Date.now()}` }]);
  };

  const tender = (method: string) => {
    if (cart.length === 0 || locked) return;
    setReceipt(`Tendered ₱${total.toLocaleString()} via ${method} (${cart[0]?.type === 'STORE' ? 'Store' : 'Access'} cart).`);
    setCart([]);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setReceipt(null), 4000);
  };

  const cartState: TenStateEnvelope<readonly CartLine[]> =
    cart.length === 0 ? createEmptyState('Tap a product to start a sale.', 'Add walk-in pass') : createSuccessState<readonly CartLine[]>(cart);

  return (
    <section className="gp-card" aria-labelledby="gp-pos-title" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="gp-row-between">
        <h2 id="gp-pos-title" className="gp-section-title" style={{ fontSize: 18 }}>
          POS terminal
        </h2>
        <div className="gp-row" role="group" aria-label="Catalog">
          {(['ACCESS', 'STORE'] as const).map((k) => (
            <button key={k} type="button" className="gp-chip" aria-pressed={tab === k} onClick={() => setTab(k)}>
              {k === 'ACCESS' ? 'Access' : 'Store'}
            </button>
          ))}
        </div>
      </div>

      {locked && (
        <div className="gp-notice gp-notice-warning" role="status" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <AlertTriangle size={16} aria-hidden="true" />
          <span style={{ flex: 1 }}>Register is locked until a shift float is declared.</span>
          <button type="button" className="gp-btn gp-btn-secondary gp-btn-sm" onClick={openFloatGate} aria-haspopup="dialog">
            Open shift
          </button>
        </div>
      )}

      <div className="gp-grid-auto-narrow" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))' }}>
        {CATALOG[tab].map((item) => (
          <button key={item.id} type="button" className="gp-btn gp-btn-secondary" onClick={() => add(item)} disabled={locked} style={{ flexDirection: 'column', alignItems: 'flex-start', minHeight: 64, padding: 12, whiteSpace: 'normal', textAlign: 'left' }}>
            <span style={{ fontSize: 13 }}>{item.short}</span>
            <span style={{ fontSize: 15, color: item.type === 'ACCESS' ? 'var(--gp-info)' : 'var(--gp-accent-green)' }}>
              ₱{item.price.toLocaleString()} {item.feeNote && <span style={{ fontSize: 11, color: 'var(--gp-text-muted)' }}>{item.feeNote}</span>}
            </span>
          </button>
        ))}
      </div>

      {blocked && (
        <div className="gp-notice gp-notice-danger" role="alert">
          <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>{blocked}</span>
        </div>
      )}

      <div className="gp-subcard" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="gp-row-between">
          <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--gp-text-secondary)' }}>Current cart ({cart.length})</h3>
          {cart.length > 0 && (
            <button type="button" className="gp-btn gp-btn-ghost gp-btn-sm" onClick={() => { setCart([]); setBlocked(null); }}>
              <Trash2 size={13} aria-hidden="true" /> Clear
            </button>
          )}
        </div>
        <StateView state={cartState} compact emptyTitle="Cart is empty" onPrimaryAction={locked ? undefined : () => add(CATALOG.ACCESS[0]!)}>
          {(lines) => (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lines.map((l) => (
                <li key={l.lineId} className="gp-row-between" style={{ fontSize: 13, borderBottom: '1px solid var(--gp-border-light)', paddingBottom: 6 }}>
                  <span>{l.name}</span>
                  <strong>₱{l.price.toLocaleString()}</strong>
                </li>
              ))}
            </ul>
          )}
        </StateView>
        {receipt && <SuccessNotice>{receipt}</SuccessNotice>}
        <div className="gp-row-between" style={{ borderTop: '1px solid var(--gp-border-color)', paddingTop: 10, fontSize: 16, fontWeight: 900 }}>
          <span>Total due</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>₱{total.toLocaleString()}</span>
        </div>
        <div className="gp-grid-auto-narrow" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 110px), 1fr))' }}>
          <button type="button" className="gp-btn gp-btn-success" disabled={cart.length === 0 || locked} onClick={() => tender('Cash')}>
            <Banknote size={15} aria-hidden="true" /> Cash
          </button>
          <button type="button" className="gp-btn gp-btn-info" disabled={cart.length === 0 || locked} onClick={() => tender('GCash QR')}>
            <QrCode size={15} aria-hidden="true" /> GCash QR
          </button>
          <button type="button" className="gp-btn gp-btn-secondary" disabled={cart.length === 0 || locked} onClick={() => tender('VIP Wallet')}>
            <Wallet size={15} aria-hidden="true" /> VIP wallet
          </button>
        </div>
        <p className="gp-row" style={{ fontSize: 11, color: 'var(--gp-text-muted)', gap: 4 }}>
          <CreditCard size={12} aria-hidden="true" /> Settled via Xendit xenPlatform split routing; GetPhysical is never merchant of record.
        </p>
      </div>
    </section>
  );
}
