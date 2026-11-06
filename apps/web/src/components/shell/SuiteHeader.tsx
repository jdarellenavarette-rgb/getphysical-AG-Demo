import React from 'react';
import Link from 'next/link';
import { Compass, Dumbbell, Trophy, UserCheck, type LucideIcon } from 'lucide-react';
import { SUITE_LABELS, suiteHasFloatGate, suiteHref, type SuiteMode } from '../../lib/suite-routes';
import { SUITE_INFO } from '../../lib/suite-copy';
import { T } from '../../lib/theme-vars';
import { BranchSelect, ExplainerToggle, FloatGateButton, ThemeToggle } from './HeaderControls';

export const SUITE_ICONS: Record<SuiteMode, LucideIcon> = {
  GYMDASH: Dumbbell,
  CLUBDASH: Compass,
  COACHDASH: UserCheck,
  ORGANIZERDASH: Trophy,
};

/** Server-rendered header; only the interactive controls are client islands. */
export function SuiteHeader({ suiteMode }: { suiteMode: SuiteMode }) {
  const Icon = SUITE_ICONS[suiteMode];
  const info = SUITE_INFO[suiteMode];
  return (
    <header className="gp-header">
      <div className="gp-header-group">
        <Link href={suiteHref(suiteMode, 'SETTINGS')} className="gp-role-pill" aria-label={`Workspace: ${SUITE_LABELS[suiteMode]}. Change role in settings`}>
          <span
            aria-hidden="true"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: T.accent,
              color: T.textOnAccent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: T.shadowPill,
              flexShrink: 0,
            }}
          >
            <Icon size={14} />
          </span>
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Role</span>
            <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: -0.3 }}>{SUITE_LABELS[suiteMode]}</span>
          </span>
          <span className="gp-badge gp-badge-accent gp-hide-mobile">Change ›</span>
        </Link>
        <ExplainerToggle />
        <BranchSelect />
      </div>

      <div className="gp-header-group">
        <span className="gp-badge gp-badge-success gp-hide-mobile" style={{ padding: '6px 12px', borderRadius: 8 }}>
          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'currentColor' }} />
          {info.badge}
        </span>
        {suiteHasFloatGate(suiteMode) && <FloatGateButton />}
        <ThemeToggle />
      </div>
    </header>
  );
}
