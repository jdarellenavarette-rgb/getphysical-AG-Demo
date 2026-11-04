'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronRight, Activity, Users, Trophy, Calendar } from 'lucide-react';
import { SuiteMode } from './HeroPromoCard';
import { useSuiteTheme } from './theme';

interface TableRowData {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  isPositive: boolean;
  col5: string;
  col6: string;
}

const GYM_DATA: TableRowData[] = [
  { col1: 'Yoga & Pilates', col2: '₱12,450', col3: '846', col4: '32%', isPositive: true, col5: '5', col6: '99.8%' },
  { col1: 'Strength Training', col2: '₱18,300', col3: '596', col4: '28%', isPositive: true, col5: '8', col6: '99.90%' },
  { col1: 'HIIT Session', col2: '₱10,960', col3: '389', col4: '13%', isPositive: true, col5: '3', col6: '99.90%' },
  { col1: 'Spin Class', col2: '₱10,964', col3: '255', col4: '11%', isPositive: false, col5: '12', col6: '99.90%' },
  { col1: 'Personal Training', col2: '₱5,578', col3: '836', col4: '8%', isPositive: false, col5: '14', col6: '99.93%' },
];

const CLUB_DATA: TableRowData[] = [
  { col1: 'Pickleball Center Court', col2: 'Metro Padel & Pickle League', col3: '₱24,800', col4: '44%', isPositive: true, col5: '84 hrs', col6: '100%' },
  { col1: 'Padel Court Alpha', col2: 'Manila Padel Tour', col3: '₱19,200', col4: '38%', isPositive: true, col5: '62 hrs', col6: '98.5%' },
  { col1: 'Tennis Court 1 (Clay)', col2: 'BGC Tennis Club', col3: '₱16,400', col4: '15%', isPositive: true, col5: '48 hrs', col6: '95.2%' },
  { col1: 'Basketball Main Floor', col2: 'Corporate Basketball Cup', col3: '₱28,900', col4: '22%', isPositive: true, col5: '52 hrs', col6: '99.1%' },
  { col1: 'Badminton Bay 1-4', col2: 'Smash Shuttle Club', col3: '₱11,300', col4: '5%', isPositive: false, col5: '36 hrs', col6: '96.0%' },
];

const COACH_DATA: TableRowData[] = [
  { col1: 'Adam Arête', col2: '12-Wk Power & Hypertrophy', col3: '225kg Deadlift', col4: '12%', isPositive: true, col5: '98.0%', col6: 'On-Track' },
  { col1: 'Alyssa Ramos', col2: 'Hyrox Endurance Prep', col3: 'Sub-45m 10K', col4: '18%', isPositive: true, col5: '94.5%', col6: 'On-Track' },
  { col1: 'Marcus Cruz', col2: 'Conventional Strength Peak', col3: '180kg Squat', col4: '8%', isPositive: true, col5: '91.2%', col6: 'Check-in Due' },
  { col1: 'Elena Rostova', col2: 'Post-Injury Shoulder Rehab', col3: 'Scapular Stability', col4: '24%', isPositive: true, col5: '100%', col6: 'On-Track' },
  { col1: 'Jake Torralba', col2: 'Functional Fat Loss', col3: '12% Body Fat', col4: '4%', isPositive: false, col5: '78.0%', col6: 'At-Risk Nudge' },
];

const ORGANIZER_DATA: TableRowData[] = [
  { col1: 'Metro Padel Summer Open', col2: 'Padel Open Men/Women', col3: 'Padel Alpha & Beta', col4: '100%', isPositive: true, col5: '64/64', col6: 'Live Matches' },
  { col1: 'BGC 3x3 Basketball Slam', col2: "3x3 Men's Elite", col3: 'Main Floor A', col4: '100%', isPositive: true, col5: '32/32', col6: 'Seeded Ready' },
  { col1: 'Pickleball Mixed Invitational', col2: 'Mixed Doubles Tier 1', col3: 'Pickleball Courts A-C', col4: '100%', isPositive: true, col5: '48/48', col6: 'Check-In Open' },
  { col1: 'Manila Hyrox Simulation', col2: 'Hybrid Individual', col3: 'Arena Main Course', col4: '80%', isPositive: true, col5: '120/150', col6: 'Open Reg' },
  { col1: 'Junior Badminton Trophy', col2: 'Singles U-18', col3: 'Badminton Bays 1-4', col4: '90%', isPositive: true, col5: '36/40', col6: 'Open Reg' },
];

