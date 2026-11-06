'use client';

import React from 'react';
import { CHANGEOVER_MIN, CLOSE_MIN, COURTS, OPEN_MIN, formatMinutes, type CourtBooking } from './scheduling';

const SPAN = CLOSE_MIN - OPEN_MIN;
const HOURS = Array.from({ length: (CLOSE_MIN - OPEN_MIN) / 60 + 1 }, (_, i) => OPEN_MIN + i * 60);
const pct = (min: number) => `${((min - OPEN_MIN) / SPAN) * 100}%`;
const width = (mins: number) => `${(mins / SPAN) * 100}%`;

/** Visual day grid (Google Calendar resource view). The booking list below it is the accessible equivalent. */
export function CourtTimeline({ bookings, preview }: { bookings: readonly CourtBooking[]; preview?: CourtBooking | null }) {
  return (
    <div className="gp-timeline" aria-hidden="true">
      <div className="gp-timeline-grid">
        <div className="gp-timeline-row" style={{ minHeight: 28, borderBottom: '1px solid var(--gp-border-color)' }}>
          <span />
          <div className="gp-timeline-track">
            {HOURS.map((h, i) => (
              <span key={h} style={{ position: 'absolute', left: pct(h), transform: i === 0 ? 'none' : i === HOURS.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)', fontSize: 11, color: 'var(--gp-text-muted)', fontWeight: 700, top: 6 }}>
                {formatMinutes(h).slice(0, 2)}
              </span>
            ))}
          </div>
        </div>
        {COURTS.map((court) => {
          const rowBookings = bookings.filter((b) => b.court === court.id);
          const parentLock = court.id !== 'FULL' ? bookings.filter((b) => b.court === 'FULL') : bookings.filter((b) => b.court !== 'FULL');
          return (
            <div key={court.id} className="gp-timeline-row">
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gp-text-primary)', alignSelf: 'center', paddingRight: 8 }}>{court.short}</span>
              <div className="gp-timeline-track" style={{ backgroundImage: 'linear-gradient(90deg, var(--gp-border-light) 1px, transparent 1px)', backgroundSize: `${(60 / SPAN) * 100}% 100%` }}>
                {parentLock.map((b) => (
                  <span key={`lock-${b.id}`} style={{ position: 'absolute', top: 18, bottom: 18, left: pct(b.start), width: width(b.end - b.start), backgroundColor: 'var(--gp-border-color)', borderRadius: 4, opacity: 0.6 }} />
                ))}
                {rowBookings.map((b) => (
                  <React.Fragment key={b.id}>
                    <span className="gp-timeline-block" style={{ left: pct(b.start), width: width(b.end - b.start), backgroundColor: b.court === 'FULL' ? 'var(--gp-info)' : 'var(--gp-accent)', color: '#FFFFFF' }} title={`${b.label} ${formatMinutes(b.start)}–${formatMinutes(b.end)}`}>
                      {b.label}
                    </span>
                    <span className="gp-timeline-buffer" style={{ left: pct(b.end), width: width(CHANGEOVER_MIN) }} />
                  </React.Fragment>
                ))}
                {preview && preview.court === court.id && (
                  <span className="gp-timeline-block" style={{ left: pct(preview.start), width: width(preview.end - preview.start), border: '2px dashed var(--gp-accent-green)', backgroundColor: 'var(--gp-accent-green-muted)', color: 'var(--gp-accent-green)' }}>
                    New
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
