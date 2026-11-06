import type { SuiteMode } from '../../../lib/suite-routes';

export interface TableRowData {
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
  { col1: 'Darelle Navarette (IFBB Trainer)', col2: '12-Wk Power & Hypertrophy', col3: '225kg Deadlift', col4: '12%', isPositive: true, col5: '98.0%', col6: 'On-Track' },
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

export interface TableMeta {
  title: string;
  headers: readonly [string, string, string, string, string, string];
  rows: readonly TableRowData[];
}

export const TABLE_META: Record<SuiteMode, TableMeta> = {
  GYMDASH: { title: 'Top Gym Performance & Attendance', headers: ['Program', 'Revenue', 'Enrolled', 'Trend', 'Absent', 'Capacity'], rows: GYM_DATA },
  CLUBDASH: { title: 'Facility Court Bookings & Affiliated Clubs', headers: ['Court / Facility', 'Affiliated Club / League', 'Revenue', 'Trend', 'Hours Booked', 'Capacity'], rows: CLUB_DATA },
  COACHDASH: { title: 'Active Client Roster & Program Compliance', headers: ['Athlete / Client', 'Active Program Cycle', 'Target Metric', 'Trend', 'Compliance', 'CRM Status'], rows: COACH_DATA },
  ORGANIZERDASH: { title: 'Active Tournaments, Leagues & Participant Rosters', headers: ['Event Title', 'Sport & Division', 'Assigned Venue', 'Trend', 'Entries', 'Event Status'], rows: ORGANIZER_DATA },
};

export type ColumnKey = 'col1' | 'col2' | 'col3' | 'col4' | 'col5' | 'col6';
export const COLUMN_KEYS: readonly ColumnKey[] = ['col1', 'col2', 'col3', 'col4', 'col5', 'col6'];

export function isAttentionStatus(value: string): boolean {
  return value.includes('At-Risk') || value.includes('Due');
}
