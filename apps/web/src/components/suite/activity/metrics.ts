import { Calendar, CreditCard, Trophy, UserCheck, Users, type LucideIcon } from 'lucide-react';
import type { SuiteMode } from '../../../lib/suite-routes';

export interface WaveMetric {
  label: string;
  value: string;
  unit: string;
  goal: string;
  average: string;
  badge?: string;
  trend?: { direction: 'up' | 'down'; label: string };
  /** SVG path for the sparkline (viewBox 0 0 180 50). */
  path: string;
}

export interface ProgressMetric {
  icon: LucideIcon;
  label: string;
  value: string;
  pct: number;
  tone: 'accent' | 'green' | 'info';
}

export interface SuiteMetrics {
  title: string;
  subtitle: string;
  cards: readonly [WaveMetric, WaveMetric, WaveMetric];
  bars: readonly [ProgressMetric, ProgressMetric];
}

const P1 = 'M 0 35 Q 25 15, 50 32 T 100 20 T 140 28 T 180 14';
const P2 = 'M 0 38 Q 30 18, 60 30 T 110 15 T 150 25 T 180 10';
const P3 = 'M 0 20 Q 30 35, 70 24 T 120 34 T 150 22 T 180 32';

export const SUITE_METRICS: Record<SuiteMode, SuiteMetrics> = {
  GYMDASH: {
    title: 'Activity & Performance',
    subtitle: 'GymDash: Commercial Gym Attendance & POS Cashflow',
    cards: [
      { label: 'Attendance', value: '883', unit: 'Daily Active Members', goal: '1,000', average: '812', path: P1 },
      { label: 'Monthly Cashflow', value: '₱ 1.48M', unit: 'Gross Revenue', goal: '₱ 1.30M', average: '₱ 1.17M', badge: 'Maya Partner', path: P2 },
      { label: 'Member Attrition', value: '4.2%', unit: 'Monthly Churn', goal: '<5.0%', average: '5.2%', trend: { direction: 'down', label: '-1.0 pt' }, path: P3 },
    ],
    bars: [
      { icon: Users, label: 'Attendance & Registration', value: '88.3% Active Members', pct: 88.3, tone: 'accent' },
      { icon: CreditCard, label: 'Maya Payments Summary', value: '94.8% Completed', pct: 94.8, tone: 'green' },
    ],
  },
  CLUBDASH: {
    title: 'Activity & Facility Telemetry',
    subtitle: 'Clubdash: Facility Bookings & Organizer Affiliation Network',
    cards: [
      { label: 'Court Bookings', value: '742', unit: 'Hours Booked', goal: '800h', average: '690h', path: P1 },
      { label: 'Facility Cashflow', value: '₱ 2.18M', unit: 'Gross Revenue', goal: '₱ 2.0M', average: '₱ 1.85M', badge: 'Maya Multi-Tenant', path: P2 },
      { label: 'Organizer Affiliations', value: '18 Clubs', unit: 'Active Leagues', goal: '20 Clubs', average: '14 Avg', trend: { direction: 'up', label: '+28%' }, path: P3 },
    ],
    bars: [
      { icon: Calendar, label: 'Spatial Court Utilization', value: '92.5% Prime Hours Booked', pct: 92.5, tone: 'accent' },
      { icon: CreditCard, label: 'Organizer Split Settlements', value: '96.2% Disbursed', pct: 96.2, tone: 'green' },
    ],
  },
  COACHDASH: {
    title: 'Coaching Pipeline & Client CRM',
    subtitle: 'CoachDash: Client Rosters, Program Cycles & Morning Compliance',
    cards: [
      { label: 'Active Client Roster', value: '32', unit: 'Athletes Coached', goal: '35 Max', average: '28 Avg', path: P1 },
      { label: 'Monthly Coaching Net', value: '₱ 245K', unit: 'Post-Floor Fee', goal: '₱ 220K', average: '₱ 190K', badge: 'Coach Payout', path: P2 },
      { label: 'Client Compliance', value: '91.4%', unit: 'Logging Accuracy', goal: '>90%', average: '84.2%', trend: { direction: 'up', label: '+7.2%' }, path: P3 },
    ],
    bars: [
      { icon: UserCheck, label: 'Program Cycle Adherence', value: '93.8% Workouts Logged', pct: 93.8, tone: 'accent' },
      { icon: Trophy, label: 'PR Form & Recovery Reviews', value: '88.0% Feedback Given', pct: 88.0, tone: 'info' },
    ],
  },
  ORGANIZERDASH: {
    title: 'Event Operations & Participant CRM',
    subtitle: 'OrganizerDash: Tournaments, Participant Rosters & Bracket Verification',
    cards: [
      { label: 'Tournament Entries', value: '420', unit: 'Athletes Enrolled', goal: '450 Max', average: '380 Avg', path: P1 },
      { label: 'Gross Event Pool', value: '₱ 630K', unit: 'Registration Pool', goal: '₱ 600K', average: '₱ 510K', badge: 'Prize Escrow', path: P2 },
      { label: 'Check-In Verification', value: '98.2%', unit: 'Waivers Cleared', goal: '100%', average: '95.0%', trend: { direction: 'up', label: '+3.2%' }, path: P3 },
    ],
    bars: [
      { icon: Trophy, label: 'Bracket Seeding & Schedules', value: '100% Matches Seeded', pct: 100, tone: 'accent' },
      { icon: UserCheck, label: 'Participant Digital Passes', value: '98.2% Gate Ready', pct: 98.2, tone: 'green' },
    ],
  },
};
