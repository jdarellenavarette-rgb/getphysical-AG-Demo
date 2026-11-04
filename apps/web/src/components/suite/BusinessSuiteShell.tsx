'use client';

import React, { useState } from 'react';
import { NavigationDock, NavTab } from './NavigationDock';
import { MainDashboardView } from './MainDashboardView';
import { SpatialCalendar } from '../clubdash/SpatialCalendar';
import { DailyDash } from '../daily-dash/DailyDash';
import { TriageDashboard } from '../dashboard/TriageDashboard';
import { FloatGateModal, ShiftSession } from '../daily-dash/FloatGateModal';
import { Building2, ShieldCheck, Dumbbell, Compass, Lock, Unlock, Activity, ExternalLink, Zap } from 'lucide-react';

interface BusinessSuiteShellProps {
  onOpenMobileApp?: () => void;
}

export function BusinessSuiteShell({ onOpenMobileApp }: BusinessSuiteShellProps) {
  const [suiteMode, setSuiteMode] = useState<'GYMDASH' | 'CLUBDASH'>('GYMDASH');
  const [activeTab, setActiveTab] = useState<NavTab>('DASHBOARD');

  const [shift, setShift] = useState<ShiftSession | null>({
    staffId: 'st_882',
    staffName: 'Jane D. (Manager)',
    openedAt: '08:00 AM',
    openingFloat: 2500,
    isOpen: true,
  });
  const [showFloatModal, setShowFloatModal] = useState(false);

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

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#08090C',
        color: '#FFFFFF',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. Left Vertical Dock */}
      <NavigationDock
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMobileApp={onOpenMobileApp}
      />

      {/* 2. Main Workstation Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Top Operational Command Bar */}
        <header
          style={{
            height: '68px',
            backgroundColor: '#0C0E14',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            flexShrink: 0,
            zIndex: 5,
          }}
        >
          {/* Facility Name & Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* GymDash vs Clubdash Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#161922',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <button
                onClick={() => setSuiteMode('GYMDASH')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9px',
                  fontSize: '12px',
                  fontWeight: 800,
                  transition: 'all 0.2s',
                  backgroundColor: suiteMode === 'GYMDASH' ? '#FF5364' : 'transparent',
                  color: suiteMode === 'GYMDASH' ? '#FFFFFF' : '#9CA3AF',
                  boxShadow: suiteMode === 'GYMDASH' ? '0 4px 12px rgba(255, 83, 100, 0.35)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <Dumbbell size={14} />
                <span>GymDash (Commercial Gym)</span>
              </button>

              <button
                onClick={() => setSuiteMode('CLUBDASH')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9px',
                  fontSize: '12px',
                  fontWeight: 800,
                  transition: 'all 0.2s',
                  backgroundColor: suiteMode === 'CLUBDASH' ? '#FF5364' : 'transparent',
                  color: suiteMode === 'CLUBDASH' ? '#FFFFFF' : '#9CA3AF',
                  boxShadow: suiteMode === 'CLUBDASH' ? '0 4px 12px rgba(255, 83, 100, 0.35)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <Compass size={14} />
                <span>Clubdash (Multi-Sport Club)</span>
              </button>
            </div>

            <div style={{ height: '22px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Facility Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="#FF5364" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                  {suiteMode === 'GYMDASH' ? 'Metro Core Arena' : 'Metro Sports Complex & Racket Club'}
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280' }}>
                  {suiteMode === 'GYMDASH' ? 'Registry A • 883 Daily Active' : 'Registry B • Spatial 4-Court Split'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Status Badges & Cashier Shift */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Live Turnstile Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#10B981',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: '#10B981' }} />
              <span>Turnstiles Live (60s TOTP)</span>
            </div>

            {/* Cash Float Gate */}
            <button
              onClick={() => setShowFloatModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: shift?.isOpen ? 'rgba(56, 189, 248, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${shift?.isOpen ? 'rgba(56, 189, 248, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: shift?.isOpen ? '#38BDF8' : '#F87171',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {shift?.isOpen ? <Unlock size={13} /> : <Lock size={13} />}
              <span>{shift?.isOpen ? `Shift Float: ₱${shift.openingFloat.toLocaleString()}` : 'Register Locked'}</span>
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main style={{ flex: 1, padding: '24px 28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {activeTab === 'DASHBOARD' && (
            <MainDashboardView
              suiteMode={suiteMode}
              onNavigateToSchedule={() => setActiveTab('SPATIAL')}
              onNavigateToTriage={() => setActiveTab('TRIAGE')}
            />
          )}

          {activeTab === 'SPATIAL' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Clubdash Spatial Court Allocator</h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Parent Basketball Court &lt;-&gt; Child Pickleball/Padel Courts A/B/C sub-division with 15-minute auto changeover buffers.
                </p>
              </div>
              <SpatialCalendar />
            </div>
          )}

          {activeTab === 'BILLING' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Front Desk POS & Maya Settlement</h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Turnstile check-in validation, pass provisioning, and point-of-sale split checkout.
                </p>
              </div>
              <DailyDash />
            </div>
          )}

          {activeTab === 'TRIAGE' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Turnstile Triage & At-Risk Members</h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Live gate security telemetry, squatter alerts, and member attendance triage.
                </p>
              </div>
              <TriageDashboard />
            </div>
          )}

          {activeTab === 'SETTINGS' && (
            <div
              style={{
                borderRadius: '24px',
                backgroundColor: '#111319',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '32px',
                maxWidth: '680px',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Facility Settings & Hardware Keys</h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '24px' }}>
                Configure turnstile relay pins, staff cashier float PINs, and Maya merchant credentials.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Facility Operating Hours</label>
                  <input type="text" readOnly value="Monday - Sunday: 05:00 AM - 11:00 PM" style={{ width: '100%', marginTop: '6px', backgroundColor: '#181B24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', color: '#FFFFFF', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Maya Merchant Partner ID</label>
                  <input type="text" readOnly value="MAYA_MERCHANT_METRO_CORE_8820" style={{ width: '100%', marginTop: '6px', backgroundColor: '#181B24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', color: '#00D084', fontWeight: 700, fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Turnstile TOTP Shared Epoch</label>
                  <input type="text" readOnly value="60 Seconds • SHA256 Secure Enclave Synchronized" style={{ width: '100%', marginTop: '6px', backgroundColor: '#181B24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', color: '#D1D5DB', fontSize: '13px' }} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Float Gate Shift Modal */}
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
