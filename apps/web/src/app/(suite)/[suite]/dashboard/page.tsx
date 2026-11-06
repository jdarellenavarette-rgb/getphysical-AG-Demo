import React from 'react';
import type { Metadata } from 'next';
import { SUITE_LABELS } from '../../../../lib/suite-routes';
import { resolveSuite, suiteTabTitle, type SuiteParams } from '../../../../lib/suite-params';
import { parseTimeframe } from '../../../../lib/timeframes';
import { HeroPromoCard } from '../../../../components/suite/HeroPromoCard';
import { ActivityPerformanceSection } from '../../../../components/suite/ActivityPerformanceSection';
import { PerformanceTableCard } from '../../../../components/suite/PerformanceTableCard';
import { EngagementGaugeCard } from '../../../../components/suite/EngagementGaugeCard';
import { CoachAvailabilityCard } from '../../../../components/suite/CoachAvailabilityCard';
import { SpatialCalendar } from '../../../../components/clubdash/SpatialCalendar';

export async function generateMetadata({ params }: { params: SuiteParams }): Promise<Metadata> {
  return { title: await suiteTabTitle(params, 'DASHBOARD') };
}

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: SuiteParams;
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const suiteMode = await resolveSuite(params);
  const { range } = await searchParams;
  const timeframe = parseTimeframe(range);

  return (
    <div className="gp-stack">
      <h1 className="gp-sr-only">{SUITE_LABELS[suiteMode]} dashboard</h1>
      <div className="gp-grid-hero">
        <HeroPromoCard suiteMode={suiteMode} />
        <ActivityPerformanceSection suiteMode={suiteMode} timeframe={timeframe} />
      </div>
      {suiteMode === 'CLUBDASH' && <SpatialCalendar />}
      <div className="gp-grid-split">
        <PerformanceTableCard suiteMode={suiteMode} />
        <div className="gp-stack">
          <EngagementGaugeCard suiteMode={suiteMode} />
          <CoachAvailabilityCard suiteMode={suiteMode} />
        </div>
      </div>
    </div>
  );
}
