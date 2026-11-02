'use client';

import React, { useState } from 'react';
import { DailyDash } from '../components/daily-dash/DailyDash';
import { SpatialCalendar } from '../components/clubdash/SpatialCalendar';
import { TriageDashboard } from '../components/dashboard/TriageDashboard';
import { FloatGateModal, ShiftSession } from '../components/daily-dash/FloatGateModal';
import { SodiaMobileApp } from '../components/mobile-app/SodiaMobileApp';
import { UIStateKind } from 'sodia-core';
import { Building2, ShieldCheck, Activity, Calendar, Lock, Unlock, Smartphone, Monitor } from 'lucide-react';

export default function AppRootPage() {
  const [platformView, setPlatformView] = useState<'MOBILE_APP' | 'DESKTOP_SUITE'>('MOBILE_APP');
  const [desktopTab, setDesktopTab] = useState<'DAILY_DASH' | 'SPATIAL' | 'TRIAGE'>('DAILY_DASH');
  
  const [shift, setShift] = useState<ShiftSession | null>({
    staffId: 'st_882',
    staffName: 'Jane D. (Manager)',
    openedAt: '08:00 AM',
    openingFloat: 2500,
    isOpen: true,
  });
  const [showFloatModal, setShowFloatModal] = useState(false);
  const [demoState, setDemoState] = useState<UIStateKind>('success');

  const handleOpenShift = (pin: string, openingFloat: number) => {
    if (pin !== '1234') {
      return { success: false, message: 'Invalid Manager PIN. Use demo PIN 1234.' };
    }
    setShift({
      staffId: 'st_882',
      staffName: 'Jane D. (Front Desk)',
      openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      openingFloat,
      isOpen: true,
    });
    return { success: true, message: 'Shift unlocked.' };
  };

  const handleCloseShift = (countedCash: number) => {
    const expected = (shift?.openingFloat || 2500) + 820;
    const variance = countedCash - expected;
    setShift((prev) => (prev ? { ...prev, isOpen: false } : null));
    return { variance, flagged: Math.abs(variance) > 0 };
  };

  // If in Member Mobile App Mode:
  if (platformView === 'MOBILE_APP') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        {/* Subtle Platform Bar (Only visible on wide desktop viewports to toggle suites) */}
        <div style={{ backgroundColor: '#111827', borderBottom: '1px solid #1f2937', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span style={{ fontWeight: 800, color: '#ec4899' }}>GetPhysical</span>
            <span style={{ color: '#6b7280' }}>•</span>
            <span style={{ color: '#9ca3af' }}>Member Mobile Experience (No frames)</span>
          </div>
          <button
            onClick={() => setPlatformView('DESKTOP_SUITE')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1f2937',
              color: '#38bdf8', border: '1px solid #374151', padding: '4px 10px', borderRadius: '6px',
              fontSize: '11px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            <Monitor size={13} /> Switch to Desktop Business Suite (GymDash/Clubdash)
          </button>
        </div>

        {/* Clean Native Mobile App Container (Edge-to-edge on phone screens, centered on desktop) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', backgroundColor: '#09090b' }}>
          <SodiaMobileApp onOpenDesktopSuite={() => setPlatformView('DESKTOP_SUITE')} />
        </div>
      </div>
    );
  }

  // If in Desktop Business Suite Mode (GymDash & Clubdash):
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0b0f17' }}>
      {/* Top B2B Operational Header */}
      <header style={{
        height: '64px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0
      }}>
        {/* Logo & Facility */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000' }}>
              GD
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.2px' }}>GymDash & Clubdash Web OS</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Desktop Business Suite • Registry A/B</div>
            </div>
          </div>
          <div style={{ height: '24px', width: '1px', backgroundColor: '#374151' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9ca3af' }}>
            <Building2 size={15} color="#38bdf8" />
            <span style={{ fontWeight: 600, color: '#f3f4f6' }}>Metro Sports Complex (Arena 01)</span>
          </div>
        </div>

        {/* Desktop Suite Switchers */}
        <div style={{ display: 'flex', backgroundColor: '#1f2937', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setDesktopTab('DAILY_DASH')}
            style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              backgroundColor: desktopTab === 'DAILY_DASH' ? '#3b82f6' : 'transparent',
              color: desktopTab === 'DAILY_DASH' ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px',
              border: 'none', cursor: 'pointer'
            }}
          >
            <Activity size={14} /> Daily Dash (Turnstiles & POS)
          </button>
          <button
            onClick={() => setDesktopTab('SPATIAL')}
            style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              backgroundColor: desktopTab === 'SPATIAL' ? '#3b82f6' : 'transparent',
              color: desktopTab === 'SPATIAL' ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px',
              border: 'none', cursor: 'pointer'
            }}
          >
            <Calendar size={14} /> Clubdash Spatial Engine
          </button>
          <button
            onClick={() => setDesktopTab('TRIAGE')}
            style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              backgroundColor: desktopTab === 'TRIAGE' ? '#3b82f6' : 'transparent',
              color: desktopTab === 'TRIAGE' ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px',
              border: 'none', cursor: 'pointer'
            }}
          >
            <ShieldCheck size={14} /> Manager Triage & CRM
          </button>
        </div>

        {/* Right Actions: Return to Member App & Shift Float Gate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setPlatformView('MOBILE_APP')}
            style={{
              backgroundColor: '#ec489920', border: '1px solid #ec489950', color: '#ec4899',
              padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
            }}
          >
            <Smartphone size={14} /> Member Mobile App
          </button>

          <button
            onClick={() => setShowFloatModal(true)}
            style={{
              backgroundColor: shift?.isOpen ? '#10b98120' : '#ef444420',
              border: `1px solid ${shift?.isOpen ? '#10b98150' : '#ef444450'}`,
              color: shift?.isOpen ? '#34d399' : '#f87171',
              padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
            }}
          >
            {shift?.isOpen ? <Unlock size={14} /> : <Lock size={14} />}
            {shift?.isOpen ? `Shift Open (₱${shift.openingFloat.toLocaleString()})` : 'Register Locked'}
          </button>
        </div>
      </header>

      {/* Main Desktop Business Body */}
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {desktopTab === 'DAILY_DASH' && <DailyDash />}
        {desktopTab === 'SPATIAL' && <SpatialCalendar />}
        {desktopTab === 'TRIAGE' && <TriageDashboard />}
      </main>

      {/* Float Gate Modal */}
      {showFloatModal && (
        <FloatGateModal
          currentShift={shift}
          onOpenShift={handleOpenShift}
          onCloseShift={handleCloseShift}
          onDismiss={() => setShowFloatModal(false)}
        />
      )}
    </div>
  );
}
