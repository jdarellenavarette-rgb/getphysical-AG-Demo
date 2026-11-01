'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Coins, Ticket, QrCode } from 'lucide-react';
import { generateDynamicPassTotp } from 'sodia-core';

interface WalletTabScreenProps {
  onOpenFullHistory: () => void;
  onSelectTx: (txName: string, amount: string) => void;
}

export function WalletTabScreen({ onOpenFullHistory, onSelectTx }: WalletTabScreenProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [totpCode, setTotpCode] = useState('482-911');
  const [ttl, setTtl] = useState(60);

  useEffect(() => {
    const updateToken = () => {
      const token = generateDynamicPassTotp('usr_athlete_01', 'pass_metro_vip_01', 'fac_metro_core', Date.now());
      setTotpCode(token.formattedCode);
      setTtl(token.remainingSeconds);
    };
    updateToken();
    const interval = setInterval(updateToken, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* USER GREETING: AVATAR + ADAM ARÊTE */}
      <div style={{ padding: '6px 20px 10px', display: 'flex', alignItems: 'center', gap: '14px', zIndex: 20 }}>
        <img
          src="/assets/design/avatar-adam.png"
          alt="Adam Arête"
          style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.7)', objectFit: 'cover' }}
        />
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.3px', margin: 0 }}>
            Adam Arête
          </h2>
          <span style={{ fontSize: '11px', color: '#ec4899', fontWeight: 700 }}>Titanium VIP Member</span>
        </div>
      </div>

      {/* 3D VIP CARD STACK (CLICK TO FLIP TO TOTP GATE CODE) */}
      <div style={{ padding: '0 16px', cursor: 'pointer', zIndex: 20 }} onClick={() => setIsFlipped(!isFlipped)}>
        {!isFlipped ? (
          <div style={{ position: 'relative' }}>
            <img
              src="/assets/design/vip-card-stack.png"
              alt="GetPhysical VIP Pass"
              style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block' }}
            />
            <div style={{ position: 'absolute', bottom: '12px', right: '14px', backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: '99px', padding: '3px 10px', fontSize: '9px', color: '#ffffff', fontWeight: 800 }}>
              TAP TO FLIP ↻
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#18181b', border: '1px solid #10b981', borderRadius: '16px', padding: '22px 18px', textAlign: 'center', color: '#fff', boxShadow: '0 10px 25px rgba(16,185,129,0.2)' }}>
            <QrCode size={68} color="#10b981" style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700 }}>OFFLINE 60S DYNAMIC TOTP GATE TOKEN</div>
            <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '3px', color: '#34d399', margin: '4px 0' }}>
              {totpCode}
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>Rotates in {ttl}s • Matches Turnstile Gate 01</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '6px' }}>Tap anywhere to flip back to VIP card face</div>
          </div>
        )}
      </div>

      {/* PURE WHITE CURVED SHEET (TRANSACTION HISTORY) */}
      <div style={{
        marginTop: '-12px', flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: '36px', borderTopRightRadius: '36px',
        padding: '18px 18px 80px', display: 'flex', flexDirection: 'column', zIndex: 25, boxShadow: '0 -10px 25px rgba(0,0,0,0.25)'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#000000', textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.3px' }}>
          Transaction History
        </h3>

        {/* LIST OF TRANSACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {/* Sprout Pickleball Club */}
          <div
            onClick={() => onSelectTx('Sprout Pickleball Club', 'PHP 999')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '14px', cursor: 'pointer' }}
          >
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
          <div
            onClick={() => onSelectTx('AMP FITNESS SJDM', 'PHP 799')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '14px', cursor: 'pointer' }}
          >
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
          <div
            onClick={() => onSelectTx('GetPhysical+ Monthly', 'PHP 149')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '14px', cursor: 'pointer' }}
          >
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

        {/* VIEW FULL HISTORY GRADIENT BUTTON */}
        <button
          onClick={onOpenFullHistory}
          style={{
            marginTop: '12px', width: '100%', padding: '11px', borderRadius: '99px',
            background: 'linear-gradient(90deg, #f97316 0%, #ec4899 50%, #d946ef 100%)',
            color: '#ffffff', fontSize: '11px', fontWeight: 900, letterSpacing: '0.8px',
            boxShadow: '0 4px 14px rgba(236,72,153,0.35)', cursor: 'pointer'
          }}
        >
          VIEW FULL HISTORY
        </button>
      </div>
    </div>
  );
}
