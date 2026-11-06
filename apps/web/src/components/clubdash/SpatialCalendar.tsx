'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Clock, Layers, Trash2 } from 'lucide-react';
import { createEmptyState, createSuccessState, type TenStateEnvelope } from 'sodia-core/states';
import { StateView, SuccessNotice } from '../ui/StateView';
import { BookingForm } from './BookingForm';
import { CourtTimeline } from './CourtTimeline';
import { DAY_COUNT, useCourtSchedule } from './useCourtSchedule';
import { CHANGEOVER_MIN, courtLabel, formatMinutes, toMinutes, validateBooking, type BookingDraft, type CourtBooking } from './scheduling';

const DAY_MS = 86_400_000;

function dayLabel(offset: number): string {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  return new Date(Date.now() + offset * DAY_MS).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
}

/** Clubdash spatial court allocator: parent/child mutual exclusion + enforced changeover buffer. */
export function SpatialCalendar() {
  const schedule = useCourtSchedule();
  const [draft, setDraft] = useState<BookingDraft>({ court: 'A', startTime: '11:00', duration: 60, label: '' });
  const [notice, setNotice] = useState<string | null>(null);
  const formRef = useRef<HTMLSelectElement>(null);

  const preview: CourtBooking | null = useMemo(() => {
    const start = toMinutes(draft.startTime);
    if (start === null || validateBooking({ ...draft, label: draft.label || 'preview' }, schedule.bookings).length > 0) return null;
    return { id: 'preview', court: draft.court, start, end: start + draft.duration, label: 'New' };
  }, [draft, schedule.bookings]);

  const dayState: TenStateEnvelope<readonly CourtBooking[]> =
    schedule.bookings.length === 0
      ? createEmptyState('No courts are booked for this day yet.', 'Add the first booking')
      : createSuccessState<readonly CourtBooking[]>(schedule.bookings);

  return (
    <section className="gp-card gp-stack" aria-labelledby="gp-allocator-title">
      <div className="gp-row-between">
        <div style={{ minWidth: 0 }}>
          <h2 id="gp-allocator-title" className="gp-row gp-section-title" style={{ fontSize: 18 }}>
            <Layers size={20} color="var(--gp-accent)" aria-hidden="true" /> Facility booking allocator
          </h2>
          <p style={{ fontSize: 13, color: 'var(--gp-text-muted)', marginTop: 2 }}>
            Full court and sub-courts A/B/C are mutually exclusive; every booking is followed by a {CHANGEOVER_MIN}-minute changeover.
          </p>
        </div>
        <span className="gp-badge gp-badge-success" style={{ padding: '6px 12px' }}>
          <Clock size={13} aria-hidden="true" /> {CHANGEOVER_MIN}m changeover guard
        </span>
      </div>

      <div className="gp-scroll-x" role="group" aria-label="Choose day">
        {Array.from({ length: DAY_COUNT }, (_, offset) => (
          <button
            key={offset}
            type="button"
            className="gp-chip"
            aria-pressed={schedule.dayOffset === offset}
            onClick={() => {
              schedule.setDayOffset(offset);
              setNotice(null);
            }}
          >
            <span suppressHydrationWarning>{dayLabel(offset)}</span>
            <span className="gp-chip-count" aria-label={`${schedule.countFor(offset)} bookings`}>
              {schedule.countFor(offset)}
            </span>
          </button>
        ))}
      </div>

      {notice && <SuccessNotice>{notice}</SuccessNotice>}

      <StateView state={dayState} emptyTitle="Empty day" onPrimaryAction={() => formRef.current?.focus()} compact>
        {(bookings) => (
          <>
            <CourtTimeline bookings={bookings} preview={preview} />
            <ul aria-label="Bookings for the selected day" style={{ listStyle: 'none', display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', marginTop: 12 }}>
              {bookings.map((b) => (
                <li key={b.id} className="gp-subcard gp-row-between" style={{ padding: '10px 12px', borderRadius: 12, flexWrap: 'nowrap' }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--gp-text-muted)' }}>
                      {courtLabel(b.court)} · {formatMinutes(b.start)}–{formatMinutes(b.end)} · free from {formatMinutes(b.end + CHANGEOVER_MIN)}
                    </span>
                  </span>
                  <button type="button" className="gp-icon-btn" onClick={() => schedule.cancel(b.id)} aria-label={`Cancel booking ${b.label} at ${formatMinutes(b.start)}`}>
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </StateView>

      <BookingForm
        ref={formRef}
        draft={draft}
        onChange={(d) => {
          setDraft(d);
          setNotice(null);
        }}
        bookings={schedule.bookings}
        onSubmit={(d) => {
          const booking = schedule.add(d);
          if (!booking) return false;
          setNotice(`${courtLabel(booking.court)} booked ${formatMinutes(booking.start)}–${formatMinutes(booking.end)} for ${booking.label}. Next start allowed at ${formatMinutes(booking.end + CHANGEOVER_MIN)}.`);
          setDraft((prev) => ({ ...prev, label: '' }));
          return true;
        }}
      />
    </section>
  );
}
