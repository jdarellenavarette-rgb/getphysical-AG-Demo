'use client';

import React, { useState } from 'react';
import { ArrowLeft, QrCode, Camera, ShieldCheck, CheckCircle2, XCircle, Users, Lock, Unlock } from 'lucide-react';

interface MobileStaffQuickdashProps {
  onBack: () => void;
}

export function MobileStaffQuickdash({ onBack }: MobileStaffQuickdashProps) {
  const [occupancy, setOccupancy] = useState(42);
  const [maxCapacity] = useState(100);
  const [gateFlash, setGateFlash] = useState<'IDLE' | 'GREEN' | 'RED' | 'BLUE'>('IDLE');
  const [lastMember, setLastMember] = useState<string | null>(null);
  const [isClockedIn, setIsClockedIn] = useState(true);

  const simulateScan = (type: 'VIP' | 'COACH_CLIENT' | 'EXPIRED') => {
    if (type === 'VIP') {
      setGateFlash('GREEN');
      setOccupancy(prev => Math.min(prev + 1, maxCapacity));
      setLastMember('Darelle Navarette (IFBB Pro VIP #8821)');
    } else if (type === 'COACH_CLIENT') {
      setGateFlash('BLUE');
      setOccupancy(prev => Math.min(prev + 1, maxCapacity));
      setLastMember('Elena Rostova (Coach Client • ₱150 Floor Fee Deducted)');
    } else {
      setGateFlash('RED');
      setLastMember('Unregistered / Expired Pass (Denied)');
    }
    setTimeout(() => setGateFlash('IDLE'), 2000);
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
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', backgroundColor: '#10b98120', padding: '3px 8px', borderRadius: '6px' }}>
          STAFF QUICKDASH
        </span>
      </div>

      {/* Facility & Shift Strip */}
      <div style={{ backgroundColor: '#18181b', borderRadius: '14px', border: '1px solid #27272a', padding: '14px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>Metro Arena (Front Desk #01)</div>
            <div style={{ fontSize: '11px', color: '#a1a1aa' }}>Staff: Jane D. • Shift Open (₱2,500 Float)</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 800 }}>INSIDE NOW</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{occupancy}/{maxCapacity}</div>
          </div>
        </div>
      </div>

      {/* Live Turnstile Optical / TOTP Scanner Viewport */}
      <div
        style={{
          borderRadius: '16px', padding: '24px 16px', textAlign: 'center', marginBottom: '14px', transition: 'all 0.3s ease',
          backgroundColor: gateFlash === 'GREEN' ? '#064e3b' : gateFlash === 'RED' ? '#7f1d1d' : gateFlash === 'BLUE' ? '#1e3a8a' : '#141417',
          border: `2px solid ${gateFlash === 'GREEN' ? '#10b981' : gateFlash === 'RED' ? '#ef4444' : gateFlash === 'BLUE' ? '#38bdf8' : '#27272a'}`
        }}
      >
        <QrCode size={56} color={gateFlash === 'GREEN' ? '#34d399' : gateFlash === 'RED' ? '#f87171' : gateFlash === 'BLUE' ? '#60a5fa' : '#a1a1aa'} style={{ margin: '0 auto 10px' }} />
        
        {gateFlash === 'IDLE' && (
          <>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Ready for Turnstile Scan</div>
            <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px' }}>Aim member dynamic QR or enter 6-digit TOTP code</div>
          </>
        )}

        {gateFlash === 'GREEN' && (
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#34d399' }}>
            ✓ ACCESS GRANTED: {lastMember}
          </div>
        )}

        {gateFlash === 'BLUE' && (
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#93c5fd' }}>
            ✓ DUAL AUTH: {lastMember}
          </div>
        )}

        {gateFlash === 'RED' && (
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#fca5a5' }}>
            ✕ ACCESS DENIED: {lastMember}
          </div>
        )}
      </div>

      {/* Quick Scan Simulation Triggers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => simulateScan('VIP')}
          style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#10b98125', border: '1px solid #10b981', color: '#34d399', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
        >
          Simulate Valid Member Scan (Darelle Navarette)
        </button>
        <button
          onClick={() => simulateScan('COACH_CLIENT')}
          style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#38bdf825', border: '1px solid #38bdf8', color: '#38bdf8', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
        >
          Simulate Coach Dual-Auth Client (+₱150 Floor Fee)
        </button>
        <button
          onClick={() => simulateScan('EXPIRED')}
          style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#ef444425', border: '1px solid #ef4444', color: '#f87171', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
        >
          Simulate Squatter / Expired Pass (Denied)
        </button>
      </div>

      {/* Staff Selfie Clock-In Status */}
      <div style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={16} color="#10b981" />
          <span style={{ fontSize: '12px', color: '#d4d4d8' }}>Selfie DTR Clock-In Verified (08:00 AM)</span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981' }}>ON DUTY</span>
      </div>
    </div>
  );
}
