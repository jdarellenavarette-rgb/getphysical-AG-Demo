import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { suiteHref, type SuiteMode } from '../../lib/suite-routes';
import { TABLE_META } from './performance/data';
import { PerformanceTable } from './performance/PerformanceTable';

/** Server shell; filtering/sorting lives in the PerformanceTable client leaf. */
export function PerformanceTableCard({ suiteMode }: { suiteMode: SuiteMode }) {
  const meta = TABLE_META[suiteMode];
  return (
    <section className="gp-card" aria-labelledby="gp-perf-title" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="gp-row-between" style={{ marginBottom: 14 }}>
        <h2 id="gp-perf-title" className="gp-section-title">
          {meta.title}
        </h2>
        <Link href={suiteHref(suiteMode, 'SPATIAL')} className="gp-btn gp-btn-ghost gp-btn-sm">
          View schedule <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>
      <PerformanceTable meta={meta} />
    </section>
  );
}
