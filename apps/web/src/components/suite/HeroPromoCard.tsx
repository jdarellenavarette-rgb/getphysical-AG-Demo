'use client';

import React from 'react';
import { Send, Sparkles } from 'lucide-react';
import { LiquidChromeCanvas } from './LiquidChromeCanvas';
import { useSuiteTheme } from './theme';

export type SuiteMode = 'GYMDASH' | 'CLUBDASH' | 'COACHDASH' | 'ORGANIZERDASH';

interface HeroPromoCardProps {
  onCreateMessage: () => void;
  suiteMode?: SuiteMode;
}

export function HeroPromoCard({ onCreateMessage, suiteMode = 'GYMDASH' }: HeroPromoCardProps) {
  const { theme, isDark } = useSuiteTheme();
  const getCopy = () => {
    switch (suiteMode) {
      case 'CLUBDASH':
        return {
          title: 'Facility Bookings & Affiliations',
          desc: 'Broadcast court schedule changes and partner club notices.',
          btn: 'Broadcast Alert ›',
        };
      case 'COACHDASH':
        return {
          title: 'Coach Client CRM & Programs',
          desc: 'Push cycle updates, recovery reminders, and client check-in nudges.',
          btn: 'Message Clients ›',
        };
      case 'ORGANIZERDASH':
        return {
          title: 'Participant Broadcasts & CRM',
          desc: 'Dispatch bracket seeds, check-in calls, and tournament rule packs.',
          btn: 'Broadcast Event ›',
        };
      case 'GYMDASH':
      default:
        return {
          title: 'Manage Messaging & Promos',
          desc: 'Send newsletters, promos, and reminders within your club.',
          btn: 'Create Message ›',
        };
    }
  };

  const copy = getCopy();

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '24px',
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 22px 28px',
        minHeight: '340px',
        boxShadow: theme.shadowCard,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Subtle Warm Light Ambient Bottom Radial Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '10%',
          right: '10%',
          height: '160px',
          background: 'radial-gradient(ellipse at bottom, rgba(225, 29, 72, 0.12) 0%, rgba(225, 29, 72, 0.03) 60%, transparent 80%)',
          pointerEvents: 'none',
          filter: 'blur(20px)',
        }}
      />

      {/* 3D WebGL Liquid Metallic Sculpture with Interactive Mouse Tilt */}
      <div style={{ position: 'relative', width: '160px', height: '145px', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LiquidChromeCanvas width={160} height={145} isDark={isDark} />
      </div>

      {/* Mobile-grade Bold Crisp Typography */}
      <div style={{ textAlign: 'center', zIndex: 1, marginTop: '14px' }}>
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 900,
            color: theme.textPrimary,
            letterSpacing: '-0.4px',
            marginBottom: '6px',
          }}
        >
          {copy.title}
        </h3>
        <p
          style={{
            fontSize: '12px',
            lineHeight: '17px',
            color: theme.textMuted,
            maxWidth: '220px',
            margin: '0 auto',
            fontWeight: 500,
          }}
        >
          {copy.desc}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={onCreateMessage}
        style={{
          zIndex: 2,
          marginTop: '16px',
          width: '100%',
          maxWidth: '210px',
          padding: '11px 18px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
          color: '#FFFFFF',
          fontSize: '13px',
          fontWeight: 800,
          border: 'none',
          boxShadow: '0 8px 18px rgba(225, 29, 72, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 22px rgba(225, 29, 72, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 18px rgba(225, 29, 72, 0.35)';
        }}
      >
        <span>{copy.btn}</span>
      </button>
    </div>
  );
}
