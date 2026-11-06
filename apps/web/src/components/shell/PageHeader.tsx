import React from 'react';

/** Server Component page heading (h1) shared by every suite route. */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="gp-page-header gp-row-between" style={{ alignItems: 'flex-end' }}>
      <div style={{ minWidth: 0 }}>
        <h1 className="gp-page-title">{title}</h1>
        {subtitle && <p className="gp-page-subtitle">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
