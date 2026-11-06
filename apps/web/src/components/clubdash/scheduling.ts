import { REGISTRY_HARD_LIMITS } from 'sodia-core/constants';

export const CHANGEOVER_MIN = REGISTRY_HARD_LIMITS.COURT_CHANGEOVER_BUFFER_MINUTES;
export const OPEN_MIN = 6 * 60;
export const CLOSE_MIN = 23 * 60;
export const SLOT_STEP_MIN = 15;
export const DURATION_OPTIONS = [30, 45, 60, 90, 120, 180] as const;

export type CourtId = 'FULL' | 'A' | 'B' | 'C';

export const COURTS: readonly { id: CourtId; label: string; short: string; ratePhp: number }[] = [
  { id: 'FULL', label: 'Arena Court 01 (Full basketball)', short: 'Full court', ratePhp: 1500 },
  { id: 'A', label: 'Court A (Pickleball)', short: 'Court A', ratePhp: 200 },
  { id: 'B', label: 'Court B (Pickleball)', short: 'Court B', ratePhp: 200 },
  { id: 'C', label: 'Court C (Pickleball)', short: 'Court C', ratePhp: 200 },
];

export interface CourtBooking {
  id: string;
  court: CourtId;
  /** Minutes from local midnight. */
  start: number;
  end: number;
  label: string;
}

export interface BookingDraft {
  court: CourtId;
  startTime: string; // "HH:MM"
  duration: number;
  label: string;
}

export type BookingField = keyof BookingDraft;

export interface BookingIssue {
  field: BookingField;
  code: 'required' | 'format' | 'grid' | 'hours' | 'overlap' | 'changeover' | 'length';
  message: string;
  /** Earliest valid start (minutes) when the issue is a collision/changeover. */
  suggestion?: number;
}

export function courtLabel(id: CourtId): string {
  return COURTS.find((c) => c.id === id)?.short ?? id;
}

/** The full court physically contains A/B/C, so it conflicts with every child court and vice-versa. */
export function courtsConflict(a: CourtId, b: CourtId): boolean {
  return a === b || a === 'FULL' || b === 'FULL';
}

export function toMinutes(hhmm: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** True when [start,end) plus the changeover buffer on either side touches booking b. */
function clashes(start: number, end: number, b: CourtBooking): 'overlap' | 'changeover' | null {
  if (start < b.end && b.start < end) return 'overlap';
  if (start < b.end + CHANGEOVER_MIN && b.start < end + CHANGEOVER_MIN) return 'changeover';
  return null;
}

/** Earliest start >= `from` on the 15-min grid that fits `duration` within hours without clashes. */
export function nextValidStart(court: CourtId, from: number, duration: number, bookings: readonly CourtBooking[]): number | null {
  const relevant = bookings.filter((b) => courtsConflict(b.court, court));
  for (let s = Math.ceil(from / SLOT_STEP_MIN) * SLOT_STEP_MIN; s + duration <= CLOSE_MIN; s += SLOT_STEP_MIN) {
    if (s < OPEN_MIN) continue;
    if (!relevant.some((b) => clashes(s, s + duration, b))) return s;
  }
  return null;
}

/** Field-level validation for a booking draft, including the changeover buffer rule. */
export function validateBooking(draft: BookingDraft, bookings: readonly CourtBooking[]): BookingIssue[] {
  const issues: BookingIssue[] = [];
  const label = draft.label.trim();
  if (!label) issues.push({ field: 'label', code: 'required', message: 'Add who the booking is for.' });
  else if (label.length > 60) issues.push({ field: 'label', code: 'length', message: 'Keep the booking name under 60 characters.' });

  const start = toMinutes(draft.startTime);
  if (start === null) {
    issues.push({ field: 'startTime', code: 'format', message: 'Enter a start time like 14:30.' });
    return issues;
  }
  if (start % SLOT_STEP_MIN !== 0) {
    issues.push({ field: 'startTime', code: 'grid', message: `Start times run in ${SLOT_STEP_MIN}-minute steps (e.g. ${formatMinutes(start - (start % SLOT_STEP_MIN))}).` });
    return issues;
  }
  const end = start + draft.duration;
  if (start < OPEN_MIN || end > CLOSE_MIN) {
    issues.push({ field: 'startTime', code: 'hours', message: `Bookings must fit within operating hours ${formatMinutes(OPEN_MIN)}–${formatMinutes(CLOSE_MIN)}.` });
    return issues;
  }

  for (const b of bookings) {
    if (!courtsConflict(b.court, draft.court)) continue;
    const kind = clashes(start, end, b);
    if (!kind) continue;
    const suggestion = nextValidStart(draft.court, start, draft.duration, bookings) ?? undefined;
    const where = b.court === draft.court ? courtLabel(b.court) : `${courtLabel(b.court)} (shares the same floor)`;
    const span = `${formatMinutes(b.start)}–${formatMinutes(b.end)}`;
    issues.push({
      field: 'startTime',
      code: kind,
      suggestion,
      message:
        kind === 'overlap'
          ? `${where} is already booked ${span} for ${b.label}.`
          : `Needs a ${CHANGEOVER_MIN}-min changeover: ${where} is booked ${span} for ${b.label}.`,
    });
    break;
  }
  return issues;
}
