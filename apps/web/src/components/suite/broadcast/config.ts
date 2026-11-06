import type { CrmAudience } from 'sodia-core';
import type { SuiteMode } from '../../../lib/suite-routes';

export interface BroadcastModalConfig {
  title: string;
  sub: string;
  segments: readonly { id: CrmAudience; label: string }[];
  placeholderTitle: string;
  placeholderBody: string;
  promoLabel: string;
}

export const BROADCAST_CONFIG: Record<SuiteMode, BroadcastModalConfig> = {
  GYMDASH: {
    title: 'Manage Messaging & Promos',
    sub: 'Send newsletters, promos, and reminders within your gym',
    segments: [
      { id: 'ALL', label: 'All Active (883)' },
      { id: 'SEGMENT_1', label: 'At-Risk (42)' },
      { id: 'SEGMENT_2', label: 'VIP Pass (210)' },
      { id: 'SEGMENT_3', label: 'Class Enrollees (540)' },
    ],
    placeholderTitle: 'e.g. Flash 48-Hour Recovery Clinic & Sauna Access',
    placeholderBody: 'Exclusive recovery masterclass with verified PR reviews this Saturday.',
    promoLabel: 'Attach promo voucher (optional)',
  },
  CLUBDASH: {
    title: 'Facility & Affiliated Club Broadcast',
    sub: 'Broadcast court schedule changes and affiliated club notices',
    segments: [
      { id: 'ALL', label: 'All Players (640)' },
      { id: 'SEGMENT_1', label: 'Affiliated Clubs (18)' },
      { id: 'SEGMENT_2', label: 'Peak Court Bookers' },
      { id: 'SEGMENT_3', label: 'Tournament Entrants' },
    ],
    placeholderTitle: 'e.g. Court 3 & 4 Resurfacing Tomorrow 06:00-10:00',
    placeholderBody: 'Notice to all affiliated leagues: Alternate slots reserved in Court Alpha.',
    promoLabel: 'Attach court booking credit (optional)',
  },
  COACHDASH: {
    title: 'Coach Client CRM & Program Nudge',
    sub: 'Send macrocycle updates, recovery reminders, and client nudges',
    segments: [
      { id: 'ALL', label: 'All Clients (32)' },
      { id: 'SEGMENT_1', label: 'Hypertrophy Track' },
      { id: 'SEGMENT_2', label: 'Hyrox Endurance' },
      { id: 'SEGMENT_3', label: 'At-Risk / Missing Logs (4)' },
    ],
    placeholderTitle: 'e.g. Week 4 Deload & 1RM Progression Check',
    placeholderBody: 'Ensure your post-workout heart rates and video form checks are logged today.',
    promoLabel: 'Attach session pack bonus (optional)',
  },
  ORGANIZERDASH: {
    title: 'Tournament Participant Broadcast',
    sub: 'Dispatch bracket updates, check-in calls, and rule packs',
    segments: [
      { id: 'ALL', label: 'All Participants (420)' },
      { id: 'SEGMENT_1', label: 'Men / Women Open (128)' },
      { id: 'SEGMENT_2', label: 'Mixed Doubles (96)' },
      { id: 'SEGMENT_3', label: 'Unverified Waivers (8)' },
    ],
    placeholderTitle: 'e.g. Official Bracket Draw Released',
    placeholderBody: 'All team captains must check in at Gate B 30 minutes prior to first whistle.',
    promoLabel: 'Attach spectator pass code (optional)',
  },
};

/** Browser event the inbox listens to for instant local echo of a sent broadcast. */
export const LOCAL_BROADCAST_EVENT = 'sodia_crm_broadcast_sent';
