import React from 'react';
import { LoadingRegion, Skeleton, SkeletonCard } from './Skeleton';

/** Layout-matched skeletons for route-level loading.tsx files (Server Components). */

export function PageHeaderSkeleton() {
  return (
    <div className="gp-page-header" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Skeleton width={320} height={22} style={{ maxWidth: '80%' }} />
      <Skeleton width={520} height={13} style={{ maxWidth: '95%' }} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <LoadingRegion label="Loading dashboard">
      <div className="gp-stack">
        <div className="gp-grid-hero">
          <div className="gp-card" style={{ minHeight: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Skeleton width={150} height={140} radius={70} />
            <Skeleton width="70%" height={18} />
            <Skeleton width="85%" height={12} />
            <Skeleton width={200} height={44} radius={999} style={{ marginTop: 'auto' }} />
          </div>
          <div className="gp-card gp-stack">
            <Skeleton width="40%" height={20} />
            <div className="gp-grid-auto">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={150} radius={18} />
              ))}
            </div>
            <div className="gp-grid-auto-wide" style={{ gap: 14 }}>
              <Skeleton height={58} radius={14} />
              <Skeleton height={58} radius={14} />
            </div>
          </div>
        </div>
        <div className="gp-grid-split">
          <SkeletonCard height={360} lines={5} />
          <div className="gp-stack">
            <SkeletonCard height={165} lines={1} />
            <SkeletonCard height={165} lines={1} />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}

export function InboxSkeleton() {
  return (
    <LoadingRegion label="Loading inbox">
      <PageHeaderSkeleton />
      <div className="gp-card gp-inbox" data-view="list">
        <div className="gp-inbox-list" style={{ padding: 16, gap: 12 }}>
          <Skeleton height={40} />
          <div className="gp-row">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} width={72} height={30} radius={999} />
            ))}
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={74} radius={12} />
          ))}
        </div>
        <div className="gp-inbox-thread" style={{ padding: 24, gap: 14 }}>
          <Skeleton width="50%" height={20} />
          <Skeleton width="60%" height={56} radius={16} />
          <Skeleton width="45%" height={56} radius={16} style={{ alignSelf: 'flex-end' }} />
          <Skeleton height={44} radius={12} style={{ marginTop: 'auto' }} />
        </div>
      </div>
    </LoadingRegion>
  );
}

export function ScheduleSkeleton() {
  return (
    <LoadingRegion label="Loading schedule">
      <PageHeaderSkeleton />
      <div className="gp-card gp-stack">
        <div className="gp-row">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={96} height={52} radius={12} />
          ))}
        </div>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={52} radius={8} />
        ))}
        <Skeleton height={180} radius={16} />
      </div>
    </LoadingRegion>
  );
}

export function TwoPanelSkeleton({ label }: { label: string }) {
  return (
    <LoadingRegion label={label}>
      <PageHeaderSkeleton />
      <div className="gp-grid-auto-wide">
        <SkeletonCard height={420} lines={5} />
        <SkeletonCard height={420} lines={5} />
      </div>
    </LoadingRegion>
  );
}
