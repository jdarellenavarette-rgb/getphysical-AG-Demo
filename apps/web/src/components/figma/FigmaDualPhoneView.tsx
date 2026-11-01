'use client';

import React, { useState } from 'react';
import { WalletPhone } from './WalletPhone';
import { FeedPhone } from './FeedPhone';
import { Sparkles, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function FigmaDualPhoneView() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{
      width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start', padding: '10px 0 40px'
    }}>
      {/* Top Fidelity Tag */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: '880px', marginBottom: '20px', padding: '8px 16px',
        backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#ec4899" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#f4f4f5' }}>
            Figma Design Spec (1:1 Exact Match)
          </span>
          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, backgroundColor: '#10b98120', padding: '2px 8px', borderRadius: '99px' }}>
            Pixel-Perfect
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
          Interactive Dual-iPhone View • Tap card to flip • Tap Like/Save
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', top: '75px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#18181b', border: '1px solid #ec4899', color: '#ffffff',
          borderRadius: '99px', padding: '8px 18px', fontSize: '12px', fontWeight: 700,
          boxShadow: '0 10px 30px rgba(236,72,153,0.3)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <CheckCircle2 size={14} color="#ec4899" />
          <span>{toast}</span>
        </div>
      )}

      {/* Side-by-Side Dual Phone Layout */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        alignItems: 'flex-start', gap: '36px', maxWidth: '940px'
      }}>
        {/* Left: Membership & Wallet */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            fontSize: '13px', fontWeight: 700, color: '#94a3b8',
            marginBottom: '10px', letterSpacing: '0.2px', alignSelf: 'flex-start'
          }}>
            Membership &amp; Wallet / iPhone
          </div>
          <WalletPhone
            onOpenSettings={() => showToast('Settings: Identity, Roles & Waivers')}
            onOpenFullHistory={() => showToast('Opening immutable Statement of Account (SOA)...')}
          />
        </div>

        {/* Right: Community Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            fontSize: '13px', fontWeight: 700, color: '#94a3b8',
            marginBottom: '10px', letterSpacing: '0.2px', alignSelf: 'flex-start'
          }}>
            Community Feed / iPhone
          </div>
          <FeedPhone
            onOpenSettings={() => showToast('Settings: Feed Filters & Privacy')}
            onOpenComments={() => showToast('Opening comment drawer for @mowtuscano...')}
            onShare={() => showToast('Workout link copied to clipboard!')}
          />
        </div>
      </div>
    </div>
  );
}
