'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronRight, Activity } from 'lucide-react';

interface PerformanceRow {
  name: string;
  revenue: string;
  enrolled: number;
  trend: string;
  isPositive: boolean;
  absent: number;
  capacity: string;
}

const GYM_DATA: PerformanceRow[] = [
  { name: 'Yoga & Pilates', revenue: '12,450', enrolled: 846, trend: '32%', isPositive: true, absent: 5, capacity: '99.8%' },
  { name: 'Strength Training', revenue: '18,300', enrolled: 596, trend: '28%', isPositive: true, absent: 8, capacity: '99.90%' },
  { name: 'HIIT Session', revenue: '10,960', enrolled: 389, trend: '13%', isPositive: true, absent: 3, capacity: '99.90%' },
  { name: 'Spin Class', revenue: '10,964', enrolled: 255, trend: '11%', isPositive: false, absent: 12, capacity: '99.90%' },
  { name: 'Personal Training', revenue: '5,578', enrolled: 836, trend: '8%', isPositive: false, absent: 14, capacity: '99.93%' },
];

const CLUB_DATA: PerformanceRow[] = [
  { name: 'Pickleball Center Court', revenue: '24,800', enrolled: 412, trend: '44%', isPositive: true, absent: 2, capacity: '100%' },
  { name: 'Padel Court Alpha', revenue: '19,200', enrolled: 320, trend: '38%', isPositive: true, absent: 4, capacity: '98.5%' },
  { name: 'Tennis Court 1 (Clay)', revenue: '16,400', enrolled: 210, trend: '15%', isPositive: true, absent: 6, capacity: '95.2%' },
  { name: 'Basketball Main Floor', revenue: '28,900', enrolled: 580, trend: '22%', isPositive: true, absent: 1, capacity: '99.1%' },
  { name: 'Badminton Bay 1-4', revenue: '11,300', enrolled: 280, trend: '5%', isPositive: false, absent: 9, capacity: '96.0%' },
];

interface PerformanceTableCardProps {
  suiteMode: 'GYMDASH' | 'CLUBDASH';
  onViewAll: () => void;
}

export function PerformanceTableCard({ suiteMode, onViewAll }: PerformanceTableCardProps) {
  const isGym = suiteMode === 'GYMDASH';
  const data = isGym ? GYM_DATA : CLUB_DATA;
  const title = isGym ? 'Top Gym Performance & Attendance' : 'Top Club & Court Performance';

  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: '#111319',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
          {title}
        </h3>
        <button
          onClick={onViewAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            color: '#9CA3AF',
            fontSize: '12px',
            fontWeight: 700,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FF5364')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
        >
          <span>View all</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <th style={{ paddingBottom: '12px', fontWeight: 600 }}>{isGym ? 'Program' : 'Court / Area'}</th>
              <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Revenue</th>
              <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Enrolled</th>
              <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Trend</th>
              <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Absent</th>
              <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.name}
                style={{
                  borderBottom: i === data.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Name */}
                <td style={{ padding: '12px 0', fontWeight: 700, color: '#F3F4F6' }}>
                  {row.name}
                </td>

                {/* Revenue */}
                <td style={{ padding: '12px 0', color: '#9CA3AF', fontWeight: 600 }}>
                  ₱{row.revenue}
                </td>

                {/* Enrolled */}
                <td style={{ padding: '12px 0', color: '#D1D5DB', fontWeight: 700 }}>
                  {row.enrolled.toLocaleString()}
                </td>

                {/* Trend */}
                <td style={{ padding: '12px 0' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: row.isPositive ? '#FF5364' : '#F87171',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  >
                    {row.isPositive ? <ArrowUpRight size={13} strokeWidth={2.5} /> : <ArrowDownRight size={13} strokeWidth={2.5} />}
                    <span>{row.trend}</span>
                  </div>
                </td>

                {/* Absent */}
                <td style={{ padding: '12px 0', color: '#9CA3AF', fontWeight: 600 }}>
                  {row.absent}
                </td>

                {/* Capacity */}
                <td style={{ padding: '12px 0', color: '#F3F4F6', fontWeight: 800 }}>
                  {row.capacity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
