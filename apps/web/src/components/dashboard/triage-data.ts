/** Seed triage incidents and attrition model output for the demo branch. */
export interface TriageItem {
  id: string;
  type: 'CASH_VARIANCE' | 'SQUATTER_BREACH' | 'OVERRIDE';
  title: string;
  detail: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  resolved: boolean;
}

export interface AtRiskMember {
  id: string;
  name: string;
  avatar: string;
  riskScore: number;
  lastVisit: string;
  attendanceDrop: string;
  plan: string;
  offerSent: boolean;
}

export const INITIAL_TRIAGE: TriageItem[] = [
  {
    id: 't1',
    type: 'CASH_VARIANCE',
    title: 'Register 01 Shift Blind Count Discrepancy',
    detail: 'Staff Jane D. reported ₱3,180. Expected drawer cash was ₱3,300 (-₱120.00 shortage).',
    severity: 'HIGH',
    timestamp: '14 mins ago',
    resolved: false,
  },
  {
    id: 't2',
    type: 'SQUATTER_BREACH',
    title: 'Gate-vs-Booking Squatter Breach (Court 01)',
    detail: 'Court 01 booked for 10 players, but Quickdash recorded 14 valid Tier-0 entry scans (+4 overage).',
    severity: 'HIGH',
    timestamp: '32 mins ago',
    resolved: false,
  },
  {
    id: 't3',
    type: 'OVERRIDE',
    title: 'B2B Organizer Affiliation Handshake Pending',
    detail: 'Organizer @bgc.pickleball requests verified club affiliation (wholesale court block + 70/30 split ledger).',
    severity: 'MEDIUM',
    timestamp: '1 hr ago',
    resolved: false,
  },
];

export const INITIAL_AT_RISK: AtRiskMember[] = [
  {
    id: 'm1',
    name: 'BGC Pickleball Club (Organizer)',
    avatar: 'BP',
    riskScore: 94,
    lastVisit: '31 days dormant',
    attendanceDrop: 'Weekly League → 0 bookings',
    plan: 'Verified Affiliate Organizer',
    offerSent: false,
  },
  {
    id: 'm2',
    name: 'Carlos Mendoza (Member)',
    avatar: 'CM',
    riskScore: 88,
    lastVisit: '14 days ago',
    attendanceDrop: '4x/wk → 0 visits',
    plan: 'Nexus VIP Annual',
    offerSent: false,
  },
  {
    id: 'm3',
    name: 'Patricia Lim (Member)',
    avatar: 'PL',
    riskScore: 76,
    lastVisit: '9 days ago',
    attendanceDrop: '3x/wk → 1 visit/mo',
    plan: 'Monthly All-Access',
    offerSent: false,
  },
];
