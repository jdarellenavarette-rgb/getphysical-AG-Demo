'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface CoachAvailabilityCardProps {
  suiteMode: 'GYMDASH' | 'CLUBDASH';
}

export function CoachAvailabilityCard({ suiteMode }: CoachAvailabilityCardProps) {
  const isGym = suiteMode === 'GYMDASH';
  const label1 = isGym ? 'Coaching Capacity' : 'Court & Host Availability';
  const sublabel1 = isGym ? 'Active Schedule Windows' : 'Prime Slot Windows';
  const tag1 = isGym ? 'Coach Slots Filled' : 'Court Blocks Reserved';

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
          {isGym ? 'Coach & Schedule Availability' : 'Court & Referee Availability'}
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
          80% completed
        </span>
      </div>

      {/* Row 1: Capacity with Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#FF5364' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#F3F4F6' }}>{label1}</span>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>• {sublabel1}</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF' }}>{tag1}</span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', backgroundColor: '#232836', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: '80%',
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
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#D1D5DB' }}>Schedule filled: 80% completed</span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF' }}>Weekly Sched</span>
      </div>
    </div>
  );
}
