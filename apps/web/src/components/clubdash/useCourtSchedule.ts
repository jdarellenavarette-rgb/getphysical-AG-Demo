'use client';

import { useCallback, useMemo, useState } from 'react';
import { SEED_BOOKINGS } from './seed';
import { toMinutes, validateBooking, type BookingDraft, type CourtBooking } from './scheduling';

export const DAY_COUNT = 7;

/** Bookings per day offset; validation runs against the selected day's bookings. */
export function useCourtSchedule() {
  const [dayOffset, setDayOffset] = useState(0);
  const [byDay, setByDay] = useState<Record<number, CourtBooking[]>>(() => ({ ...SEED_BOOKINGS }));

  const bookings = useMemo(() => [...(byDay[dayOffset] ?? [])].sort((a, b) => a.start - b.start), [byDay, dayOffset]);

  const add = useCallback(
    (draft: BookingDraft): CourtBooking | null => {
      const current = byDay[dayOffset] ?? [];
      if (validateBooking(draft, current).length > 0) return null;
      const start = toMinutes(draft.startTime);
      if (start === null) return null;
      const booking: CourtBooking = { id: `bk_${Date.now()}`, court: draft.court, start, end: start + draft.duration, label: draft.label.trim() };
      setByDay((prev) => ({ ...prev, [dayOffset]: [...(prev[dayOffset] ?? []), booking] }));
      return booking;
    },
    [byDay, dayOffset]
  );

  const cancel = useCallback(
    (id: string) => setByDay((prev) => ({ ...prev, [dayOffset]: (prev[dayOffset] ?? []).filter((b) => b.id !== id) })),
    [dayOffset]
  );

  const countFor = useCallback((offset: number) => (byDay[offset] ?? []).length, [byDay]);

  return { dayOffset, setDayOffset, bookings, add, cancel, countFor };
}
