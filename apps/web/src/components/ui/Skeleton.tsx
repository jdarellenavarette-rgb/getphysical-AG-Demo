import React from 'react';

/** Server-safe skeleton primitive (no hooks) used by loading.tsx files and in-view loading states. */
export function Skeleton({
  width = '100%',
  height = 14,
  radius = 10,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return <span aria-hidden="true" className="gp-skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function SkeletonCard({ height = 200, lines = 3 }: { height?: number; lines?: number }) {
  return (
    <div className="gp-card" style={{ minHeight: height, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton width="45%" height={18} />
      <Skeleton width="70%" height={12} />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={40} radius={12} />
      ))}
    </div>
  );
}

/** Wraps skeleton content with a polite live region announcement for screen readers. */
export function LoadingRegion({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="gp-sr-only">{label}</span>
      {children}
    </div>
  );
}
