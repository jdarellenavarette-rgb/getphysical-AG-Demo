import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { DEFAULT_SUITE, SUITE_LABELS, SUITE_MODES, suiteHref } from '../lib/suite-routes';

export default function NotFound() {
  return (
    <main className="gp-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="gp-card gp-state" style={{ maxWidth: 520, width: '100%' }}>
        <div className="gp-state-icon" aria-hidden="true">
          <Compass size={24} />
        </div>
        <h1 className="gp-state-title">Page not found</h1>
        <p className="gp-state-body">That address doesn’t match any workspace or view. Pick a workspace to continue.</p>
        <div className="gp-row" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href={suiteHref(DEFAULT_SUITE)} className="gp-btn gp-btn-primary">
            Go to {SUITE_LABELS[DEFAULT_SUITE]}
          </Link>
          {SUITE_MODES.filter((m) => m !== DEFAULT_SUITE).map((m) => (
            <Link key={m} href={suiteHref(m)} className="gp-btn gp-btn-secondary">
              {SUITE_LABELS[m]}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
