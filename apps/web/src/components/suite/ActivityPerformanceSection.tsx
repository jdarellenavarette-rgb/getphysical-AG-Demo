'use client';

import React, { useState } from 'react';
import { Users, CreditCard, ChevronDown, ArrowDownRight, TrendingDown } from 'lucide-react';

interface ActivityPerformanceSectionProps {
  timeframe: string;
  setTimeframe: (t: string) => void;
  suiteMode: 'GYMDASH' | 'CLUBDASH';
}

export function ActivityPerformanceSection({
  timeframe,
  setTimeframe,
  suiteMode,
}: ActivityPerformanceSectionProps) {
  const isGym = suiteMode === 'GYMDASH';

  // Stats dynamically adapt between GymDash and Clubdash
  const attendanceVal = isGym ? 883 : 640;
  const attendanceGoal = isGym ? '1,000' : '750';
  const attendanceAvg = isGym ? '812' : '590';

  const cashflowVal = isGym ? '₱ 1.48M' : '₱ 2.15M';
  const cashflowGoal = isGym ? '₱ 1.30M' : '₱ 1.90M';
  const cashflowAvg = isGym ? '₱ 1.17M' : '₱ 1.62M';

  const attritionVal = isGym ? '4.2%' : '3.8%';
  const attritionGoal = '<5.0%';
  const attritionAvg = isGym ? '5.2%' : '4.6%';

  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: '#111319',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
            Activity & Performance
          </h2>
          <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>
            {isGym ? 'Commercial Gym Live Telemetry' : 'Club & Spatial Court Capacity'}
          </span>
        </div>

        {/* Time Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            style={{
              backgroundColor: '#181B24',
              color: '#D1D5DB',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '6px 28px 6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              appearance: 'none',
              outline: 'none',
            }}
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Q4 2026">Q4 2026</option>
          </select>
          <ChevronDown
            size={13}
            color="#9CA3AF"
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
        </div>
      </div>

      {/* 3 Metric Cards with Glowing Waves */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {/* Card 1: Attendance */}
        <div
          style={{
            borderRadius: '18px',
            backgroundColor: '#161922',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#D1D5DB', marginBottom: '8px' }}>
            {isGym ? 'Attendance' : 'Court Check-ins'}
          </div>

          {/* SVG Wave Sparkline */}
          <div style={{ height: '54px', width: '100%', margin: '4px 0 10px' }}>
            <svg viewBox="0 0 180 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="waveFill1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 Q 25 15, 50 32 T 100 20 T 140 28 T 180 14 L 180 50 L 0 50 Z"
                fill="url(#waveFill1)"
              />
              <path
                d="M 0 35 Q 25 15, 50 32 T 100 20 T 140 28 T 180 14"
                fill="none"
                stroke="#FF5364"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Big Number & Subtext */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF' }}>{attendanceVal}</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>
                {isGym ? 'Daily Active' : 'Players In-Venue'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#6B7280', fontWeight: 600 }}>
              <span>Goal: <strong style={{ color: '#9CA3AF' }}>{attendanceGoal}</strong></span>
              <span>Average: <strong style={{ color: '#9CA3AF' }}>{attendanceAvg}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Cashflow */}
        <div
          style={{
            borderRadius: '18px',
            backgroundColor: '#161922',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#D1D5DB' }}>Monthly Cashflow</span>
          </div>

          {/* SVG Wave Sparkline */}
          <div style={{ height: '54px', width: '100%', margin: '4px 0 10px' }}>
            <svg viewBox="0 0 180 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="waveFill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 38 Q 30 18, 60 30 T 110 15 T 150 25 T 180 10 L 180 50 L 0 50 Z"
                fill="url(#waveFill2)"
              />
              <path
                d="M 0 38 Q 30 18, 60 30 T 110 15 T 150 25 T 180 10"
                fill="none"
                stroke="#FF5364"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Big Number & Maya Partner */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF' }}>{cashflowVal}</span>
              {/* Maya Partner Pill Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(0, 208, 132, 0.12)',
                  border: '1px solid rgba(0, 208, 132, 0.3)',
                  padding: '2px 7px',
                  borderRadius: '999px',
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#00D084' }}>maya</span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#D1D5DB' }}>Partner</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#6B7280', fontWeight: 600 }}>
              <span>Goal: <strong style={{ color: '#9CA3AF' }}>{cashflowGoal}</strong></span>
              <span>Average: <strong style={{ color: '#9CA3AF' }}>{cashflowAvg}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 3: Member Attrition */}
        <div
          style={{
            borderRadius: '18px',
            backgroundColor: '#161922',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#D1D5DB', marginBottom: '8px' }}>
            Member Attrition
          </div>

          {/* SVG Wave Sparkline */}
          <div style={{ height: '54px', width: '100%', margin: '4px 0 10px' }}>
            <svg viewBox="0 0 180 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="waveFill3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 20 Q 30 35, 70 24 T 120 34 T 150 22 T 180 32 L 180 50 L 0 50 Z"
                fill="url(#waveFill3)"
              />
              <path
                d="M 0 20 Q 30 35, 70 24 T 120 34 T 150 22 T 180 32"
                fill="none"
                stroke="#FF5364"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Big Number & Subtext */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF' }}>{attritionVal}</span>
              <ArrowDownRight size={18} color="#FF5364" strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#6B7280', fontWeight: 600 }}>
              <span>Goal: <strong style={{ color: '#10B981' }}>{attritionGoal}</strong></span>
              <span>Average: <strong style={{ color: '#9CA3AF' }}>{attritionAvg}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Progress Bars Underneath */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginTop: '2px' }}>
        {/* Attendance & Registration */}
        <div
          style={{
            backgroundColor: '#161922',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 83, 100, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Users size={16} color="#FF5364" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: '#9CA3AF', fontWeight: 700 }}>Attendance & Registration</span>
              <span style={{ color: '#FFFFFF', fontWeight: 800 }}>88.3% Active Members</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#232836', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '88.3%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #FF6B7A, #FF3D57)',
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Maya Payments Summary */}
        <div
          style={{
            backgroundColor: '#161922',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 208, 132, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CreditCard size={16} color="#00D084" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: '#9CA3AF', fontWeight: 700 }}>Maya Payments Summary</span>
              <span style={{ color: '#FFFFFF', fontWeight: 800 }}>94.8% Completed (Maya)</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#232836', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '94.8%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #00D084, #10B981)',
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
