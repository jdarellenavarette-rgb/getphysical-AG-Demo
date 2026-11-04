'use client';

import React from 'react';
import { Send, Sparkles } from 'lucide-react';

interface HeroPromoCardProps {
  onCreateMessage: () => void;
  suiteMode?: 'GYMDASH' | 'CLUBDASH';
}

export function HeroPromoCard({ onCreateMessage, suiteMode = 'GYMDASH' }: HeroPromoCardProps) {
  const isGym = suiteMode === 'GYMDASH';

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '24px',
        backgroundColor: '#111319',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '28px 24px',
        minHeight: '340px',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)',
      }}
    >
      {/* Warm Ambient Bottom Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20px',
          left: '10%',
          right: '10%',
          height: '180px',
          background: 'radial-gradient(ellipse at bottom, rgba(255, 83, 100, 0.35) 0%, rgba(225, 29, 72, 0.12) 50%, transparent 80%)',
          pointerEvents: 'none',
          filter: 'blur(24px)',
        }}
      />

      {/* 3D Liquid Metallic Sculpture Graphic */}
      <div style={{ position: 'relative', width: '130px', height: '130px', marginTop: '4px' }}>
        <svg viewBox="0 0 160 160" width="100%" height="100%" style={{ filter: 'drop-shadow(0 12px 24px rgba(255, 83, 100, 0.4))' }}>
          <defs>
            <linearGradient id="metallicChrome" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA69E" />
              <stop offset="25%" stopColor="#FF6876" />
              <stop offset="50%" stopColor="#E11D48" />
              <stop offset="75%" stopColor="#9F1239" />
              <stop offset="100%" stopColor="#FFAAA6" />
            </linearGradient>
            <radialGradient id="specularGlow" cx="35%" cy="30%" r="45%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#FFA69E" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#E11D48" stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="copperReflect" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#FF6876" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#881337" stopOpacity="0.9" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Liquid Fold Back Layer */}
          <path
            d="M 45 40 Q 90 10 125 45 Q 155 85 130 120 Q 95 155 55 135 Q 15 110 30 70 Z"
            fill="url(#copperReflect)"
            opacity="0.85"
          />

          {/* Organic Metallic Folds */}
          <path
            d="M 50 48 C 75 25, 115 28, 128 58 C 142 90, 118 128, 92 135 C 65 142, 35 125, 38 92 C 40 68, 32 62, 50 48 Z"
            fill="url(#metallicChrome)"
          />

          {/* Inner Swirl & Specular Highlighting */}
          <path
            d="M 60 60 C 80 45, 105 52, 112 72 C 118 92, 98 114, 80 115 C 62 116, 52 98, 55 80 C 58 68, 48 70, 60 60 Z"
            fill="url(#specularGlow)"
          />

          {/* Specular Glint Highlight Dots */}
          <circle cx="65" cy="55" r="7" fill="#FFFFFF" opacity="0.85" filter="url(#softGlow)" />
          <circle cx="108" cy="72" r="4" fill="#FFFFFF" opacity="0.75" />
          <circle cx="85" cy="115" r="5" fill="#FFA69E" opacity="0.6" />
        </svg>
      </div>

      {/* Copy */}
      <div style={{ textAlign: 'center', zIndex: 1, marginTop: '16px' }}>
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.3px',
            marginBottom: '6px',
          }}
        >
          {isGym ? 'Manage Messaging & Promos' : 'Broadcast Club Announcements'}
        </h3>
        <p
          style={{
            fontSize: '12px',
            lineHeight: '17px',
            color: '#9CA3AF',
            maxWidth: '220px',
            margin: '0 auto',
          }}
        >
          {isGym
            ? 'Send newsletters, promos, and reminders within your club.'
            : 'Push court schedules, tournament invites, and club alerts.'}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={onCreateMessage}
        style={{
          zIndex: 2,
          marginTop: '18px',
          width: '100%',
          maxWidth: '200px',
          padding: '10px 18px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #FF6B7A 0%, #FF3D57 50%, #E11D48 100%)',
          color: '#FFFFFF',
          fontSize: '13px',
          fontWeight: 800,
          border: 'none',
          boxShadow: '0 8px 20px rgba(225, 29, 72, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <span>Create Message</span>
        <span style={{ fontSize: '14px', fontWeight: 900 }}>›</span>
      </button>
    </div>
  );
}
