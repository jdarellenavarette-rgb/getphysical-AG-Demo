'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import { CreateMessageModal } from './CreateMessageModal';
import type { SuiteMode } from '../../lib/suite-routes';

export type { SuiteMode } from '../../lib/suite-routes';

/** three.js (~140 kB) loads only on the dashboard, after hydration, behind a same-size placeholder. */
const LiquidChromeCanvas = dynamic(() => import('./LiquidChromeCanvas').then((m) => m.LiquidChromeCanvas), {
  ssr: false,
  loading: () => <span aria-hidden="true" className="gp-skeleton" style={{ width: 160, height: 145, borderRadius: 72 }} />,
});

const COPY: Record<SuiteMode, { title: string; desc: string; btn: string }> = {
  GYMDASH: { title: 'Manage Messaging & Promos', desc: 'Send newsletters, promos, and reminders within your club.', btn: 'Create Message' },
  CLUBDASH: { title: 'Facility Bookings & Affiliations', desc: 'Broadcast court schedule changes and partner club notices.', btn: 'Broadcast Alert' },
  COACHDASH: { title: 'Coach Client CRM & Programs', desc: 'Push cycle updates, recovery reminders, and client check-in nudges.', btn: 'Message Clients' },
  ORGANIZERDASH: { title: 'Participant Broadcasts & CRM', desc: 'Dispatch bracket seeds, check-in calls, and tournament rule packs.', btn: 'Broadcast Event' },
};

export function HeroPromoCard({ suiteMode }: { suiteMode: SuiteMode }) {
  const [open, setOpen] = useState(false);
  const copy = COPY[suiteMode];

  return (
    <section
      className="gp-card"
      aria-labelledby="gp-hero-title"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 340,
        padding: '24px 22px 28px',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -30,
          left: '10%',
          right: '10%',
          height: 160,
          background: 'radial-gradient(ellipse at bottom, rgba(225, 29, 72, 0.12) 0%, rgba(225, 29, 72, 0.03) 60%, transparent 80%)',
          pointerEvents: 'none',
          filter: 'blur(20px)',
        }}
      />
      <LiquidChromeCanvas width={160} height={145} />
      <div style={{ textAlign: 'center', zIndex: 1, marginTop: 14 }}>
        <h2 id="gp-hero-title" style={{ fontSize: 17, fontWeight: 900, color: 'var(--gp-text-primary)', letterSpacing: -0.4, marginBottom: 6 }}>
          {copy.title}
        </h2>
        <p style={{ fontSize: 13, lineHeight: '18px', color: 'var(--gp-text-muted)', maxWidth: 240, margin: '0 auto', fontWeight: 500 }}>{copy.desc}</p>
      </div>
      <button
        type="button"
        className="gp-btn gp-btn-primary gp-btn-lift"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        style={{ zIndex: 2, marginTop: 16, width: '100%', maxWidth: 220, minHeight: 44, borderRadius: 999 }}
      >
        <Send size={14} aria-hidden="true" />
        <span>{copy.btn}</span>
      </button>
      <CreateMessageModal visible={open} onClose={() => setOpen(false)} suiteMode={suiteMode} />
    </section>
  );
}
