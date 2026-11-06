'use client';

import React, { forwardRef, useState } from 'react';
import { Plus, Wand2 } from 'lucide-react';
import { FormField } from '../ui/FormField';
import {
  CHANGEOVER_MIN,
  COURTS,
  DURATION_OPTIONS,
  formatMinutes,
  validateBooking,
  type BookingDraft,
  type BookingField,
  type CourtBooking,
  type CourtId,
} from './scheduling';

interface BookingFormProps {
  draft: BookingDraft;
  onChange: (draft: BookingDraft) => void;
  bookings: readonly CourtBooking[];
  onSubmit: (draft: BookingDraft) => boolean;
}

/** Inline-validated booking form: collisions and the changeover buffer are checked live as the draft changes. */
export const BookingForm = forwardRef<HTMLSelectElement, BookingFormProps>(function BookingForm({ draft, onChange, bookings, onSubmit }, courtRef) {
  const [touched, setTouched] = useState<Partial<Record<BookingField, boolean>>>({});
  const issues = validateBooking(draft, bookings);
  const issueFor = (f: BookingField) => (touched[f] ? issues.find((i) => i.field === f) : undefined);
  const timeIssue = issueFor('startTime');

  const set = <K extends BookingField>(field: K, value: BookingDraft[K]) => {
    onChange({ ...draft, [field]: value });
    if (field !== 'label') setTouched((t) => ({ ...t, startTime: true, [field]: true }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ court: true, startTime: true, duration: true, label: true });
    if (issues.length > 0) return;
    if (onSubmit(draft)) setTouched({});
  };

  const rate = COURTS.find((c) => c.id === draft.court)?.ratePhp ?? 0;

  return (
    <form noValidate onSubmit={submit} className="gp-subcard" style={{ display: 'grid', gap: 14 }} aria-labelledby="gp-booking-form-title">
      <div className="gp-row-between">
        <h3 id="gp-booking-form-title" className="gp-section-title" style={{ fontSize: 15 }}>
          New booking
        </h3>
        <span style={{ fontSize: 12, color: 'var(--gp-text-muted)', fontWeight: 600 }}>
          ₱{((rate * draft.duration) / 60).toLocaleString()} · {CHANGEOVER_MIN}-min changeover enforced
        </span>
      </div>
      <div className="gp-grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))' }}>
        <FormField label="Court">
          {(p) => (
            <select ref={courtRef} {...p} className="gp-select" value={draft.court} onChange={(e) => set('court', (COURTS.find((c) => c.id === e.target.value)?.id ?? 'A') satisfies CourtId)}>
              {COURTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField label="Start time" error={timeIssue?.message}>
          {(p) => <input {...p} className="gp-input" type="time" step={900} value={draft.startTime} onChange={(e) => set('startTime', e.target.value)} onBlur={() => setTouched((t) => ({ ...t, startTime: true }))} />}
        </FormField>
        <FormField label="Duration">
          {(p) => (
            <select {...p} className="gp-select" value={draft.duration} onChange={(e) => set('duration', Number(e.target.value))}>
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d < 60 ? `${d} min` : `${d / 60} h${d % 60 ? ` ${d % 60} min` : ''}`}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField label="Booked for" error={issueFor('label')?.message}>
          {(p) => (
            <input
              {...p}
              className="gp-input"
              type="text"
              value={draft.label}
              placeholder="e.g. Mark D. (Pickleball)"
              onChange={(e) => set('label', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, label: true }))}
            />
          )}
        </FormField>
      </div>
      <div className="gp-row" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {timeIssue?.suggestion !== undefined && (
          <button type="button" className="gp-btn gp-btn-secondary gp-btn-sm" onClick={() => set('startTime', formatMinutes(timeIssue.suggestion ?? 0))}>
            <Wand2 size={13} aria-hidden="true" /> Use next free slot {formatMinutes(timeIssue.suggestion)}
          </button>
        )}
        <button type="submit" className="gp-btn gp-btn-primary">
          <Plus size={15} aria-hidden="true" /> Add booking
        </button>
      </div>
    </form>
  );
});
