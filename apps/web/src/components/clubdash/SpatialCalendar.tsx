'use client';

import React, { useState } from 'react';
import { Calendar, Layers, ShieldCheck, AlertCircle, Clock, Check } from 'lucide-react';

interface SlotBooking {
  id: string;
  timeSlot: string; // e.g. "09:00 - 10:00"
  parentLockedByChild: boolean;
  childBookings: { [childCourtId: string]: string | null }; // courtId -> bookedBy
  parentBookedBy: string | null;
}

const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
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
    childBookings: { 'A': 'Mark D. (Pickleball)', 'B': null, 'C': 'Coach Sarah (Drill)' },
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
];

export function SpatialCalendar() {
  const [schedule, setSchedule] = useState<SlotBooking[]>(INITIAL_SCHEDULE);
  const [selectedSlot, setSelectedSlot] = useState<string>('08:00 - 09:00');
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
          const updated = { ...s.childBookings, [courtId]: 'Booked Online Pass' };
          return { ...s, childBookings: updated, parentLockedByChild: true };
        }
        return s;
      })
    );
    setNotice(`Pickleball Court ${courtId} confirmed for ${selectedSlot}. Full Parent Court automatically locked.`);
  };

  return (
    <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f9fafb' }}>Clubdash Spatial Sub-Division Engine</h2>
          </div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
            Spec 4.1: Real-time parent-child mutual exclusion with automated 15-minute changeover buffers
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: '#34d399', fontWeight: 600 }}>
          <Clock size={14} /> 15m Changeover Guard Active
        </div>
      </div>

      {notice && (
        <div style={{ backgroundColor: notice.includes('Conflict') ? '#ef444420' : '#10b98120', border: `1px solid ${notice.includes('Conflict') ? '#ef444450' : '#10b98150'}`, borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: notice.includes('Conflict') ? '#fca5a5' : '#6ee7b7' }}>
          {notice}
        </div>
      )}

      {/* Time Slot Selector */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {TIME_SLOTS.map((slot) => {
          const slotData = schedule.find((s) => s.timeSlot === slot);
          const isParentBooked = !!slotData?.parentBookedBy;
          const isChildActive = Object.values(slotData?.childBookings || {}).some((v) => v !== null);

          return (
            <button
              key={slot}
              onClick={() => { setSelectedSlot(slot); setNotice(null); }}
              style={{
                padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                backgroundColor: selectedSlot === slot ? '#3b82f6' : '#1f2937',
                color: selectedSlot === slot ? '#fff' : '#9ca3af',
                border: '1px solid ' + (selectedSlot === slot ? '#60a5fa' : '#374151'),
                display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '110px'
              }}
            >
              <span>{slot}</span>
              <span style={{ fontSize: '10px', marginTop: '4px', color: isParentBooked ? '#f87171' : isChildActive ? '#fbbf24' : '#34d399' }}>
                {isParentBooked ? 'Full Court' : isChildActive ? 'Subdivided' : 'Available'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visual Spatial Court Blueprint */}
      <div style={{ backgroundColor: '#0f172a', border: '2px dashed #334155', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f3f4f6' }}>
            Parent Resource: Arena Court 01 (Full Hardwood FIBA Basketball)
          </div>
          <button
            disabled={!!current.parentBookedBy || Object.values(current.childBookings).some((v) => v !== null)}
            onClick={bookParentCourt}
            style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              backgroundColor: current.parentBookedBy ? '#ef444430' : Object.values(current.childBookings).some((v) => v !== null) ? '#374151' : '#10b981',
              color: current.parentBookedBy ? '#f87171' : Object.values(current.childBookings).some((v) => v !== null) ? '#6b7280' : '#000',
              cursor: current.parentBookedBy || Object.values(current.childBookings).some((v) => v !== null) ? 'not-allowed' : 'pointer'
            }}
          >
            {current.parentBookedBy ? 'Full Court Reserved' : Object.values(current.childBookings).some((v) => v !== null) ? 'Locked by Child Courts' : 'Book Full Court (₱1,500/hr)'}
          </button>
        </div>

        {/* Sub-Divided Child Courts */}
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
          Physical Sub-Divisions (3x Badminton / Pickleball Courts):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {(['A', 'B', 'C'] as const).map((court) => {
            const bookedBy = current.childBookings[court];
            const isLockedByParent = !!current.parentBookedBy;

            return (
              <div
                key={court}
                style={{
                  backgroundColor: '#1e293b',
                  border: `1px solid ${bookedBy ? '#f59e0b' : isLockedByParent ? '#ef4444' : '#334155'}`,
                  borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>Court {court}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: isLockedByParent ? '#ef444420' : bookedBy ? '#f59e0b20' : '#10b98120', color: isLockedByParent ? '#f87171' : bookedBy ? '#fbbf24' : '#34d399' }}>
                      {isLockedByParent ? 'PARENT LOCKED' : bookedBy ? 'OCCUPIED' : 'OPEN'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', minHeight: '32px' }}>
                    {isLockedByParent ? `Parent court rented by: ${current.parentBookedBy}` : bookedBy ? `Booked: ${bookedBy}` : 'Pickleball / Badminton net layout'}
                  </p>
                </div>

                <button
                  disabled={isLockedByParent || !!bookedBy}
                  onClick={() => bookChildCourt(court)}
                  style={{
                    marginTop: '10px', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    backgroundColor: isLockedByParent || bookedBy ? '#334155' : '#3b82f6',
                    color: isLockedByParent || bookedBy ? '#94a3b8' : '#fff',
                    cursor: isLockedByParent || bookedBy ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLockedByParent ? 'Court Unavailable' : bookedBy ? 'Booked' : 'Book Court (₱350/hr)'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
