'use client';

import React, { useState } from 'react';
import {
  Menu, MessageSquareMore, Bell, Settings, Wifi,
  MapPin, ChartColumn, Plus, Wallet, User, CheckCircle2, MessageCircle
} from 'lucide-react';
import { WalletTabScreen } from './WalletTabScreen';
import { FeedTabScreen } from './FeedTabScreen';
import { PhoneModals } from './PhoneModals';

export type ActivePhoneTab = 'feed' | 'discover' | 'cards' | 'track' | 'profile';

export function UnifiedPhoneApp() {
  const [activeTab, setActiveTab] = useState<ActivePhoneTab>('cards');
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isFullHistoryOpen, setIsFullHistoryOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 0 40px' }}>
      {/* Top Breadcrumb & Active Tab Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '420px', marginBottom: '14px', padding: '8px 16px', backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 800, backgroundColor: '#10b98120', padding: '2px 8px', borderRadius: '99px' }}>LIVE PHONE</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#f4f4f5' }}>
            {activeTab === 'cards' ? 'Active: Membership & Wallet' : activeTab === 'feed' ? 'Active: Community Feed' : `Active: ${activeTab.toUpperCase()}`}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#ec4899', fontWeight: 700 }}>Tap bottom dock to switch</span>
      </div>

      {/* SINGLE AUTHENTIC IPHONE FRAME */}
      <div style={{
        width: '385px', height: '790px', backgroundColor: '#000000', borderRadius: '46px',
        border: '9px solid #1e2e3d', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(30,46,61,0.5)',
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', flexShrink: 0
      }}>
        {/* iOS Top Notch */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '150px', height: '24px', backgroundColor: '#1e2e3d', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 50 }} />

        {/* iOS Status Bar */}
        <div style={{ paddingTop: '10px', paddingLeft: '24px', paddingRight: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', fontSize: '11px', fontWeight: 600, zIndex: 40 }}>
          <span>9:41 AM</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wifi size={13} />
            <span style={{ fontSize: '10px' }}>100%</span>
            <div style={{ width: '18px', height: '9px', border: '1px solid #ffffff', borderRadius: '3px', padding: '1px', display: 'flex' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '1px' }} />
            </div>
          </div>
        </div>

        {/* Top App Header: ☰ getphysical + Chat, Bell, Settings */}
        <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setIsMenuOpen(true)} style={{ color: '#fff', cursor: 'pointer', padding: 0 }}>
              <Menu size={22} />
            </button>
            <span
              onClick={() => setActiveTab('feed')}
              style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px', cursor: 'pointer' }}
            >
              getphysical
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div onClick={() => showToast('Inbox: 2 Unread messages from Coach Sarah & Marco')} style={{ position: 'relative', cursor: 'pointer' }}>
              <MessageSquareMore size={20} color="#ffffff" />
              <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
            </div>
            <div onClick={() => showToast('Notifications: 3 new PR challenge leaderboard alerts')} style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#ffffff" />
              <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
            </div>
            <button onClick={() => setIsMenuOpen(true)} style={{ color: '#fff', cursor: 'pointer', padding: 0 }}>
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* ACTIVE SCREEN CONTENT (SWITCHES BASED ON TAPPED BOTTOM TAB) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {activeTab === 'cards' && (
            <WalletTabScreen
              onOpenFullHistory={() => setIsFullHistoryOpen(true)}
              onSelectTx={(name, amt) => showToast(`Receipt: ${name} (${amt}) • Verified immutable ledger`)}
            />
          )}

          {activeTab === 'feed' && (
            <FeedTabScreen
              onOpenComments={() => setIsCommentsOpen(true)}
              onShare={() => showToast('🔗 Workout post link copied to clipboard!')}
              onSelectCreator={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'discover' && (
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#09090b', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>Discover Venues</h3>
              <p style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '14px' }}>Nearby clubs with live capacity telemetry:</p>
              {['Metro Sports Arena (BGC) • 42/100', 'Sprout Pickleball Club • 18/24', 'Nexus Sports Complex • 30/50'].map((f) => (
                <div key={f} style={{ padding: '12px', backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#f4f4f5' }}>{f}</div>
                  <button onClick={() => showToast('Opened turnstile pass checkout sheet (+₱15 fee)')} style={{ marginTop: '6px', backgroundColor: '#10b981', color: '#000', fontSize: '11px', fontWeight: 800, padding: '5px 10px', borderRadius: '6px' }}>
                    Drop In • ₱350
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'track' && (
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#09090b', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>Trinity Workout Tracker</h3>
              <div style={{ backgroundColor: '#18181b', padding: '14px', borderRadius: '12px', border: '1px solid #27272a' }}>
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 800 }}>ACTIVE LIFT SET</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '4px 0 10px' }}>Conventional Deadlift • 225 KG × 1</div>
                <button onClick={() => showToast('Rest timer started: 90 seconds (+15s / Skip)')} style={{ backgroundColor: '#ec4899', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '6px 12px', borderRadius: '6px' }}>
                  Complete Set & Start Rest Timer
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#09090b', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img src="/assets/design/avatar-adam.png" alt="Adam" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #ec4899' }} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: 0 }}>Adam Arête</h3>
                  <div style={{ fontSize: '11px', color: '#a1a1aa' }}>@adam.arete • 142 followers</div>
                </div>
              </div>
              <button onClick={() => showToast('Switched to Reclub-style Organizer Pro Meet')} style={{ width: '100%', padding: '10px', backgroundColor: '#f59e0b', color: '#000', fontSize: '12px', fontWeight: 800, borderRadius: '8px' }}>
                🏆 Open Organizer Pro Hub (Reclub-Grade)
              </button>
            </div>
          )}
        </div>

        {/* FLOATING BOTTOM NAVIGATION CAPSULE DOCK */}
        <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px', zIndex: 45 }}>
          <div style={{
            backgroundColor: activeTab === 'feed' ? 'rgba(0,0,0,0.85)' : '#1c1c1e', backdropFilter: 'blur(10px)',
            borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
          }}>
            {/* MapPin -> Discover */}
            <button onClick={() => setActiveTab('discover')} style={{ color: activeTab === 'discover' ? '#ec4899' : '#a1a1aa', cursor: 'pointer', padding: 0 }}>
              <MapPin size={20} />
            </button>

            {/* ChartColumn -> Track */}
            <button onClick={() => setActiveTab('track')} style={{ color: activeTab === 'track' ? '#ec4899' : '#a1a1aa', cursor: 'pointer', padding: 0 }}>
              <ChartColumn size={20} />
            </button>

            {/* Elevated Gradient Center FAB (+) */}
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: '-22px', border: '4px solid #000000', cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.5)'
            }} onClick={() => showToast('Opened Post Creator & Workout Logger (+)')}>
              <Plus size={22} color="#ffffff" strokeWidth={3} />
            </div>

            {/* Wallet -> Cards (EXACT FIGMA COLORED ACCENT #EC4899!) */}
            <button onClick={() => setActiveTab('cards')} style={{ color: activeTab === 'cards' ? '#ec4899' : '#a1a1aa', cursor: 'pointer', padding: 0 }}>
              <Wallet size={20} />
            </button>

            {/* User -> Profile */}
            <button onClick={() => setActiveTab('profile')} style={{ color: activeTab === 'profile' ? '#ec4899' : '#a1a1aa', cursor: 'pointer', padding: 0 }}>
              <User size={20} />
            </button>
          </div>
        </div>

        {/* MODALS & OVERLAYS */}
        <PhoneModals
          isCommentsOpen={isCommentsOpen}
          onCloseComments={() => setIsCommentsOpen(false)}
          isFullHistoryOpen={isFullHistoryOpen}
          onCloseFullHistory={() => setIsFullHistoryOpen(false)}
          isMenuOpen={isMenuOpen}
          onCloseMenu={() => setIsMenuOpen(false)}
          onSelectRole={(r) => showToast(`Switched active profile role to: ${r}`)}
        />

        {/* FLOATING ACTION TOAST */}
        {toast && (
          <div style={{
            position: 'absolute', top: '70px', left: '16px', right: '16px',
            backgroundColor: '#18181b', border: '1px solid #ec4899', color: '#ffffff',
            borderRadius: '12px', padding: '10px 14px', fontSize: '11px', fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)', zIndex: 70, display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <CheckCircle2 size={16} color="#ec4899" />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
