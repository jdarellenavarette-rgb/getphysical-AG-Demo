'use client';

import React from 'react';
import { Home, Calendar, FileText, BarChart2, Settings, Bell } from 'lucide-react';

export type NavTab = 'DASHBOARD' | 'SPATIAL' | 'BILLING' | 'TRIAGE' | 'SETTINGS';

interface NavigationDockProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export function NavigationDock({ activeTab, onSelectTab }: NavigationDockProps) {
  const navItems: { id: NavTab; icon: any; label: string }[] = [
    { id: 'DASHBOARD', icon: Home, label: 'Dashboard' },
    { id: 'SPATIAL', icon: Calendar, label: 'Spatial Schedule' },
    { id: 'BILLING', icon: FileText, label: 'Maya Ledgers' },
    { id: 'TRIAGE', icon: BarChart2, label: 'Turnstile & Triage' },
    { id: 'SETTINGS', icon: Settings, label: 'Facility Settings' },
  ];

  return (
    <div
      style={{
        width: '74px',
        height: '100%',
        backgroundColor: '#0C0E14',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 0',
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Top Logo & Navigation Items */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', width: '100%' }}>
        {/* GP Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => onSelectTab('DASHBOARD')}
        >
          <span
            style={{
              fontSize: '22px',
              fontStyle: 'italic',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-1.5px',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            GP
          </span>
        </div>

        {/* Navigation Items Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                style={{
                  width: '46px',
                  height: '42px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s ease',
                  background: isActive
                    ? 'linear-gradient(135deg, #FF6B7A 0%, #FF3D57 50%, #E11D48 100%)'
                    : 'transparent',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  boxShadow: isActive ? '0 6px 16px rgba(225, 29, 72, 0.45)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#6B7280';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions: Notifications */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <button
          title="Notifications & Turnstile Alerts"
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '20px',
            backgroundColor: '#161922',
            color: '#9CA3AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Bell size={18} />
          <div
            style={{
              position: 'absolute',
              top: '9px',
              right: '9px',
              width: '7px',
              height: '7px',
              borderRadius: '4px',
              backgroundColor: '#FF5364',
            }}
          />
        </button>
      </div>
    </div>
  );
}
