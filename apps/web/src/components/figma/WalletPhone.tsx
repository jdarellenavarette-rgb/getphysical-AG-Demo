'use client';

import React, { useState } from 'react';
import {
  Menu, MessageSquareMore, Bell, Settings, Wifi, Battery,
  MapPin, Coins, Ticket, ChartColumn, Plus, Wallet, User, QrCode
} from 'lucide-react';

interface WalletPhoneProps {
  onOpenSettings?: () => void;
  onOpenFullHistory?: () => void;
}

export function WalletPhone({ onOpenSettings, onOpenFullHistory }: WalletPhoneProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div style={{
      width: '380px', height: '780px', backgroundColor: '#000000', borderRadius: '44px',
      border: '9px solid #1e2e3d', boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(30,46,61,0.5)',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', flexShrink: 0
    }}>
      {/* iOS Top Notch & Speaker */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '150px', height: '24px', backgroundColor: '#1e2e3d', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 40 }} />

      {/* iOS Status Bar */}
      <div style={{ paddingTop: '10px', paddingLeft: '24px', paddingRight: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', fontSize: '11px', fontWeight: 600, zIndex: 30 }}>
        <span>9:41 AM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wifi size={13} />
          <span style={{ fontSize: '10px' }}>100%</span>
          <div style={{ width: '18px', height: '9px', border: '1px solid #ffffff', borderRadius: '3px', padding: '1px', display: 'flex' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '1px' }} />
          </div>
        </div>
      </div>

      {/* App Header Bar: ☰ getphysical + Chat, Bell, Settings */}
      <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Menu size={22} color="#ffffff" style={{ cursor: 'pointer' }} />
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>getphysical</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <MessageSquareMore size={20} color="#ffffff" />
            <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
          </div>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} color="#ffffff" />
            <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
          </div>
          <Settings size={20} color="#ffffff" style={{ cursor: 'pointer' }} onClick={onOpenSettings} />
        </div>
      </div>

      {/* User Greeting: Avatar + Adam Arête */}
      <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', gap: '14px', zIndex: 30 }}>
        <img
          src="/assets/design/avatar-adam.png"
          alt="Adam Arête"
          style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.7)', objectFit: 'cover' }}
        />
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.3px', margin: 0 }}>
          Adam Arête
        </h2>
      </div>

      {/* VIP 3D Card Stack (Figma Asset) */}
      <div style={{ padding: '0 16px', cursor: 'pointer', zIndex: 20 }} onClick={() => setIsFlipped(!isFlipped)}>
        {!isFlipped ? (
          <img
            src="/assets/design/vip-card-stack.png"
            alt="GetPhysical VIP Pass"
            style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block' }}
          />
        ) : (
          <div style={{ backgroundColor: '#18181b', border: '1px solid #10b981', borderRadius: '16px', padding: '18px', textAlign: 'center', color: '#fff' }}>
            <QrCode size={64} color="#10b981" style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>OFFLINE 60S DYNAMIC TOTP</div>
            <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '2px', color: '#34d399' }}>482-911</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>Tap to flip back to Card face</div>
          </div>
        )}
      </div>

      {/* Pure White Curved Sheet ("Transaction History") */}
      <div style={{
        marginTop: '-12px', flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: '36px', borderTopRightRadius: '36px',
        padding: '18px 18px 75px', display: 'flex', flexDirection: 'column', zIndex: 25, boxShadow: '0 -10px 25px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#000000', textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.3px' }}>
          Transaction History
        </h3>

        {/* Transaction Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {/* Sprout Pickleball Club */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={17} color="#f97316" />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#000' }}>Sprout Pickleball Club</div>
                <div style={{ fontSize: '10px', color: '#a1a1aa' }}>Check-in: Today, 01:32PM</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#000' }}>FREE/PASS</div>
              <div style={{ fontSize: '10px', color: '#a1a1aa' }}>PHP 999</div>
            </div>
          </div>

          {/* AMP FITNESS SJDM */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coins size={17} color="#f97316" />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#000' }}>AMP FITNESS SJDM</div>
                <div style={{ fontSize: '10px', color: '#a1a1aa' }}>Membership: Yesterday, 11:01AM</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#000' }}>MONTHLY</div>
              <div style={{ fontSize: '10px', color: '#a1a1aa' }}>PHP 799</div>
            </div>
          </div>

          {/* GetPhysical+ */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ticket size={17} color="#9333ea" />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#000' }}>GetPhysical+</div>
                <div style={{ fontSize: '10px', color: '#a1a1aa' }}>Subscription: Yesterday, 06:48AM</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#000' }}>MONTHLY</div>
              <div style={{ fontSize: '10px', color: '#a1a1aa' }}>PHP 149</div>
            </div>
          </div>
        </div>

        {/* View Full History Button */}
        <button
          onClick={onOpenFullHistory}
          style={{
            marginTop: '10px', width: '100%', padding: '10px', borderRadius: '99px',
            background: 'linear-gradient(90deg, #f97316 0%, #ec4899 50%, #d946ef 100%)',
            color: '#ffffff', fontSize: '11px', fontWeight: 900, letterSpacing: '0.8px',
            boxShadow: '0 4px 14px rgba(236,72,153,0.35)'
          }}
        >
          VIEW FULL HISTORY
        </button>
      </div>

      {/* Floating Bottom Navigation Dock */}
      <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px', zIndex: 50 }}>
        <div style={{
          backgroundColor: '#1c1c1e', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)',
          padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.7)'
        }}>
          <MapPin size={20} color="#a1a1aa" style={{ cursor: 'pointer' }} />
          <ChartColumn size={20} color="#a1a1aa" style={{ cursor: 'pointer' }} />
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '-22px', border: '4px solid #000000', cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.5)'
          }}>
            <Plus size={22} color="#ffffff" strokeWidth={3} />
          </div>
          <Wallet size={20} color="#ec4899" style={{ cursor: 'pointer' }} />
          <User size={20} color="#a1a1aa" style={{ cursor: 'pointer' }} />
        </div>
      </div>
    </div>
  );
}
