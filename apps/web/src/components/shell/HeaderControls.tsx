'use client';

import React from 'react';
import { Info, Lock, Moon, Sun, Unlock, MapPin } from 'lucide-react';
import { useSuiteTheme } from '../suite/theme';
import { BRANCHES, useSuiteSession, type Branch } from './SuiteSession';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useSuiteTheme();
  return (
    <button
      type="button"
      className="gp-btn gp-btn-secondary gp-btn-sm"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
    >
      {isDark ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
      <span className="gp-hide-mobile">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

export function ExplainerToggle() {
  const { explainerOpen, toggleExplainer } = useSuiteSession();
  return (
    <button
      type="button"
      className="gp-icon-btn"
      onClick={toggleExplainer}
      aria-expanded={explainerOpen}
      aria-controls="gp-architecture-explainer"
      aria-label="Explain the four workspace types"
      title="Explain the four workspace types"
    >
      <Info size={16} aria-hidden="true" />
    </button>
  );
}

export function BranchSelect() {
  const { branch, setBranch } = useSuiteSession();
  return (
    <div style={{ position: 'relative' }}>
      <label htmlFor="gp-branch" className="gp-sr-only">
        Branch
      </label>
      <MapPin
        size={14}
        aria-hidden="true"
        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gp-text-muted)', pointerEvents: 'none' }}
      />
      <select
        id="gp-branch"
        className="gp-select"
        value={branch}
        onChange={(e) => {
          const next = BRANCHES.find((b) => b.id === e.target.value);
          if (next) setBranch(next.id satisfies Branch);
        }}
        style={{ minHeight: 40, fontSize: 13, fontWeight: 800, padding: '8px 12px 8px 30px', width: 'auto', maxWidth: '100%' }}
      >
        {BRANCHES.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FloatGateButton() {
  const { shift, openFloatGate } = useSuiteSession();
  const open = shift?.isOpen ?? false;
  return (
    <button
      type="button"
      className={`gp-btn gp-btn-sm ${open ? 'gp-btn-secondary' : 'gp-btn-primary'}`}
      onClick={openFloatGate}
      aria-haspopup="dialog"
      style={open ? { color: 'var(--gp-info)', borderColor: 'var(--gp-info)' } : undefined}
    >
      {open ? <Unlock size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}
      <span>{open && shift ? `Shift float ₱${shift.openingFloat.toLocaleString()}` : 'Register locked'}</span>
    </button>
  );
}

const PILLARS = [
  { title: 'GymDash (Gym OS)', color: 'var(--gp-accent)', body: 'Turnstiles, 60s dynamic TOTP gate access, class capacity, POS cashier till & daily active member telemetry.' },
  { title: 'Clubdash (Club & Venue OS)', color: 'var(--gp-info)', body: 'GymDash plus spatial court bookings (parent/child court splitting) and organizer affiliation networks.' },
  { title: 'CoachDash (Coach OS)', color: '#7C3AED', body: 'Organize workout cycles & programs, manage the coached client roster, monitor morning compliance, and run client CRM.' },
  { title: 'OrganizerDash (Events OS)', color: 'var(--gp-accent-green)', body: 'Organize tournaments & leagues, manage participant rosters, seed brackets, and run event CRM.' },
] as const;

export function ArchitectureExplainer() {
  const { explainerOpen } = useSuiteSession();
  if (!explainerOpen) return null;
  return (
    <section id="gp-architecture-explainer" className="gp-explainer" aria-label="Workspace types">
      {PILLARS.map((p) => (
        <div key={p.title} style={{ borderLeft: `3px solid ${p.color}`, paddingLeft: 10 }}>
          <h2 style={{ fontSize: 13, fontWeight: 900, color: 'var(--gp-text-primary)', marginBottom: 2 }}>{p.title}</h2>
          <p style={{ color: 'var(--gp-text-secondary)', lineHeight: '17px', fontWeight: 500 }}>{p.body}</p>
        </div>
      ))}
    </section>
  );
}
