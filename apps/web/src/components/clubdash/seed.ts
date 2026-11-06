import type { CourtBooking } from './scheduling';

const h = (hh: number, mm = 0) => hh * 60 + mm;

/** Seed bookings keyed by day offset from today (0 = today). Days without a key start empty. */
export const SEED_BOOKINGS: Record<number, CourtBooking[]> = {
  0: [
    { id: 'b1', court: 'FULL', start: h(9), end: h(10), label: 'Metro Varsity League' },
    { id: 'b2', court: 'A', start: h(10, 15), end: h(11, 15), label: 'Mark D. (Pickleball)' },
    { id: 'b3', court: 'C', start: h(10, 15), end: h(11, 45), label: 'Coach Rafael (Drill)' },
    { id: 'b4', court: 'A', start: h(14), end: h(15), label: 'Tournament Heat 1' },
    { id: 'b5', court: 'B', start: h(14), end: h(15), label: 'Tournament Heat 2' },
    { id: 'b6', court: 'C', start: h(14), end: h(15), label: 'Tournament Heat 3' },
    { id: 'b7', court: 'A', start: h(17), end: h(18), label: 'DUPR Ladder Alpha' },
    { id: 'b8', court: 'B', start: h(17), end: h(18), label: 'DUPR Ladder Beta' },
  ],
  1: [
    { id: 'b9', court: 'FULL', start: h(18), end: h(20), label: 'Corporate Basketball Cup' },
    { id: 'b10', court: 'B', start: h(7), end: h(8), label: 'Early Bird Doubles' },
  ],
};
