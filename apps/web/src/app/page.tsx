'use client';

import React, { useState } from 'react';
import { BusinessSuiteShell } from '../components/suite/BusinessSuiteShell';
import { SodiaMobileApp } from '../components/mobile-app/SodiaMobileApp';
import { Monitor, Smartphone } from 'lucide-react';

export default function AppRootPage() {
  const [platformView, setPlatformView] = useState<'DESKTOP_SUITE' | 'MOBILE_APP'>('DESKTOP_SUITE');

  // If in Member Mobile App Preview Mode:
  if (platformView === 'MOBILE_APP') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: '#111827', borderBottom: '1px solid #1f2937', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span style={{ fontWeight: 800, color: '#ec4899' }}>GetPhysical</span>
            <span style={{ color: '#6b7280' }}>•</span>
            <span style={{ color: '#9ca3af' }}>Member Mobile App Preview</span>
          </div>
          <button
            onClick={() => setPlatformView('DESKTOP_SUITE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1f2937',
              color: '#38bdf8',
              border: '1px solid #374151',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <Monitor size={14} /> Return to Business Suite (GymDash / Clubdash)
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', backgroundColor: '#09090b' }}>
          <SodiaMobileApp onOpenDesktopSuite={() => setPlatformView('DESKTOP_SUITE')} />
        </div>
      </div>
    );
  }

  // Primary Default View: Full Business Suite (GymDash & Clubdash)
  return <BusinessSuiteShell onOpenMobileApp={() => setPlatformView('MOBILE_APP')} />;
}
