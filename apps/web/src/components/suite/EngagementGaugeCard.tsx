import React from 'react';
import type { SuiteMode } from '../../lib/suite-routes';
import { T } from '../../lib/theme-vars';

const GAUGES: Record<SuiteMode, { score: number; target: number; title: string; sub: string }> = {
  GYMDASH: { score: 7.4, target: 8.0, title: 'Club Engagement Score', sub: 'Optimized and running smoothly' },
  CLUBDASH: { score: 8.6, target: 9.0, title: 'Spatial Court Efficiency', sub: 'Optimized parent/child allocations' },
  COACHDASH: { score: 9.1, target: 9.5, title: 'Athlete Compliance Score', sub: 'Client cycle check-ins on-track' },
  ORGANIZERDASH: { score: 8.8, target: 9.0, title: 'Tournament Check-In Index', sub: 'All division rosters cleared' },
};

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Server Component. */
export function EngagementGaugeCard({ suiteMode }: { suiteMode: SuiteMode }) {
  const { score, target, title, sub } = GAUGES[suiteMode];
  const offset = CIRCUMFERENCE - (score / 10) * CIRCUMFERENCE;
  return (
    <section className="gp-card" style={{ padding: '22px 24px', minHeight: 165 }} aria-labelledby="gp-gauge-title">
      <div className="gp-row-between" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <div style={{ minWidth: 0 }}>
          <h2 id="gp-gauge-title" style={{ fontSize: 15, fontWeight: 900, color: T.textPrimary, letterSpacing: -0.3 }}>
            {title}
          </h2>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 3, fontWeight: 500 }}>{sub}</p>
          <p style={{ marginTop: 22, fontSize: 12, color: T.textMuted, fontWeight: 700 }}>
            Target: <strong style={{ color: T.textPrimary }}>{target.toFixed(1)}</strong>
          </p>
        </div>
        <div
          role="meter"
          aria-label={title}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={score}
          style={{ position: 'relative', width: 100, height: 100, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
            <defs>
              <linearGradient id="gp-gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA69E" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r={RADIUS} stroke={T.trackColor} strokeWidth="7" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              stroke="url(#gp-gauge-grad)"
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div aria-hidden="true" style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: T.textPrimary, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, marginTop: 2, textTransform: 'uppercase' }}>Index</span>
          </div>
        </div>
      </div>
    </section>
  );
}
