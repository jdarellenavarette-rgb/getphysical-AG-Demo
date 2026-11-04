'use client';

import React from 'react';

interface EngagementGaugeCardProps {
  score?: number;
  target?: number;
}

export function EngagementGaugeCard({ score = 7.4, target = 8.0 }: EngagementGaugeCardProps) {
  // 7.4 out of 10 = 74%
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: '#111319',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '165px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
            Club Engagement Score
          </h3>
          <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>
            Optimized and running smoothly
          </p>
          <div style={{ marginTop: '22px', fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>
            Target: <strong style={{ color: '#D1D5DB' }}>{target.toFixed(1)}</strong>
          </div>
        </div>

        {/* Circular Gauge Ring */}
        <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#232836"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#coralGrad)"
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s ease',
                filter: 'drop-shadow(0 0 6px rgba(255, 83, 100, 0.6))',
              }}
            />
            <defs>
              <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA69E" />
                <stop offset="100%" stopColor="#FF3D57" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#9CA3AF', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Engagement
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