interface PerformanceTableCardProps {
  suiteMode: SuiteMode;
  onViewAll: () => void;
}

export function PerformanceTableCard({ suiteMode, onViewAll }: PerformanceTableCardProps) {
  const { theme, isDark } = useSuiteTheme();
  const getTableMeta = () => {
    switch (suiteMode) {
      case 'CLUBDASH':
        return {
          title: 'Facility Court Bookings & Affiliated Clubs',
          headers: ['Court / Facility', 'Affiliated Club / League', 'Revenue', 'Trend', 'Hours Booked', 'Capacity'],
          data: CLUB_DATA,
        };
      case 'COACHDASH':
        return {
          title: 'Active Client Roster & Program Compliance',
          headers: ['Athlete / Client', 'Active Program Cycle', 'Target Metric', 'Trend', 'Compliance', 'CRM Status'],
          data: COACH_DATA,
        };
      case 'ORGANIZERDASH':
        return {
          title: 'Active Tournaments, Leagues & Participant Rosters',
          headers: ['Event Title', 'Sport & Division', 'Assigned Venue', 'Trend', 'Entries', 'Event Status'],
          data: ORGANIZER_DATA,
        };
      case 'GYMDASH':
      default:
        return {
          title: 'Top Gym Performance & Attendance',
          headers: ['Program', 'Revenue', 'Enrolled', 'Trend', 'Absent', 'Capacity'],
          data: GYM_DATA,
        };
    }
  };

  const meta = getTableMeta();

  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: theme.shadowCard,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.3px' }}>
          {meta.title}
        </h3>
        <button
          onClick={onViewAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            color: theme.accent,
            fontSize: '12px',
            fontWeight: 800,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <span>View all</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700, borderBottom: `1px solid ${theme.borderColor}` }}>
              {meta.headers.map((h, i) => (
                <th key={i} style={{ paddingBottom: '12px', fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meta.data.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: i === meta.data.length - 1 ? 'none' : `1px solid ${theme.borderLight}`,
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bgCardSecondary)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Col 1 */}
                <td style={{ padding: '13px 0', fontWeight: 800, color: theme.textPrimary }}>
                  {row.col1}
                </td>

                {/* Col 2 */}
                <td style={{ padding: '13px 0', color: theme.textSecondary, fontWeight: 600 }}>
                  {row.col2}
                </td>

                {/* Col 3 */}
                <td style={{ padding: '13px 0', color: theme.textPrimary, fontWeight: 800 }}>
                  {row.col3}
                </td>

                {/* Col 4 (Trend) */}
                <td style={{ padding: '13px 0' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: row.isPositive ? '#E11D48' : '#F43F5E',
                      fontWeight: 800,
                      fontSize: '12px',
                    }}
                  >
                    {row.isPositive ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
                    <span>{row.col4}</span>
                  </div>
                </td>

                {/* Col 5 */}
                <td style={{ padding: '13px 0', color: theme.textSecondary, fontWeight: 600 }}>
                  {row.col5}
                </td>

                {/* Col 6 */}
                <td style={{ padding: '13px 0', color: theme.textPrimary, fontWeight: 800 }}>
                  <span
                    style={{
                      padding: '4px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: row.col6.includes('At-Risk') || row.col6.includes('Due')
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(5, 150, 105, 0.1)',
                      color: row.col6.includes('At-Risk') || row.col6.includes('Due')
                        ? '#DC2626'
                        : '#059669',
                    }}
                  >
                    {row.col6}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
