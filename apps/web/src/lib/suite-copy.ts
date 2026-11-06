import type { NavTab, SuiteMode } from './suite-routes';

export interface SuiteInfo {
  title: string;
  meta: string;
  badge: string;
}

export const SUITE_INFO: Record<SuiteMode, SuiteInfo> = {
  GYMDASH: {
    title: 'Metro Core Arena',
    meta: 'Registry A • Commercial Gym OS • 883 Daily Active • Turnstiles & Till',
    badge: 'Turnstiles Live (60s TOTP)',
  },
  CLUBDASH: {
    title: 'Metro Sports Complex & Racket Club',
    meta: 'Registry B • GymDash + Facility Court Bookings & Organizer Affiliations',
    badge: 'Spatial Courts & Leagues Live',
  },
  COACHDASH: {
    title: 'Coach Darelle Navarette (IFBB CPFT) Training Studio',
    meta: 'Registry C • IFBB Certified Trainer • Hypertrophy, Racket & Combat Conditioning',
    badge: '32 Coached Athletes Active',
  },
  ORGANIZERDASH: {
    title: 'Metro Tournament & Event League HQ',
    meta: 'Registry B Organizer Pro • Event Rosters, Brackets & Participant CRM',
    badge: '420 Entrants • 100% Seeded',
  },
};

export const SUITE_DESCRIPTIONS: Record<SuiteMode, string> = {
  GYMDASH: 'Commercial Gym OS with turnstiles, 60s TOTP gate telemetry, cashier till float, and member density.',
  CLUBDASH: 'GymDash plus spatial court booking allocator, parent-child mutual exclusion, and club league affiliations.',
  COACHDASH: 'Coach dashboard to organize workout programs & cycles, manage athlete roster, and triage morning compliance CRM.',
  ORGANIZERDASH: 'Tournament OS to organize bracket seeds, division participants, escrow prize pools, and verify digital passes.',
};

interface PageCopy {
  title: string;
  subtitle: string;
}

type PageCopyTable = Record<Exclude<NavTab, 'DASHBOARD' | 'SETTINGS'>, Record<SuiteMode, PageCopy>>;

const COURT_ALLOCATOR: PageCopy = {
  title: 'Clubdash Spatial Court Allocator',
  subtitle: `Parent basketball court ↔ child pickleball/padel courts A/B/C with an enforced changeover buffer between bookings.`,
};

const FRONT_DESK: PageCopy = {
  title: 'Front Desk POS & Maya Settlement',
  subtitle: 'Turnstile check-in validation, pass provisioning, and point-of-sale split checkout.',
};

const GATE_TRIAGE: PageCopy = {
  title: 'Turnstile Triage & At-Risk Members',
  subtitle: 'Live gate security telemetry, squatter alerts, and member attendance triage.',
};

const INBOX: PageCopy = {
  title: 'Unified Athletic Inbox & Member CRM',
  subtitle: 'Turnstile access denials, coach form checks, at-risk member win-backs, and organizer match queues.',
};

export const PAGE_COPY: PageCopyTable = {
  SPATIAL: {
    GYMDASH: COURT_ALLOCATOR,
    CLUBDASH: COURT_ALLOCATOR,
    COACHDASH: {
      title: 'Coach Client Schedule & Macrocycle Calendar',
      subtitle: 'Manage 1-on-1 personal training windows, gym floor fee sessions, and client macrocycles.',
    },
    ORGANIZERDASH: {
      title: 'Tournament Game-Day Match Schedule',
      subtitle: 'Assigned match courts, referee allocations, and live tournament whistle times.',
    },
  },
  INBOX: { GYMDASH: INBOX, CLUBDASH: INBOX, COACHDASH: INBOX, ORGANIZERDASH: INBOX },
  BILLING: {
    GYMDASH: FRONT_DESK,
    CLUBDASH: FRONT_DESK,
    COACHDASH: {
      title: 'Coach Payouts & Gym Floor Fee Settlement',
      subtitle: 'Personal training session pack receipts with automated ₱150 gym floor fee deductions.',
    },
    ORGANIZERDASH: {
      title: 'Tournament Registration Escrow & Prize Pool',
      subtitle: 'Multi-participant registration pool with automated facility split disbursement.',
    },
  },
  TRIAGE: {
    GYMDASH: GATE_TRIAGE,
    CLUBDASH: GATE_TRIAGE,
    COACHDASH: {
      title: 'Morning Athlete Compliance & Form Review Triage',
      subtitle: 'Review athlete planned vs. actual workout logs, 1RM submissions, and 3-day negative delta alerts.',
    },
    ORGANIZERDASH: {
      title: 'Participant Waiver & Check-In Verification Triage',
      subtitle: 'Live participant waiver status, check-in gate clearance, and seed dispute queue.',
    },
  },
};
