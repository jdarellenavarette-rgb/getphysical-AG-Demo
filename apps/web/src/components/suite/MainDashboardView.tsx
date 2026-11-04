'use client';

import React, { useState } from 'react';
import { HeroPromoCard } from './HeroPromoCard';
import { ActivityPerformanceSection } from './ActivityPerformanceSection';
import { PerformanceTableCard } from './PerformanceTableCard';
import { EngagementGaugeCard } from './EngagementGaugeCard';
import { CoachAvailabilityCard } from './CoachAvailabilityCard';
import { CreateMessageModal } from './CreateMessageModal';

interface MainDashboardViewProps {
  suiteMode: 'GYMDASH' | 'CLUBDASH';
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
          <EngagementGaugeCard score={suiteMode === 'GYMDASH' ? 7.4 : 8.2} target={8.0} />
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
