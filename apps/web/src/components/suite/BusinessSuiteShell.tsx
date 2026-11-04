'use client';

import React, { useState } from 'react';
import { NavigationDock, NavTab } from './NavigationDock';
import { MainDashboardView } from './MainDashboardView';
import { SuiteMode } from './HeroPromoCard';
import { SpatialCalendar } from '../clubdash/SpatialCalendar';
import { DailyDash } from '../daily-dash/DailyDash';
import { TriageDashboard } from '../dashboard/TriageDashboard';
import { FloatGateModal, ShiftSession } from '../daily-dash/FloatGateModal';
import { Building2, ShieldCheck, Dumbbell, Compass, Lock, Unlock, Activity, ExternalLink, Zap, UserCheck, Trophy, Info } from 'lucide-react';

interface BusinessSuiteShellProps {
  onOpenMobileApp?: () => void;
}

export function BusinessSuiteShell({ onOpenMobileApp }: BusinessSuiteShellProps) {
  const [suiteMode, setSuiteMode] = useState<SuiteMode>('GYMDASH');
  const [activeTab, setActiveTab] = useState<NavTab>('DASHBOARD');

  const [shift, setShift] = useState<ShiftSession | null>({
    staffId: 'st_882',
    staffName: 'Jane D. (Manager)',
    openedAt: '08:00 AM',
    openingFloat: 2500,
    isOpen: true,
  });
  const [showFloatModal, setShowFloatModal] = useState(false);
  const [showArchitectureExplainer, setShowArchitectureExplainer] = useState(false);

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

  const getSuiteInfo = () => {
    switch (suiteMode) {
      case 'CLUBDASH':
        return {
          title: 'Metro Sports Complex & Racket Club',
          meta: 'Registry B • GymDash + Facility Court Bookings & Organizer Affiliations',
          badge: 'Spatial Courts & Leagues Live',
        };
      case 'COACHDASH':
        return {
          title: 'Coach Adam Arête Training Studio',
          meta: 'Registry C • Program Cycles, Client Roster & Compliance CRM',
          badge: '32 Coached Athletes Active',
        };
      case 'ORGANIZERDASH':
        return {
          title: 'Metro Tournament & Event League HQ',
          meta: 'Registry B Organizer Pro • Event Rosters, Brackets & Participant CRM',
          badge: '420 Entrants • 100% Seeded',
        };
      case 'GYMDASH':
      default:
        return {
          title: 'Metro Core Arena',
          meta: 'Registry A • Commercial Gym OS • 883 Daily Active • Turnstiles & Till',
          badge: 'Turnstiles Live (60s TOTP)',
        };
    }
  };

  const suiteInfo = getSuiteInfo();

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
            height: '74px',
            backgroundColor: '#0C0E14',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            flexShrink: 0,
            zIndex: 5,
            gap: '16px',
          }}
        >
          {/* 4-Suite Unified Selector (GymDash | Clubdash | CoachDash | OrganizerDash) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                backgroundColor: '#161922',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                gap: '2px',
              }}
            >
              {/* 1. GymDash */}
              <button
                onClick={() => setSuiteMode('GYMDASH')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
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
                <span>GymDash</span>
              </button>

              {/* 2. Clubdash */}
              <button
                onClick={() => setSuiteMode('CLUBDASH')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
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
                <span>Clubdash</span>
              </button>

              {/* 3. CoachDash */}
              <button
                onClick={() => setSuiteMode('COACHDASH')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '9px',
                  fontSize: '12px',
                  fontWeight: 800,
                  transition: 'all 0.2s',
                  backgroundColor: suiteMode === 'COACHDASH' ? '#FF5364' : 'transparent',
                  color: suiteMode === 'COACHDASH' ? '#FFFFFF' : '#9CA3AF',
                  boxShadow: suiteMode === 'COACHDASH' ? '0 4px 12px rgba(255, 83, 100, 0.35)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <UserCheck size={14} />
                <span>CoachDash</span>
              </button>

              {/* 4. OrganizerDash */}
              <button
                onClick={() => setSuiteMode('ORGANIZERDASH')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '9px',
                  fontSize: '12px',
                  fontWeight: 800,
                  transition: 'all 0.2s',
                  backgroundColor: suiteMode === 'ORGANIZERDASH' ? '#FF5364' : 'transparent',
                  color: suiteMode === 'ORGANIZERDASH' ? '#FFFFFF' : '#9CA3AF',
                  boxShadow: suiteMode === 'ORGANIZERDASH' ? '0 4px 12px rgba(255, 83, 100, 0.35)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <Trophy size={14} />
                <span>OrganizerDash</span>
              </button>
            </div>

            {/* Architecture Guide Tooltip Toggle */}
            <button
              onClick={() => setShowArchitectureExplainer(!showArchitectureExplainer)}
              title="Explain Architecture Differences"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: showArchitectureExplainer ? 'rgba(255, 83, 100, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: showArchitectureExplainer ? '#FF5364' : '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Info size={16} />
            </button>
          </div>

          {/* Right Status Badges & Cashier Shift */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Live Operational Status */}
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
              <span>{suiteInfo.badge}</span>
            </div>

            {/* Cash Float Gate */}
            {(suiteMode === 'GYMDASH' || suiteMode === 'CLUBDASH') && (
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
            )}
          </div>
        </header>

        {/* Informational Banner Explaining the 4 Persona Pillars */}
        {showArchitectureExplainer && (
          <div
            style={{
              backgroundColor: '#131620',
              borderBottom: '1px solid rgba(255, 83, 100, 0.25)',
              padding: '14px 28px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              fontSize: '11px',
            }}
          >
            <div style={{ borderLeft: '3px solid #FF5364', paddingLeft: '10px' }}>
              <div style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>🏋️ GymDash (Gym OS)</div>
              <div style={{ color: '#9CA3AF', lineHeight: '15px' }}>
                Commercial Gym OS as is: turnstiles, 60s dynamic TOTP gate access, class capacity, POS cashier till & daily active member telemetry.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #38BDF8', paddingLeft: '10px' }}>
              <div style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>🧭 Clubdash (Club & Venue OS)</div>
              <div style={{ color: '#9CA3AF', lineHeight: '15px' }}>
                GymDash capabilities <strong>plus</strong> spatial court bookings (parent/child court splitting) and organizer affiliation networks.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #A855F7', paddingLeft: '10px' }}>
              <div style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>⚡ CoachDash (Coach OS)</div>
              <div style={{ color: '#9CA3AF', lineHeight: '15px' }}>
                Coach dashboard to organize workout cycles & programs, manage coached client roster, monitor morning compliance, and run client CRM.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #10B981', paddingLeft: '10px' }}>
              <div style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>🏆 OrganizerDash (Events OS)</div>
              <div style={{ color: '#9CA3AF', lineHeight: '15px' }}>
                Organizer dashboard to organize tournaments & leagues, manage participant rosters, seed tournament brackets, and run event CRM.
              </div>
            </div>
          </div>
        )}

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
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                  {suiteMode === 'COACHDASH'
                    ? 'Coach Client Schedule & Macrocycle Calendar'
                    : suiteMode === 'ORGANIZERDASH'
                    ? 'Tournament Game-Day Match Schedule'
                    : 'Clubdash Spatial Court Allocator'}
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {suiteMode === 'COACHDASH'
                    ? 'Manage 1-on-1 personal training windows, gym floor fee sessions, and client macrocycles.'
                    : suiteMode === 'ORGANIZERDASH'
                    ? 'Assigned match courts, referee allocations, and live tournament whistle times.'
                    : 'Parent Basketball Court <-> Child Pickleball/Padel Courts A/B/C sub-division with 15-minute auto changeover buffers.'}
                </p>
              </div>
              <SpatialCalendar />
            </div>
          )}

          {activeTab === 'BILLING' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                  {suiteMode === 'COACHDASH'
                    ? 'Coach Payouts & Gym Floor Fee Settlement'
                    : suiteMode === 'ORGANIZERDASH'
                    ? 'Tournament Registration Escrow & Prize Pool'
                    : 'Front Desk POS & Maya Settlement'}
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {suiteMode === 'COACHDASH'
                    ? 'Personal training session pack receipts with automated ₱150 gym floor fee deductions.'
                    : suiteMode === 'ORGANIZERDASH'
                    ? 'Multi-participant registration pool with automated facility split disbursement.'
                    : 'Turnstile check-in validation, pass provisioning, and point-of-sale split checkout.'}
                </p>
              </div>
              <DailyDash />
            </div>
          )}

          {activeTab === 'TRIAGE' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                  {suiteMode === 'COACHDASH'
                    ? 'Morning Athlete Compliance & Form Review Triage'
                    : suiteMode === 'ORGANIZERDASH'
                    ? 'Participant Waiver & Check-In Verification Triage'
                    : 'Turnstile Triage & At-Risk Members'}
                </h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {suiteMode === 'COACHDASH'
                    ? 'Review athlete planned vs. actual workout logs, 1RM submissions, and 3-day negative delta alerts.'
                    : suiteMode === 'ORGANIZERDASH'
                    ? 'Live participant waiver status, check-in gate clearance, and seed dispute queue.'
                    : 'Live gate security telemetry, squatter alerts, and member attendance triage.'}
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
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                {suiteMode === 'COACHDASH'
                  ? 'Coach Profile & Client Capacity Settings'
                  : suiteMode === 'ORGANIZERDASH'
                  ? 'Organizer Tournament & League Settings'
                  : 'Facility Settings & Hardware Keys'}
              </h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '24px' }}>
                Configure operating parameters, payout credentials, and hardware keys.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>
                    {suiteMode === 'COACHDASH' ? 'Weekly Coaching Windows' : suiteMode === 'ORGANIZERDASH' ? 'Tournament Season' : 'Facility Operating Hours'}
                  </label>
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
