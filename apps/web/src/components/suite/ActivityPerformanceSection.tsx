'use client';

import React from 'react';
import { Users, CreditCard, ChevronDown, ArrowDownRight, ArrowUpRight, Calendar, Trophy, UserCheck } from 'lucide-react';
import { SuiteMode } from './HeroPromoCard';
import { useSuiteTheme } from './theme';

interface ActivityPerformanceSectionProps {
  timeframe: string;
  setTimeframe: (t: string) => void;
  suiteMode: SuiteMode;
}

export function ActivityPerformanceSection({
  timeframe,
  setTimeframe,
  suiteMode,
}: ActivityPerformanceSectionProps) {
  const { theme, isDark } = useSuiteTheme();
  const getMetrics = () => {
    switch (suiteMode) {
      case 'CLUBDASH':
        return {
          title: 'Activity & Facility Telemetry',
          sub: 'Clubdash: Facility Bookings & Organizer Affiliation Network',
          card1: { label: 'Court Bookings', val: '742', sub: 'Hours Booked', g: '800h', a: '690h', color: '#E11D48' },
          card2: { label: 'Facility Cashflow', val: '₱ 2.18M', sub: 'Gross Revenue', g: '₱ 2.0M', a: '₱ 1.85M', badge: 'Maya Multi-Tenant' },
          card3: { label: 'Organizer Affiliations', val: '18 Clubs', sub: 'Active Leagues', g: '20 Clubs', a: '14 Avg', isUp: true, pct: '+28%' },
          bar1: { icon: Calendar, label: 'Spatial Court Utilization', val: '92.5% Prime Hours Booked', pct: 92.5, color: '#E11D48' },
          bar2: { icon: CreditCard, label: 'Organizer Split Settlements', val: '96.2% Disbursed (Maya)', pct: 96.2, color: '#059669' },
        };
      case 'COACHDASH':
        return {
          title: 'Coaching Pipeline & Client CRM',
          sub: 'CoachDash: Client Rosters, Program Cycles & Morning Compliance',
          card1: { label: 'Active Client Roster', val: '32', sub: 'Athletes Coached', g: '35 Max', a: '28 Avg', color: '#E11D48' },
          card2: { label: 'Monthly Coaching Net', val: '₱ 245K', sub: 'Post-Floor Fee', g: '₱ 220K', a: '₱ 190K', badge: 'Coach Payout' },
          card3: { label: 'Client Compliance', val: '91.4%', sub: 'Logging Accuracy', g: '>90%', a: '84.2%', isUp: true, pct: '+7.2%' },
          bar1: { icon: UserCheck, label: 'Program Cycle Adherence', val: '93.8% Workouts Logged', pct: 93.8, color: '#E11D48' },
          bar2: { icon: Trophy, label: 'PR Form & Recovery Reviews', val: '88.0% Feedback Given', pct: 88.0, color: '#0284C7' },
        };
      case 'ORGANIZERDASH':
        return {
          title: 'Event Operations & Participant CRM',
          sub: 'OrganizerDash: Tournaments, Participant Rosters & Bracket Verification',
          card1: { label: 'Tournament Entries', val: '420', sub: 'Athletes Enrolled', g: '450 Max', a: '380 Avg', color: '#E11D48' },
          card2: { label: 'Gross Event Pool', val: '₱ 630K', sub: 'Registration Pool', g: '₱ 600K', a: '₱ 510K', badge: 'Prize Escrow' },
          card3: { label: 'Check-In Verification', val: '98.2%', sub: 'Waivers Cleared', g: '100%', a: '95.0%', isUp: true, pct: '+3.2%' },
          bar1: { icon: Trophy, label: 'Bracket Seeding & Schedules', val: '100% Matches Seeded', pct: 100, color: '#E11D48' },
          bar2: { icon: UserCheck, label: 'Participant Digital Passes', val: '98.2% Gate Ready', pct: 98.2, color: '#059669' },
        };
      case 'GYMDASH':
      default:
        return {
          title: 'Activity & Performance',
          sub: 'GymDash: Commercial Gym Attendance & POS Cashflow',
          card1: { label: 'Attendance', val: '883', sub: 'Daily Active Members', g: '1,000', a: '812', color: '#E11D48' },
          card2: { label: 'Monthly Cashflow', val: '₱ 1.48M', sub: 'Gross Revenue', g: '₱ 1.30M', a: '₱ 1.17M', badge: 'maya Partner' },
          card3: { label: 'Member Attrition', val: '4.2%', sub: 'Monthly Churn Rate', g: '<5.0%', a: '5.2%', isUp: false, pct: '↘' },
          bar1: { icon: Users, label: 'Attendance & Registration', val: '88.3% Active Members', pct: 88.3, color: '#E11D48' },
          bar2: { icon: CreditCard, label: 'Maya Payments Summary', val: '94.8% Completed (Maya)', pct: 94.8, color: '#059669' },
        };
    }
  };

  const m = getMetrics();
  const Icon1 = m.bar1.icon;
  const Icon2 = m.bar2.icon;

  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: theme.shadowCard,
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.4px' }}>
            {m.title}
          </h2>
          <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 600 }}>
            {m.sub}
          </span>
        </div>

        {/* Time Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            style={{
              backgroundColor: theme.bgCardSecondary,
              color: theme.textPrimary,
              border: `1px solid ${theme.borderColor}`,
              borderRadius: '10px',
              padding: '7px 28px 7px 14px',
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
            color={theme.textMuted}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
        </div>
      </div>

      {/* 3 Metric Cards with Glowing Light Waves */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {/* Card 1 */}
        <div
          style={{
            borderRadius: '18px',
            backgroundColor: theme.bgCardSecondary,
            border: `1px solid ${theme.borderColor}`,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: theme.textSecondary, marginBottom: '6px' }}>
            {m.card1.label}
          </div>

          <div style={{ height: '54px', width: '100%', margin: '4px 0 8px' }}>
            <svg viewBox="0 0 180 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="waveFill1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.waveStroke} stopOpacity={isDark ? "0.35" : "0.22"} />
                  <stop offset="100%" stopColor={theme.waveStroke} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 35 Q 25 15, 50 32 T 100 20 T 140 28 T 180 14 L 180 50 L 0 50 Z" fill="url(#waveFill1)" />
              <path d="M 0 35 Q 25 15, 50 32 T 100 20 T 140 28 T 180 14" fill="none" stroke={theme.waveStroke} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.5px' }}>{m.card1.val}</span>
              <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: 700 }}>{m.card1.sub}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: theme.textMuted, fontWeight: 600 }}>
              <span>Goal: <strong style={{ color: theme.textPrimary }}>{m.card1.g}</strong></span>
              <span>Avg: <strong style={{ color: theme.textPrimary }}>{m.card1.a}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            borderRadius: '18px',
            backgroundColor: theme.bgCardSecondary,
            border: `1px solid ${theme.borderColor}`,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: theme.textSecondary }}>{m.card2.label}</span>
          </div>

          <div style={{ height: '54px', width: '100%', margin: '4px 0 8px' }}>
            <svg viewBox="0 0 180 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="waveFill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.waveStroke} stopOpacity={isDark ? "0.35" : "0.22"} />
                  <stop offset="100%" stopColor={theme.waveStroke} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 38 Q 30 18, 60 30 T 110 15 T 150 25 T 180 10 L 180 50 L 0 50 Z" fill="url(#waveFill2)" />
              <path d="M 0 38 Q 30 18, 60 30 T 110 15 T 150 25 T 180 10" fill="none" stroke={theme.waveStroke} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.5px' }}>{m.card2.val}</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(5, 150, 105, 0.1)',
                  border: '1px solid rgba(5, 150, 105, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#059669' }}>{m.card2.badge}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: theme.textMuted, fontWeight: 600 }}>
              <span>Goal: <strong style={{ color: theme.textPrimary }}>{m.card2.g}</strong></span>
              <span>Avg: <strong style={{ color: theme.textPrimary }}>{m.card2.a}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div
          style={{
            borderRadius: '18px',
            backgroundColor: theme.bgCardSecondary,
            border: `1px solid ${theme.borderColor}`,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: theme.textSecondary, marginBottom: '6px' }}>
            {m.card3.label}
          </div>

          <div style={{ height: '54px', width: '100%', margin: '4px 0 8px' }}>
            <svg viewBox="0 0 180 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="waveFill3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.waveStroke} stopOpacity={isDark ? "0.35" : "0.22"} />
                  <stop offset="100%" stopColor={theme.waveStroke} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 20 Q 30 35, 70 24 T 120 34 T 150 22 T 180 32 L 180 50 L 0 50 Z" fill="url(#waveFill3)" />
              <path d="M 0 20 Q 30 35, 70 24 T 120 34 T 150 22 T 180 32" fill="none" stroke={theme.waveStroke} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.5px' }}>{m.card3.val}</span>
              {m.card3.isUp ? (
                <div style={{ display: 'flex', alignItems: 'center', color: '#059669', fontSize: '12px', fontWeight: 800 }}>
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                  <span>{m.card3.pct}</span>
                </div>
              ) : (
                <ArrowDownRight size={18} color="#E11D48" strokeWidth={2.5} />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: theme.textMuted, fontWeight: 600 }}>
              <span>Goal: <strong style={{ color: '#059669' }}>{m.card3.g}</strong></span>
              <span>Avg: <strong style={{ color: theme.textPrimary }}>{m.card3.a}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Progress Bars Underneath in Light Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginTop: '2px' }}>
        <div
          style={{
            backgroundColor: theme.bgCardSecondary,
            border: `1px solid ${theme.borderColor}`,
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              backgroundColor: theme.accentMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon1 size={17} color={theme.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: theme.textMuted, fontWeight: 700 }}>{m.bar1.label}</span>
              <span style={{ color: theme.textPrimary, fontWeight: 800 }}>{m.bar1.val}</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${m.bar1.pct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #E11D48, #BE123C)',
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.bgCardSecondary,
            border: `1px solid ${theme.borderColor}`,
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              backgroundColor: 'rgba(5, 150, 105, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon2 size={17} color="#059669" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: theme.textMuted, fontWeight: 700 }}>{m.bar2.label}</span>
              <span style={{ color: theme.textPrimary, fontWeight: 800 }}>{m.bar2.val}</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${m.bar2.pct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #059669, #10B981)',
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
