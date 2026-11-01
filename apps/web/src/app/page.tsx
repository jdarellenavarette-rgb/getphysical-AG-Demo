'use client';

import React, { useState } from 'react';
import { DailyDash } from '../components/daily-dash/DailyDash';
import { SpatialCalendar } from '../components/clubdash/SpatialCalendar';
import { TriageDashboard } from '../components/dashboard/TriageDashboard';
import { FloatGateModal, ShiftSession } from '../components/daily-dash/FloatGateModal';
import { FigmaDualPhoneView } from '../components/figma/FigmaDualPhoneView';
import { UIStateKind } from 'sodia-core';
import { Building2, ShieldCheck, Activity, Calendar, Lock, Unlock, AlertTriangle, WifiOff, RefreshCw, Smartphone } from 'lucide-react';

export default function GymDashWebOSPage() {
  const [activeTab, setActiveTab] = useState<'FIGMA_DUAL' | 'DAILY_DASH' | 'SPATIAL' | 'TRIAGE'>('FIGMA_DUAL');
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
    const expected = (shift?.openingFloat || 2500) + 820; // ₱820 in cash sales
    const variance = countedCash - expected;
    setShift((prev) => (prev ? { ...prev, isOpen: false } : null));
    return { variance, flagged: Math.abs(variance) > 0 };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0b0f17' }}>
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
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Registry A/B Multi-Tenant Operator</div>
            </div>
          </div>
          <div style={{ height: '24px', width: '1px', backgroundColor: '#374151' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9ca3af' }}>
            <Building2 size={15} color="#38bdf8" />
            <span style={{ fontWeight: 600, color: '#f3f4f6' }}>Metro Sports Complex (Arena 01)</span>
          </div>
        </div>

        {/* View Switchers */}
        <div style={{ display: 'flex', backgroundColor: '#1f2937', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('FIGMA_DUAL')}
            style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              backgroundColor: activeTab === 'FIGMA_DUAL' ? '#ec4899' : 'transparent',
              color: activeTab === 'FIGMA_DUAL' ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Smartphone size={14} /> Dual Phone (Figma Design)
          </button>
          <button
            onClick={() => setActiveTab('DAILY_DASH')}
            style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              backgroundColor: activeTab === 'DAILY_DASH' ? '#3b82f6' : 'transparent',
              color: activeTab === 'DAILY_DASH' ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Activity size={14} /> GymDash Daily Dash
          </button>
          <button
            onClick={() => setActiveTab('SPATIAL')}
            style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              backgroundColor: activeTab === 'SPATIAL' ? '#3b82f6' : 'transparent',
              color: activeTab === 'SPATIAL' ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Calendar size={14} /> Clubdash Spatial Engine
          </button>
          <button
            onClick={() => setActiveTab('TRIAGE')}
            style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              backgroundColor: activeTab === 'TRIAGE' ? '#3b82f6' : 'transparent',
              color: activeTab === 'TRIAGE' ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <ShieldCheck size={14} /> Manager Triage & CRM
          </button>
        </div>

        {/* Shift Float Gate & 10-State Simulator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 10 State Selector */}
          <select
            value={demoState}
            onChange={(e) => setDemoState(e.target.value as UIStateKind)}
            style={{
              backgroundColor: '#1f2937', color: '#e5e7eb', border: '1px solid #374151',
              borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 600
            }}
          >
            <option value="success">State: 10/10 Success</option>
            <option value="slow_network">State: Slow Network</option>
            <option value="no_internet">State: Offline Gate</option>
            <option value="session_expired">State: Session Expired</option>
            <option value="permission_denied">State: Role Denied</option>
          </select>

          {/* Shift Float Trigger */}
          <button
            onClick={() => setShowFloatModal(true)}
            style={{
              backgroundColor: shift?.isOpen ? '#10b98120' : '#ef444420',
              border: `1px solid ${shift?.isOpen ? '#10b98150' : '#ef444450'}`,
              color: shift?.isOpen ? '#34d399' : '#f87171',
              padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {shift?.isOpen ? <Unlock size={14} /> : <Lock size={14} />}
            {shift?.isOpen ? `Shift Open (₱${shift.openingFloat.toLocaleString()})` : 'Register Locked'}
          </button>
        </div>
      </header>

      {/* 10-State Overlay Banners */}
      {demoState === 'slow_network' && (
        <div style={{ backgroundColor: '#f59e0b', color: '#000', padding: '8px 24px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={14} className="animate-spin" /> High latency detected (&gt;1500ms). Turnstile falling back to local optimistic gate cache.
        </div>
      )}
      {demoState === 'no_internet' && (
        <div style={{ backgroundColor: '#ef4444', color: '#fff', padding: '8px 24px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WifiOff size={14} /> Offline Mode Active. Turnstiles operating on 60-second TOTP dynamic token matches against local SQLite shift roster.
        </div>
      )}
      {demoState === 'permission_denied' && (
        <div style={{ backgroundColor: '#991b1b', color: '#fee2e2', padding: '8px 24px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={14} /> Permission Denied: Only Manager role (RLS) may execute blind cash reconciliations or manual gate overrides.
        </div>
      )}

      {/* Main Workspace Body */}
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {activeTab === 'FIGMA_DUAL' && <FigmaDualPhoneView />}
        {activeTab === 'DAILY_DASH' && <DailyDash />}
        {activeTab === 'SPATIAL' && <SpatialCalendar />}
        {activeTab === 'TRIAGE' && <TriageDashboard />}
      </main>

      {/* Register Float Modal */}
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
