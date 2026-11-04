'use client';

import React from 'react';
import { SuiteMode } from './HeroPromoCard';

interface CoachAvailabilityCardProps {
  suiteMode: SuiteMode;
}

export function CoachAvailabilityCard({ suiteMode }: CoachAvailabilityCardProps) {
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
        backgroundColor: '#111319',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '165px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
          {meta.title}
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#FF5364',
            backgroundColor: 'rgba(255, 83, 100, 0.12)',
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
            <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#FF5364' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#F3F4F6' }}>{meta.label1}</span>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>• {meta.sub1}</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF' }}>{meta.tag1}</span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', backgroundColor: '#232836', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${meta.pct1}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #FF6B7A, #FF3D57)',
              borderRadius: '3px',
            }}
          />
        </div>
      </div>

      {/* Row 2: Schedule Filled Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#FF5364' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#D1D5DB' }}>{meta.label2}</span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF' }}>{meta.tag2}</span>
      </div>
    </div>
  );
}
