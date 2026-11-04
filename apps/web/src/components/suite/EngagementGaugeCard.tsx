'use client';

import React from 'react';
import { SuiteMode } from './HeroPromoCard';
import { useSuiteTheme } from './theme';

interface EngagementGaugeCardProps {
  suiteMode?: SuiteMode;
}

export function EngagementGaugeCard({ suiteMode = 'GYMDASH' }: EngagementGaugeCardProps) {
  const { theme, isDark } = useSuiteTheme();
  const getGaugeMeta = () => {
    switch (suiteMode) {
      case 'CLUBDASH':
        return { score: 8.6, target: 9.0, title: 'Spatial Court Efficiency', sub: 'Optimized parent/child allocations' };
      case 'COACHDASH':
        return { score: 9.1, target: 9.5, title: 'Athlete Compliance Score', sub: 'Client cycle check-ins on-track' };
      case 'ORGANIZERDASH':
        return { score: 8.8, target: 9.0, title: 'Tournament Check-In Index', sub: 'All division rosters cleared' };
      case 'GYMDASH':
      default:
        return { score: 7.4, target: 8.0, title: 'Club Engagement Score', sub: 'Optimized and running smoothly' };
    }
  };

  const { score, target, title, sub } = getGaugeMeta();
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '165px',
        boxShadow: theme.shadowCard,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.3px' }}>
            {title}
          </h3>
          <p style={{ fontSize: '11px', color: theme.textMuted, marginTop: '3px', fontWeight: 500 }}>
            {sub}
          </p>
          <div style={{ marginTop: '22px', fontSize: '11px', color: theme.textMuted, fontWeight: 700 }}>
            Target: <strong style={{ color: theme.textPrimary }}>{target.toFixed(1)}</strong>
          </div>
        </div>

        {/* Circular Gauge Ring */}
        <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={isDark ? '#262B37' : '#E2E8F0'}
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#coralGradLight)"
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s ease',
                filter: 'drop-shadow(0 0 4px rgba(225, 29, 72, 0.4))',
              }}
            />
            <defs>
              <linearGradient id="coralGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA69E" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: theme.textPrimary, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '9px', fontWeight: 800, color: theme.textMuted, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Index
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
