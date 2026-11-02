'use client';

import React, { useState } from 'react';
import { ArrowLeft, Dumbbell, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface MobileCoachQuickdashProps {
  onBack: () => void;
}

export function MobileCoachQuickdash({ onBack }: MobileCoachQuickdashProps) {
  const [clients, setClients] = useState([
    { id: '1', name: 'Elena Rostova', status: 'IN_BUILDING', session: 'Leg Day Hypertrophy', feeSplit: '₱1,500 gross (-₱150 floor fee)' },
    { id: '2', name: 'Marcus Cruz', status: 'EXPECTED', session: 'Bench Press Form Check', feeSplit: '₱1,500 gross (-₱150 floor fee)' },
    { id: '3', name: 'Jake Torralba', status: 'MISSED_TRIAGE', session: '3-day negative compliance', feeSplit: 'Pending Nudge' },
  ]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#09090b', color: '#fff', overflowY: 'auto', padding: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#ec4899', fontSize: '13px', fontWeight: 800, cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft size={16} /> Member App
        </button>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', backgroundColor: '#38bdf820', padding: '3px 8px', borderRadius: '6px' }}>
          COACH QUICKDASH
        </span>
      </div>

      {/* Coach Info Strip */}
      <div style={{ backgroundColor: '#18181b', borderRadius: '14px', border: '1px solid #27272a', padding: '14px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>Coach Marco V.</div>
            <div style={{ fontSize: '11px', color: '#a1a1aa' }}>Registry C • 3/3 Free Tier Clients</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 800 }}>TODAY'S FLOOR FEES</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>-₱150 settled</div>
          </div>
        </div>
      </div>

      {/* Live Floor Roster */}
      <div style={{ fontSize: '12px', fontWeight: 900, color: '#f4f4f5', letterSpacing: '0.5px', marginBottom: '10px' }}>
        LIVE FLOOR ROSTER & COMPLIANCE
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {clients.map((c) => (
          <div key={c.id} style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{c.name}</div>
                <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>{c.session}</div>
              </div>
              {c.status === 'IN_BUILDING' && (
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#10b981', backgroundColor: '#10b98120', padding: '3px 8px', borderRadius: '6px' }}>
                  IN BUILDING (SCAN #01)
                </span>
              )}
              {c.status === 'EXPECTED' && (
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', backgroundColor: '#38bdf820', padding: '3px 8px', borderRadius: '6px' }}>
                  EXPECTED 11:00 AM
                </span>
              )}
              {c.status === 'MISSED_TRIAGE' && (
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', backgroundColor: '#f59e0b20', padding: '3px 8px', borderRadius: '6px' }}>
                  COMPLIANCE ALERT
                </span>
              )}
            </div>

            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#a1a1aa' }}>
              <span>Settlement: {c.feeSplit}</span>
              {c.status === 'MISSED_TRIAGE' && (
                <button
                  onClick={() => alert(`Nudge notification dispatched to ${c.name} on Sodia app!`)}
                  style={{ backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Send Nudge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
