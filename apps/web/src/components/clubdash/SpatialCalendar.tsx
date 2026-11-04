'use client';

import React, { useState } from 'react';
import { Layers, Clock, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { useSuiteTheme } from '../suite/theme';

interface SlotBooking {
  id: string;
  timeSlot: string;
  parentLockedByChild: boolean;
  childBookings: { [childCourtId: string]: string | null };
  parentBookedBy: string | null;
}

const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
];

const INITIAL_SCHEDULE: SlotBooking[] = [
  {
    id: 's1',
    timeSlot: '08:00 - 09:00',
    parentLockedByChild: false,
    childBookings: { 'A': null, 'B': null, 'C': null },
    parentBookedBy: null,
  },
  {
    id: 's2',
    timeSlot: '09:00 - 10:00',
    parentLockedByChild: false,
    childBookings: { 'A': null, 'B': null, 'C': null },
    parentBookedBy: 'Metro Varsity League (Full Court)',
  },
  {
    id: 's3',
    timeSlot: '10:00 - 11:00',
    parentLockedByChild: true,
    childBookings: { 'A': 'Mark D. (Pickleball)', 'B': null, 'C': 'Coach Rafael (Drill)' },
    parentBookedBy: null,
  },
  {
    id: 's4',
    timeSlot: '11:00 - 12:00',
    parentLockedByChild: false,
    childBookings: { 'A': null, 'B': null, 'C': null },
    parentBookedBy: null,
  },
  {
    id: 's5',
    timeSlot: '13:00 - 14:00',
    parentLockedByChild: false,
    childBookings: { 'A': null, 'B': null, 'C': null },
    parentBookedBy: null,
  },
  {
    id: 's6',
    timeSlot: '14:00 - 15:00',
    parentLockedByChild: true,
    childBookings: { 'A': 'Tournament Heat 1', 'B': 'Tournament Heat 2', 'C': 'Tournament Heat 3' },
    parentBookedBy: null,
  },
  {
    id: 's7',
    timeSlot: '17:00 - 18:00',
    parentLockedByChild: true,
    childBookings: { 'A': 'DUPR Ladder Alpha', 'B': 'DUPR Ladder Beta', 'C': null },
    parentBookedBy: null,
  },
  {
    id: 's8',
    timeSlot: '18:00 - 19:00',
    parentLockedByChild: false,
    childBookings: { 'A': null, 'B': null, 'C': null },
    parentBookedBy: null,
  },
];

