import React from 'react';
import type { SuiteMode } from '../../lib/suite-routes';
import { T } from '../../lib/theme-vars';

interface AvailabilityMeta {
  title: string;
  badge: string;
  label1: string;
  sub1: string;
  tag1: string;
  pct1: number;
  label2: string;
  tag2: string;
}

const META: Record<SuiteMode, AvailabilityMeta> = {
  GYMDASH: { title: 'Coach & Schedule Availability', badge: '80% completed', label1: 'Coaching Capacity', sub1: 'Active Schedule Windows', tag1: 'Coach Slots Filled', pct1: 80, label2: 'Schedule filled: 80% completed', tag2: 'Weekly Sched' },
  CLUBDASH: { title: 'Court & Changeover Availability', badge: '94% on-time', label1: 'Court Buffers', sub1: '15-min Auto Changeovers', tag1: 'Active Slots Safe', pct1: 94, label2: 'Prime Court Hours: 94% utilized', tag2: 'Weekly Sched' },
  COACHDASH: { title: 'Coach Roster & Weekly Floor Hours', badge: '88% booked', label1: 'Floor Training Hours', sub1: '28h of 35h Max Client Capacity', tag1: 'Slots Filled', pct1: 88, label2: 'Client Slots: 32 active / 35 maximum', tag2: 'Weekly Roster' },
  ORGANIZERDASH: { title: 'Game-Day Command & Brackets', badge: '100% seeded', label1: 'Tournament Match Grid', sub1: 'All 64 Matches Assigned to Courts', tag1: 'Referees Assigned', pct1: 100, label2: 'Tournament Schedule: 100% locked', tag2: 'Bracket Live' },
};

const Dot = () => <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.accent, flexShrink: 0 }} />;

/** Server Component. */
export function CoachAvailabilityCard({ suiteMode }: { suiteMode: SuiteMode }) {
  const meta = META[suiteMode];
  return (
    <section className="gp-card" style={{ padding: '22px 24px', minHeight: 165, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }} aria-labelledby="gp-availability-title">
      <div className="gp-row-between">
        <h2 id="gp-availability-title" style={{ fontSize: 15, fontWeight: 900, color: T.textPrimary, letterSpacing: -0.3 }}>
          {meta.title}
        </h2>
        <span className="gp-badge gp-badge-accent">{meta.badge}</span>
      </div>
      <div>
        <div className="gp-row-between" style={{ marginBottom: 6, gap: 4 }}>
          <div className="gp-row" style={{ gap: 6, flexWrap: 'wrap' }}>
            <Dot />
            <span style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary }}>{meta.label1}</span>
            <span style={{ fontSize: 12, color: T.textMuted }}>• {meta.sub1}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted }}>{meta.tag1}</span>
        </div>
        <div className="gp-progress" role="meter" aria-label={meta.label1} aria-valuemin={0} aria-valuemax={100} aria-valuenow={meta.pct1}>
          <span style={{ width: `${meta.pct1}%`, background: `linear-gradient(90deg, ${T.accent}, ${T.accentHover})` }} />
        </div>
      </div>
      <div className="gp-row-between" style={{ paddingTop: 8, borderTop: `1px solid ${T.borderLight}` }}>
        <div className="gp-row" style={{ gap: 6 }}>
          <Dot />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.textSecondary }}>{meta.label2}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: T.textMuted }}>{meta.tag2}</span>
      </div>
    </section>
  );
}
