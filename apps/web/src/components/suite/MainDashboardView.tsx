'use client';

import React, { useState } from 'react';
import { HeroPromoCard, SuiteMode } from './HeroPromoCard';
import { ActivityPerformanceSection } from './ActivityPerformanceSection';
import { PerformanceTableCard } from './PerformanceTableCard';
import { EngagementGaugeCard } from './EngagementGaugeCard';
import { CoachAvailabilityCard } from './CoachAvailabilityCard';
import { CreateMessageModal } from './CreateMessageModal';
import { SpatialCalendar } from '../clubdash/SpatialCalendar';

interface MainDashboardViewProps {
  suiteMode: SuiteMode;
  onNavigateToSchedule?: () => void;
  onNavigateToTriage?: () => void;
}

export function MainDashboardView({
  suiteMode,
  onNavigateToSchedule,
  onNavigateToTriage,
}: MainDashboardViewProps) {
  const [timeframe, setTimeframe] = useState('Today');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Top Grid: Hero Promo Card (Left) + Activity & Performance (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '20px',
        }}
      >
        <HeroPromoCard
          onCreateMessage={() => setIsMessageModalOpen(true)}
          suiteMode={suiteMode}
        />

        <ActivityPerformanceSection
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          suiteMode={suiteMode}
        />
      </div>

      {/* Clubdash Spatial Facility Allocator: Integrated Directly Inside Clubdash */}
      {suiteMode === 'CLUBDASH' && (
        <SpatialCalendar />
      )}

      {/* Bottom Grid: Top Performance Table (Left) + Gauges/Coach (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
        }}
      >
        <PerformanceTableCard
          suiteMode={suiteMode}
          onViewAll={() => onNavigateToSchedule?.()}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <EngagementGaugeCard suiteMode={suiteMode} />
          <CoachAvailabilityCard suiteMode={suiteMode} />
        </div>
      </div>

      <CreateMessageModal
        visible={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        suiteMode={suiteMode}
      />
    </div>
  );
}
