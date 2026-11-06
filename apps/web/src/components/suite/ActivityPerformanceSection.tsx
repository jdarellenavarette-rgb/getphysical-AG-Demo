import React, { Suspense } from 'react';
import type { SuiteMode } from '../../lib/suite-routes';
import { timeframeLabel, type TimeframeId } from '../../lib/timeframes';
import { SUITE_METRICS } from './activity/metrics';
import { MetricWaveCard, ProgressStatCard } from './activity/MetricCards';
import { TimeframeSelect } from './activity/TimeframeSelect';

/** Server Component; only the period picker is a client leaf. */
export function ActivityPerformanceSection({ suiteMode, timeframe }: { suiteMode: SuiteMode; timeframe: TimeframeId }) {
  const m = SUITE_METRICS[suiteMode];
  return (
    <section className="gp-card gp-stack" aria-labelledby="gp-activity-title">
      <div className="gp-row-between">
        <div style={{ minWidth: 0 }}>
          <h2 id="gp-activity-title" style={{ fontSize: 18, fontWeight: 900, color: 'var(--gp-text-primary)', letterSpacing: -0.4 }}>
            {m.title}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--gp-text-muted)', fontWeight: 600 }}>
            {m.subtitle} · {timeframeLabel(timeframe)}
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeframeSelect value={timeframe} />
        </Suspense>
      </div>
      <div className="gp-grid-auto">
        {m.cards.map((card, i) => (
          <MetricWaveCard key={card.label} metric={card} gradientId={`gp-wave-${i}`} />
        ))}
      </div>
      <div className="gp-grid-auto-wide" style={{ gap: 14 }}>
        {m.bars.map((bar) => (
          <ProgressStatCard key={bar.label} metric={bar} />
        ))}
      </div>
    </section>
  );
}
