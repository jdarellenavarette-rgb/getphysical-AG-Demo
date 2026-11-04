'use client';

import React, { useState } from 'react';
import { NavigationDock, NavTab } from './NavigationDock';
import { MainDashboardView } from './MainDashboardView';
import { AthleticInboxCRMView } from './AthleticInboxCRMView';
import { SuiteMode } from './HeroPromoCard';
import { SpatialCalendar } from '../clubdash/SpatialCalendar';
import { DailyDash } from '../daily-dash/DailyDash';
import { TriageDashboard } from '../dashboard/TriageDashboard';
import { FloatGateModal, ShiftSession } from '../daily-dash/FloatGateModal';
import { Building2, ShieldCheck, Dumbbell, Compass, Lock, Unlock, Activity, ExternalLink, Zap, UserCheck, Trophy, Info, Sun, Moon } from 'lucide-react';
import { SuiteThemeProvider, useSuiteTheme } from './theme';

function BusinessSuiteInner() {
  const { theme, isDark, toggleTheme } = useSuiteTheme();
  const [suiteMode, setSuiteMode] = useState<SuiteMode>('GYMDASH');
  const [activeTab, setActiveTab] = useState<NavTab>('DASHBOARD');
  const [branch, setBranch] = useState<'BGC' | 'MAKATI' | 'PASIG'>('BGC');

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
        backgroundColor: theme.bgScreen,
        color: theme.textPrimary,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. Left Vertical Dock in Clean Light Theme */}
      <NavigationDock
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 2. Main Workstation Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Top Operational Command Bar */}
        <header
          style={{
            height: '74px',
            backgroundColor: theme.bgHeader,
            borderBottom: `1px solid ${theme.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            flexShrink: 0,
            zIndex: 5,
            gap: '16px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* 4-Suite Unified Selector (GymDash | Clubdash | CoachDash | OrganizerDash) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                backgroundColor: theme.bgCardTertiary,
                padding: '4px',
                borderRadius: '12px',
                border: `1px solid ${theme.borderColor}`,
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
                  backgroundColor: suiteMode === 'GYMDASH' ? theme.accent : 'transparent',
                  color: suiteMode === 'GYMDASH' ? '#FFFFFF' : theme.textMuted,
                  boxShadow: suiteMode === 'GYMDASH' ? theme.shadowPill : 'none',
                  cursor: 'pointer',
                  border: 'none',
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
                  backgroundColor: suiteMode === 'CLUBDASH' ? theme.accent : 'transparent',
                  color: suiteMode === 'CLUBDASH' ? '#FFFFFF' : theme.textMuted,
                  boxShadow: suiteMode === 'CLUBDASH' ? theme.shadowPill : 'none',
                  cursor: 'pointer',
                  border: 'none',
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
                  backgroundColor: suiteMode === 'COACHDASH' ? theme.accent : 'transparent',
                  color: suiteMode === 'COACHDASH' ? '#FFFFFF' : theme.textMuted,
                  boxShadow: suiteMode === 'COACHDASH' ? theme.shadowPill : 'none',
                  cursor: 'pointer',
                  border: 'none',
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
                  backgroundColor: suiteMode === 'ORGANIZERDASH' ? theme.accent : 'transparent',
                  color: suiteMode === 'ORGANIZERDASH' ? '#FFFFFF' : theme.textMuted,
                  boxShadow: suiteMode === 'ORGANIZERDASH' ? theme.shadowPill : 'none',
                  cursor: 'pointer',
                  border: 'none',
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
                backgroundColor: showArchitectureExplainer ? theme.accentMuted : theme.bgCardSecondary,
                color: showArchitectureExplainer ? theme.accent : theme.textMuted,
                border: `1px solid ${theme.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Info size={16} />
            </button>

            {/* Multi-Location Portfolio Switcher (Meta Account Switcher Adaptation) */}
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value as any)}
              style={{
                backgroundColor: theme.bgCardSecondary,
                color: theme.textPrimary,
                border: `1px solid ${theme.borderColor}`,
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '11px',
                fontWeight: 800,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="BGC">📍 BGC High Street Arena</option>
              <option value="MAKATI">📍 Makati West Complex</option>
              <option value="PASIG">📍 Pasig Padel & Courts</option>
            </select>
          </div>

          {/* Right Status Badges & Cashier Shift */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Live Operational Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: theme.accentGreenMuted,
                border: '1px solid rgba(5, 150, 105, 0.25)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#059669',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: '#059669' }} />
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
                  backgroundColor: shift?.isOpen ? 'rgba(2, 132, 199, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                  border: `1px solid ${shift?.isOpen ? 'rgba(2, 132, 199, 0.25)' : 'rgba(220, 38, 38, 0.25)'}`,
                  color: shift?.isOpen ? '#0284C7' : '#DC2626',
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

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: theme.bgCardSecondary,
                border: `1px solid ${theme.borderColor}`,
                color: theme.textPrimary,
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={isDark ? "Switch to Light Theme (Mobile App Style)" : "Switch to Dark Theme (Mockup Style)"}
            >
              {isDark ? <Sun size={13} color="#FBBF24" /> : <Moon size={13} color="#64748B" />}
              <span>{isDark ? 'Dark Mockup' : 'Light App'}</span>
            </button>
          </div>
        </header>

        {/* Informational Banner Explaining the 4 Persona Pillars in Clean Light Style */}
        {showArchitectureExplainer && (
          <div
            style={{
              backgroundColor: theme.bgCard,
              borderBottom: `1px solid ${theme.borderColor}`,
              padding: '16px 28px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              fontSize: '11px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ borderLeft: `3px solid ${theme.accent}`, paddingLeft: '10px' }}>
              <div style={{ fontWeight: 900, color: theme.textPrimary, marginBottom: '2px' }}>🏋️ GymDash (Gym OS)</div>
              <div style={{ color: theme.textSecondary, lineHeight: '16px', fontWeight: 500 }}>
                Commercial Gym OS as is: turnstiles, 60s dynamic TOTP gate access, class capacity, POS cashier till & daily active member telemetry.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #0284C7', paddingLeft: '10px' }}>
              <div style={{ fontWeight: 900, color: theme.textPrimary, marginBottom: '2px' }}>🧭 Clubdash (Club & Venue OS)</div>
              <div style={{ color: theme.textSecondary, lineHeight: '16px', fontWeight: 500 }}>
                GymDash capabilities <strong>plus</strong> spatial court bookings (parent/child court splitting) and organizer affiliation networks.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #7C3AED', paddingLeft: '10px' }}>
              <div style={{ fontWeight: 900, color: theme.textPrimary, marginBottom: '2px' }}>⚡ CoachDash (Coach OS)</div>
              <div style={{ color: theme.textSecondary, lineHeight: '16px', fontWeight: 500 }}>
                Coach dashboard to organize workout cycles & programs, manage coached client roster, monitor morning compliance, and run client CRM.
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #059669', paddingLeft: '10px' }}>
              <div style={{ fontWeight: 900, color: theme.textPrimary, marginBottom: '2px' }}>🏆 OrganizerDash (Events OS)</div>
              <div style={{ color: theme.textSecondary, lineHeight: '16px', fontWeight: 500 }}>
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
            <div style={{ backgroundColor: theme.bgCard, padding: '24px', borderRadius: '24px', border: `1px solid ${theme.borderColor}`, boxShadow: theme.shadowCard }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: theme.textPrimary }}>
                  {suiteMode === 'COACHDASH'
                    ? 'Coach Client Schedule & Macrocycle Calendar'
                    : suiteMode === 'ORGANIZERDASH'
                    ? 'Tournament Game-Day Match Schedule'
                    : 'Clubdash Spatial Court Allocator'}
                </h2>
                <p style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 500 }}>
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

          {activeTab === 'INBOX' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: theme.textPrimary }}>Unified Athletic Inbox & Member CRM</h2>
                <p style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 500 }}>
                  Meta-style unified communication center: turnstile access denials, coach form checks, at-risk member win-backs, and organizer match queues.
                </p>
              </div>
              <AthleticInboxCRMView suiteMode={suiteMode} />
            </div>
          )}

          {activeTab === 'BILLING' && (
            <div style={{ backgroundColor: theme.bgCard, padding: '24px', borderRadius: '24px', border: `1px solid ${theme.borderColor}`, boxShadow: theme.shadowCard }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: theme.textPrimary }}>
                  {suiteMode === 'COACHDASH'
                    ? 'Coach Payouts & Gym Floor Fee Settlement'
                    : suiteMode === 'ORGANIZERDASH'
                    ? 'Tournament Registration Escrow & Prize Pool'
                    : 'Front Desk POS & Maya Settlement'}
                </h2>
                <p style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 500 }}>
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
            <div style={{ backgroundColor: theme.bgCard, padding: '24px', borderRadius: '24px', border: `1px solid ${theme.borderColor}`, boxShadow: theme.shadowCard }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: theme.textPrimary }}>
                  {suiteMode === 'COACHDASH'
                    ? 'Morning Athlete Compliance & Form Review Triage'
                    : suiteMode === 'ORGANIZERDASH'
                    ? 'Participant Waiver & Check-In Verification Triage'
                    : 'Turnstile Triage & At-Risk Members'}
                </h2>
                <p style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 500 }}>
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
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderColor}`,
                padding: '32px',
                maxWidth: '680px',
                boxShadow: theme.shadowCard,
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px', color: theme.textPrimary }}>
                {suiteMode === 'COACHDASH'
                  ? 'Coach Profile & Client Capacity Settings'
                  : suiteMode === 'ORGANIZERDASH'
                  ? 'Organizer Tournament & League Settings'
                  : 'Facility Settings & Hardware Keys'}
              </h2>
              <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '24px', fontWeight: 500 }}>
                Configure operating parameters, payout credentials, and hardware keys.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase' }}>
                    {suiteMode === 'COACHDASH' ? 'Weekly Coaching Windows' : suiteMode === 'ORGANIZERDASH' ? 'Tournament Season' : 'Facility Operating Hours'}
                  </label>
                  <input type="text" readOnly value="Monday - Sunday: 05:00 AM - 11:00 PM" style={{ width: '100%', marginTop: '6px', backgroundColor: theme.bgCardSecondary, border: `1px solid ${theme.borderColor}`, borderRadius: '10px', padding: '10px 12px', color: theme.textPrimary, fontSize: '13px', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase' }}>Maya Merchant Partner ID</label>
                  <input type="text" readOnly value="MAYA_MERCHANT_METRO_CORE_8820" style={{ width: '100%', marginTop: '6px', backgroundColor: theme.bgCardSecondary, border: `1px solid ${theme.borderColor}`, borderRadius: '10px', padding: '10px 12px', color: '#059669', fontWeight: 800, fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase' }}>Turnstile TOTP Shared Epoch</label>
                  <input type="text" readOnly value="60 Seconds • SHA256 Secure Enclave Synchronized" style={{ width: '100%', marginTop: '6px', backgroundColor: theme.bgCardSecondary, border: `1px solid ${theme.borderColor}`, borderRadius: '10px', padding: '10px 12px', color: theme.textPrimary, fontSize: '13px', fontWeight: 600 }} />
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

export function BusinessSuiteShell() {
  return (
    <SuiteThemeProvider>
      <BusinessSuiteInner />
    </SuiteThemeProvider>
  );
}
