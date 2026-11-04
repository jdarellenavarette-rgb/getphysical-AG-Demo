'use client';

import React from 'react';
import { SuiteMode } from './HeroPromoCard';
import { useSuiteTheme } from './theme';

interface CoachAvailabilityCardProps {
  suiteMode: SuiteMode;
}

export function CoachAvailabilityCard({ suiteMode }: CoachAvailabilityCardProps) {
  const { theme, isDark } = useSuiteTheme();
  const getAvailabilityMeta = () => {
    switch (suiteMode) {
      case 'CLUBDASH':
        return {
          title: 'Court & Changeover Availability',
          badge: '94% on-time',
          label1: 'Court Buffers',
          sub1: '15-min Auto Changeovers',
          tag1: 'Active Slots Safe',
          pct1: 94,
          label2: 'Prime Court Hours: 94% utilized',
          tag2: 'Weekly Sched',
        };
      case 'COACHDASH':
        return {
          title: 'Coach Roster & Weekly Floor Hours',
          badge: '88% booked',
          label1: 'Floor Training Hours',
          sub1: '28h of 35h Max Client Capacity',
          tag1: 'Slots Filled',
          pct1: 88,
          label2: 'Client Slots: 32 active / 35 maximum',
          tag2: 'Weekly Roster',
        };
      case 'ORGANIZERDASH':
        return {
          title: 'Game-Day Command & Brackets',
          badge: '100% seeded',
          label1: 'Tournament Match Grid',
          sub1: 'All 64 Matches Assigned to Courts',
          tag1: 'Referees Assigned',
          pct1: 100,
          label2: 'Tournament Schedule: 100% locked',
          tag2: 'Bracket Live',
        };
      case 'GYMDASH':
      default:
        return {
          title: 'Coach & Schedule Availability',
          badge: '80% completed',
          label1: 'Coaching Capacity',
          sub1: 'Active Schedule Windows',
          tag1: 'Coach Slots Filled',
          pct1: 80,
          label2: 'Schedule filled: 80% completed',
          tag2: 'Weekly Sched',
        };
    }
  };

  const meta = getAvailabilityMeta();

  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '165px',
        boxShadow: theme.shadowCard,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.3px' }}>
          {meta.title}
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#E11D48',
            backgroundColor: 'rgba(225, 29, 72, 0.1)',
            padding: '3px 8px',
            borderRadius: '6px',
          }}
        >
          {meta.badge}
        </span>
      </div>

      {/* Row 1: Capacity with Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#E11D48' }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: theme.textPrimary }}>{meta.label1}</span>
            <span style={{ fontSize: '11px', color: theme.textMuted }}>• {meta.sub1}</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.textMuted }}>{meta.tag1}</span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${meta.pct1}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #E11D48, #BE123C)',
              borderRadius: '3px',
            }}
          />
        </div>
      </div>

      {/* Row 2: Schedule Filled Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: `1px solid ${theme.borderLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#E11D48' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: theme.textSecondary }}>{meta.label2}</span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 800, color: theme.textMuted }}>{meta.tag2}</span>
      </div>
    </div>
  );
}
