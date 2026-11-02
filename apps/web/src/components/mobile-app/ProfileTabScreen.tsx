'use client';

import React from 'react';
import { User, Award, Shield, ArrowRight, Building2, Dumbbell, Trophy } from 'lucide-react';

interface ProfileTabScreenProps {
  onSwitchRole: (role: 'STAFF' | 'COACH' | 'ORGANIZER') => void;
}

export function ProfileTabScreen({ onSwitchRole }: ProfileTabScreenProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#09090b', color: '#fff', overflowY: 'auto', padding: '16px 16px 90px' }}>
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <img
          src="/assets/design/avatar-adam.png"
          alt="Adam Arête"
          style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #ec4899', objectFit: 'cover' }}
        />
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>Adam Arête</h2>
          <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>@adam.arete • BGC, Manila</div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: '#ec4899', fontWeight: 800 }}>
            <span>142 Followers</span>
            <span>•</span>
            <span>24 Verified Lifts</span>
          </div>
        </div>
      </div>

      {/* Role Switcher Section (Business Roles on Mobile) */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 900, color: '#f4f4f5', letterSpacing: '0.5px', marginBottom: '8px' }}>
          SWITCH TO BUSINESS QUICK DASHBOARDS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => onSwitchRole('STAFF')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
              backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={16} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Front Desk Staff Quickdash</div>
                <div style={{ fontSize: '10px', color: '#71717a' }}>Selfie Clock-In & Live Turnstile Scanner</div>
              </div>
            </div>
            <ArrowRight size={14} color="#71717a" />
          </button>

          <button
            onClick={() => onSwitchRole('COACH')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
              backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#38bdf820', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell size={16} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Coach Live Floor Roster</div>
                <div style={{ fontSize: '10px', color: '#71717a' }}>Client Attendance & ₱150 Floor Fee Split</div>
              </div>
            </div>
            <ArrowRight size={14} color="#71717a" />
          </button>

          <button
            onClick={() => onSwitchRole('ORGANIZER')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
              backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={16} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Organizer Pro Quick-Meet</div>
                <div style={{ fontSize: '10px', color: '#71717a' }}>Tournament Brackets & Court Match Check-In</div>
              </div>
            </div>
            <ArrowRight size={14} color="#71717a" />
          </button>
        </div>
      </div>

      {/* Active Roster Memberships */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 900, color: '#f4f4f5', letterSpacing: '0.5px', marginBottom: '8px' }}>
          ACTIVE ROSTER ENTITLEMENTS
        </div>
        <div style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Metro Arena Titanium VIP</span>
            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, backgroundColor: '#10b98120', padding: '2px 6px', borderRadius: '4px' }}>Active</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>GetPhysical+ Pro Subscription</span>
            <span style={{ fontSize: '10px', color: '#ec4899', fontWeight: 700, backgroundColor: '#ec489920', padding: '2px 6px', borderRadius: '4px' }}>₱149/mo</span>
          </div>
        </div>
      </div>

      {/* Verified Trophy Case */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 900, color: '#f4f4f5', letterSpacing: '0.5px', marginBottom: '8px' }}>
          VERIFIED TROPHY CASE (IMMUTABLE)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '12px' }}>
            <Award size={20} color="#ec4899" />
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff', marginTop: '6px' }}>225 KG</div>
            <div style={{ fontSize: '10px', color: '#71717a' }}>Deadlift PR • Video Verified</div>
          </div>
          <div style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '12px' }}>
            <Award size={20} color="#38bdf8" />
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff', marginTop: '6px' }}>22:40</div>
            <div style={{ fontSize: '10px', color: '#71717a' }}>5KM Run • GPS Verified</div>
          </div>
        </div>
      </div>
    </div>
  );
}
