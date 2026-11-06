'use client';

import React, { useState } from 'react';
import {
  Menu, MessageSquareMore, Bell, Settings,
  MapPin, ChartColumn, Plus, Wallet, User, CheckCircle2
} from 'lucide-react';
import { WalletTabScreen } from '../figma/WalletTabScreen';
import { FeedTabScreen } from '../figma/FeedTabScreen';
import { PhoneModals } from '../figma/PhoneModals';
import { DiscoverTabScreen } from './DiscoverTabScreen';
import { TrackTabScreen } from './TrackTabScreen';
import { ProfileTabScreen } from './ProfileTabScreen';
import { MobileStaffQuickdash } from './MobileStaffQuickdash';
import { MobileCoachQuickdash } from './MobileCoachQuickdash';
import { MobileOrganizerQuickdash } from './MobileOrganizerQuickdash';

export type ActiveTab = 'feed' | 'discover' | 'cards' | 'track' | 'profile';
export type ActiveRole = 'MEMBER' | 'STAFF' | 'COACH' | 'ORGANIZER';

interface SodiaMobileAppProps {
  onOpenDesktopSuite?: () => void;
}

export function SodiaMobileApp({ onOpenDesktopSuite }: SodiaMobileAppProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cards');
  const [activeRole, setActiveRole] = useState<ActiveRole>('MEMBER');
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isFullHistoryOpen, setIsFullHistoryOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // If switched into a mobile business quick dashboard:
  if (activeRole === 'STAFF') {
    return (
      <div style={{ width: '100%', maxWidth: '440px', minHeight: '100vh', margin: '0 auto', display: 'flex', flexDirection: 'column', backgroundColor: '#000000', position: 'relative' }}>
        <MobileStaffQuickdash onBack={() => setActiveRole('MEMBER')} />
      </div>
    );
  }
  if (activeRole === 'COACH') {
    return (
      <div style={{ width: '100%', maxWidth: '440px', minHeight: '100vh', margin: '0 auto', display: 'flex', flexDirection: 'column', backgroundColor: '#000000', position: 'relative' }}>
        <MobileCoachQuickdash onBack={() => setActiveRole('MEMBER')} />
      </div>
    );
  }
  if (activeRole === 'ORGANIZER') {
    return (
      <div style={{ width: '100%', maxWidth: '440px', minHeight: '100vh', margin: '0 auto', display: 'flex', flexDirection: 'column', backgroundColor: '#000000', position: 'relative' }}>
        <MobileOrganizerQuickdash onBack={() => setActiveRole('MEMBER')} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '440px', minHeight: '100vh', margin: '0 auto', display: 'flex', flexDirection: 'column', backgroundColor: '#000000', position: 'relative', overflowX: 'hidden' }}>
      {/* Top Mobile App Header: ☰ getphysical + Inbox, Bell, Settings */}
      <header style={{ height: '56px', padding: '0 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#000000', zIndex: 40, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setIsMenuOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
            <Menu size={22} />
          </button>
          <span
            onClick={() => setActiveTab('feed')}
            style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px', cursor: 'pointer' }}
          >
            getphysical
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button type="button" aria-label="Inbox, 2 unread" onClick={() => showToast('Inbox: 2 unread DMs from Coach Sarah & Marco')} style={{ position: 'relative', cursor: 'pointer', display: 'flex' }}>
            <MessageSquareMore size={20} color="#ffffff" aria-hidden="true" />
            <span aria-hidden="true" style={{ position: 'absolute', top: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
          </button>
          <button type="button" aria-label="Notifications, 3 new" onClick={() => showToast('Notifications: 3 new PR challenge leaderboard alerts')} style={{ position: 'relative', cursor: 'pointer', display: 'flex' }}>
            <Bell size={20} color="#ffffff" aria-hidden="true" />
            <span aria-hidden="true" style={{ position: 'absolute', top: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
          </button>
          <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Active Tab Screen */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {activeTab === 'cards' && (
          <WalletTabScreen
            onOpenFullHistory={() => setIsFullHistoryOpen(true)}
            onSelectTx={(name, amt) => showToast(`Receipt: ${name} (${amt}) • Verified immutable ledger`)}
          />
        )}

        {activeTab === 'feed' && (
          <FeedTabScreen
            onOpenComments={() => setIsCommentsOpen(true)}
            onShare={() => showToast('🔗 Post link copied to clipboard!')}
            onSelectCreator={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'discover' && <DiscoverTabScreen />}

        {activeTab === 'track' && <TrackTabScreen />}

        {activeTab === 'profile' && (
          <ProfileTabScreen onSwitchRole={(role) => setActiveRole(role)} />
        )}
      </main>

      {/* Floating Bottom Navigation Capsule Dock */}
      <nav style={{ position: 'fixed', bottom: '16px', left: 0, right: 0, zIndex: 45, pointerEvents: 'none' }}>
        <div style={{ maxWidth: '390px', margin: '0 auto', padding: '0 16px', pointerEvents: 'auto' }}>
          <div style={{
            backgroundColor: activeTab === 'feed' ? 'rgba(0,0,0,0.85)' : '#1c1c1e', backdropFilter: 'blur(12px)',
            borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 22px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 12px 35px rgba(0,0,0,0.8)'
          }}>
            {/* 1. Discover */}
            <button
              onClick={() => setActiveTab('discover')}
              style={{ background: 'none', border: 'none', color: activeTab === 'discover' ? '#ec4899' : '#a1a1aa', cursor: 'pointer', padding: 0 }}
              title="Discover"
            >
              <MapPin size={21} />
            </button>

            {/* 2. Track */}
            <button
              onClick={() => setActiveTab('track')}
              style={{ background: 'none', border: 'none', color: activeTab === 'track' ? '#ec4899' : '#a1a1aa', cursor: 'pointer', padding: 0 }}
              title="Track"
            >
              <ChartColumn size={21} />
            </button>

            {/* 3. Center Elevated Gradient FAB (+) */}
            <div
              onClick={() => showToast('Opened Post Creator & Workout Logger (+)')}
              style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '-20px', border: '3px solid #000000', cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.5)'
              }}
            >
              <Plus size={22} color="#ffffff" strokeWidth={3} />
            </div>

            {/* 4. Wallet (Exact Figma hot pink colored accent when active!) */}
            <button
              onClick={() => setActiveTab('cards')}
              style={{ background: 'none', border: 'none', color: activeTab === 'cards' ? '#ec4899' : '#a1a1aa', cursor: 'pointer', padding: 0 }}
              title="Wallet & Membership"
            >
              <Wallet size={21} />
            </button>

            {/* 5. Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#ec4899' : '#a1a1aa', cursor: 'pointer', padding: 0 }}
              title="Profile"
            >
              <User size={21} />
            </button>
          </div>
        </div>
      </nav>

      {/* Sheets & Overlays */}
      <PhoneModals
        isCommentsOpen={isCommentsOpen}
        onCloseComments={() => setIsCommentsOpen(false)}
        isFullHistoryOpen={isFullHistoryOpen}
        onCloseFullHistory={() => setIsFullHistoryOpen(false)}
        isMenuOpen={isMenuOpen}
        onCloseMenu={() => setIsMenuOpen(false)}
        onSelectRole={(r) => {
          if (r.includes('Staff')) setActiveRole('STAFF');
          else if (r.includes('Coach')) setActiveRole('COACH');
          else if (r.includes('Organizer')) setActiveRole('ORGANIZER');
          else if (r.includes('Desktop') && onOpenDesktopSuite) onOpenDesktopSuite();
        }}
      />

      {/* Ephemeral Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', left: '20px', right: '20px', maxWidth: '400px', margin: '0 auto',
          backgroundColor: '#18181b', border: '1px solid #ec4899', color: '#ffffff',
          borderRadius: '12px', padding: '10px 14px', fontSize: '12px', fontWeight: 700,
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)', zIndex: 80, display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#ec4899" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