export function SpatialCalendar() {
  const { theme, isDark } = useSuiteTheme();
  const [schedule, setSchedule] = useState<SlotBooking[]>(INITIAL_SCHEDULE);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 - 11:00');
  const [notice, setNotice] = useState<string | null>(null);

  const current: SlotBooking = schedule.find((s) => s.timeSlot === selectedSlot) ?? INITIAL_SCHEDULE[0]!;

  const bookParentCourt = () => {
    const hasChildBookings = Object.values(current.childBookings).some((val) => val !== null);
    if (hasChildBookings) {
      setNotice('Spatial Collision Conflict: Cannot book Full Basketball Court while sub-divided child pickleball courts have active reservations.');
      return;
    }
    setSchedule((prev) =>
      prev.map((s) =>
        s.timeSlot === selectedSlot
          ? { ...s, parentBookedBy: 'Reserved Corporate Rental' }
          : s
      )
    );
    setNotice(`Successfully reserved Full Basketball Court for ${selectedSlot} (+ 15m changeover buffer).`);
  };

  const bookChildCourt = (courtId: 'A' | 'B' | 'C') => {
    if (current.parentBookedBy) {
      setNotice(`Spatial Collision Conflict: Child Pickleball Court ${courtId} is locked because Full Basketball Court is reserved.`);
      return;
    }
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.timeSlot === selectedSlot) {
          const updated = { ...s.childBookings, [courtId]: 'Booked Online Pass (You)' };
          return { ...s, childBookings: updated, parentLockedByChild: true };
        }
        return s;
      })
    );
    setNotice(`Pickleball Court ${courtId} confirmed for ${selectedSlot}. Full Parent Court automatically locked.`);
  };

  return (
    <div
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: theme.shadowCard,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color={theme.accent} />
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.3px' }}>
              Clubdash Facility Booking Allocator
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px', fontWeight: 500 }}>
            Real-time parent-child spatial mutual exclusion with automated 15-minute changeover buffers
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: theme.accentGreenMuted,
            border: '1px solid rgba(5, 150, 105, 0.25)',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '11px',
            color: '#059669',
            fontWeight: 800,
          }}
        >
          <Clock size={13} />
          <span>15m Changeover Guard Active</span>
        </div>
      </div>

      {notice && (
        <div
          style={{
            backgroundColor: notice.includes('Conflict') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(5, 150, 105, 0.1)',
            border: `1px solid ${notice.includes('Conflict') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(5, 150, 105, 0.3)'}`,
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '12px',
            fontWeight: 600,
            color: notice.includes('Conflict') ? '#EF4444' : '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {notice.includes('Conflict') ? <AlertCircle size={15} /> : <ShieldCheck size={15} />}
          <span>{notice}</span>
        </div>
      )}

      {/* Time Slot Selector */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>
          Select Schedule Window
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {TIME_SLOTS.map((slot) => {
            const slotData = schedule.find((s) => s.timeSlot === slot);
            const isParentBooked = !!slotData?.parentBookedBy;
            const isChildActive = Object.values(slotData?.childBookings || {}).some((v) => v !== null);
            const isSelected = selectedSlot === slot;

            return (
              <button
                key={slot}
                onClick={() => { setSelectedSlot(slot); setNotice(null); }}
                style={{
                  padding: '9px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  backgroundColor: isSelected ? theme.accent : theme.bgCardSecondary,
                  color: isSelected ? '#FFFFFF' : theme.textPrimary,
                  border: `1px solid ${isSelected ? theme.accent : theme.borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '115px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? theme.shadowPill : 'none',
                }}
              >
                <span>{slot}</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    marginTop: '4px',
                    color: isSelected ? '#FFE4E6' : isParentBooked ? '#EF4444' : isChildActive ? '#D97706' : '#059669',
                  }}
                >
                  {isParentBooked ? 'Full Court' : isChildActive ? 'Subdivided' : 'Available'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Spatial Court Blueprint */}
      <div
        style={{
          backgroundColor: theme.bgCardSecondary,
          border: `2px dashed ${theme.borderColor}`,
          borderRadius: '16px',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: theme.textPrimary }}>
              Parent Spatial Asset: Arena Court 01 (Full Hardwood FIBA Basketball)
            </div>
            <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px' }}>
              Occupies 3 Pickleball sub-divisions simultaneously when reserved
            </div>
          </div>
          <button
            disabled={!!current.parentBookedBy || Object.values(current.childBookings).some((v) => v !== null)}
            onClick={bookParentCourt}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              backgroundColor: current.parentBookedBy
                ? 'rgba(239, 68, 68, 0.15)'
                : Object.values(current.childBookings).some((v) => v !== null)
                ? (isDark ? '#262B37' : '#E2E8F0')
                : '#059669',
              color: current.parentBookedBy
                ? '#EF4444'
                : Object.values(current.childBookings).some((v) => v !== null)
                ? theme.textMuted
                : '#FFFFFF',
              border: 'none',
              cursor: current.parentBookedBy || Object.values(current.childBookings).some((v) => v !== null) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {current.parentBookedBy ? 'Full Court Reserved' : Object.values(current.childBookings).some((v) => v !== null) ? 'Locked by Child Courts' : 'Book Full Court (₱1,500/hr)'}
          </button>
        </div>

        {/* Sub-Divided Child Courts */}
        <div style={{ fontSize: '12px', fontWeight: 800, color: theme.textSecondary, marginBottom: '10px' }}>
          Physical Sub-Divisions (3x Pickleball / Badminton Courts):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {(['A', 'B', 'C'] as const).map((court) => {
            const bookedBy = current.childBookings[court];
            const isLockedByParent = !!current.parentBookedBy;

            return (
              <div
                key={court}
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1.5px solid ${bookedBy ? '#F59E0B' : isLockedByParent ? '#EF4444' : theme.borderColor}`,
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: theme.textPrimary }}>Court {court} (Pickleball)</span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: isLockedByParent
                          ? 'rgba(239, 68, 68, 0.12)'
                          : bookedBy
                          ? 'rgba(245, 158, 11, 0.12)'
                          : 'rgba(5, 150, 105, 0.12)',
                        color: isLockedByParent ? '#EF4444' : bookedBy ? '#D97706' : '#059669',
                      }}
                    >
                      {isLockedByParent ? 'PARENT LOCKED' : bookedBy ? 'OCCUPIED' : 'OPEN'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: theme.textMuted, minHeight: '34px', lineHeight: '16px', fontWeight: 500 }}>
                    {isLockedByParent ? `Parent court rented: ${current.parentBookedBy}` : bookedBy ? `Booked: ${bookedBy}` : 'Regulation Pickleball net layout ready'}
                  </p>
                </div>

                <button
                  disabled={isLockedByParent || !!bookedBy}
                  onClick={() => bookChildCourt(court)}
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: isLockedByParent || bookedBy ? (isDark ? '#262B37' : '#F1F5F9') : theme.accent,
                    color: isLockedByParent || bookedBy ? theme.textMuted : '#FFFFFF',
                    border: 'none',
                    cursor: isLockedByParent || bookedBy ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isLockedByParent ? 'Court Unavailable' : bookedBy ? 'Occupied' : 'Book Court (₱200/hr)'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
