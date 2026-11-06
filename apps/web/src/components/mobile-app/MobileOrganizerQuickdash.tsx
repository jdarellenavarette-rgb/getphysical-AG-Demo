'use client';

import React, { useState } from 'react';
import { ArrowLeft, Trophy, CheckCircle2, ChevronRight } from 'lucide-react';

interface MobileOrganizerQuickdashProps {
  onBack: () => void;
}

export function MobileOrganizerQuickdash({ onBack }: MobileOrganizerQuickdashProps) {
  const [matches, setMatches] = useState([
    { id: '1', court: 'Court 1 (Pickleball)', teamA: 'Team Alpha (Darelle / Leo)', teamB: 'Team Strike (Marco / Dan)', score: '11 - 8', status: 'IN_PLAY' },
    { id: '2', court: 'Court 2 (Pickleball)', teamA: 'Net Masters (Sam / Kim)', teamB: 'Smash Bros (Jay / Ron)', score: '0 - 0', status: 'CHECKING_IN' },
  ]);

  const advanceMatch = (id: string) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, score: '11 - 9', status: 'COMPLETED' } : m));
    alert('Match completed! Score confirmed and split payouts settled via Stripe Connect.');
  };

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
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', backgroundColor: '#f59e0b20', padding: '3px 8px', borderRadius: '6px' }}>
          ORGANIZER PRO
        </span>
      </div>

      {/* Meet Strip */}
      <div style={{ backgroundColor: '#18181b', borderRadius: '14px', border: '1px solid #27272a', padding: '14px', marginBottom: '14px' }}>
        <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>Metro Summer Open (Pickleball Doubles)</div>
        <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>Registry B • Reclub-Grade Tournament Engine</div>
      </div>

      {/* Active Courts & Bracket Status */}
      <div style={{ fontSize: '12px', fontWeight: 900, color: '#f4f4f5', letterSpacing: '0.5px', marginBottom: '10px' }}>
        LIVE COURT MATCHES & SCORING
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {matches.map((m) => (
          <div key={m.id} style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b' }}>{m.court}</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: m.status === 'COMPLETED' ? '#10b981' : '#38bdf8' }}>
                {m.status}
              </span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              {m.teamA} vs {m.teamB}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #27272a' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff' }}>Score: {m.score}</span>
              {m.status !== 'COMPLETED' && (
                <button
                  onClick={() => advanceMatch(m.id)}
                  style={{ backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}
                >
                  Finalize Match (11-9)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
