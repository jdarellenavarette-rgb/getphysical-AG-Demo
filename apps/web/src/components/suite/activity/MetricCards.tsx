import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { T } from '../../../lib/theme-vars';
import type { ProgressMetric, WaveMetric } from './metrics';

/** Server Component: KPI tile with sparkline. */
export function MetricWaveCard({ metric, gradientId }: { metric: WaveMetric; gradientId: string }) {
  return (
    <div className="gp-subcard" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 18 }}>
      <div className="gp-row-between" style={{ marginBottom: 6 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: T.textSecondary }}>{metric.label}</h3>
        {metric.badge && <span className="gp-badge gp-badge-success">{metric.badge}</span>}
      </div>
      <div style={{ height: 54, width: '100%', margin: '4px 0 8px' }} aria-hidden="true">
        <svg viewBox="0 0 180 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.waveStroke} stopOpacity={T.waveFillOpacity} />
              <stop offset="100%" stopColor={T.waveStroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${metric.path} L 180 50 L 0 50 Z`} fill={`url(#${gradientId})`} />
          <path d={metric.path} fill="none" stroke={T.waveStroke} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <div className="gp-row" style={{ alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: T.textPrimary, letterSpacing: -0.5 }}>{metric.value}</span>
          <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 700 }}>{metric.unit}</span>
          {metric.trend && (
            <span
              className="gp-row"
              style={{ gap: 2, fontSize: 12, fontWeight: 800, color: metric.trend.direction === 'up' ? T.accentGreen : T.accentText }}
            >
              {metric.trend.direction === 'up' ? <ArrowUpRight size={15} aria-hidden="true" /> : <ArrowDownRight size={15} aria-hidden="true" />}
              <span>
                <span className="gp-sr-only">{metric.trend.direction === 'up' ? 'Up' : 'Down'} </span>
                {metric.trend.label}
              </span>
            </span>
          )}
        </div>
        <div className="gp-row-between" style={{ marginTop: 6, fontSize: 12, color: T.textMuted, fontWeight: 600 }}>
          <span>
            Goal: <strong style={{ color: T.textPrimary }}>{metric.goal}</strong>
          </span>
          <span>
            Avg: <strong style={{ color: T.textPrimary }}>{metric.average}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

const TONE: Record<ProgressMetric['tone'], { fg: string; bg: string; bar: string }> = {
  accent: { fg: T.accentText, bg: T.accentMuted, bar: `linear-gradient(90deg, ${T.accent}, ${T.accentHover})` },
  green: { fg: T.accentGreen, bg: T.accentGreenMuted, bar: T.accentGreen },
  info: { fg: T.info, bg: 'rgba(59, 130, 246, 0.12)', bar: T.info },
};

/** Server Component: labelled progress meter (role="meter" for AT). */
export function ProgressStatCard({ metric }: { metric: ProgressMetric }) {
  const Icon = metric.icon;
  const tone = TONE[metric.tone];
  return (
    <div className="gp-subcard gp-row" style={{ gap: 12, padding: '12px 16px', borderRadius: 14 }}>
      <span
        aria-hidden="true"
        style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tone.bg, color: tone.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        <Icon size={17} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="gp-row-between" style={{ fontSize: 12, marginBottom: 6, gap: 4 }}>
          <span style={{ color: T.textMuted, fontWeight: 700 }}>{metric.label}</span>
          <span style={{ color: T.textPrimary, fontWeight: 800 }}>{metric.value}</span>
        </div>
        <div className="gp-progress" role="meter" aria-label={metric.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={metric.pct}>
          <span style={{ width: `${metric.pct}%`, background: tone.bar }} />
        </div>
      </div>
    </div>
  );
}
