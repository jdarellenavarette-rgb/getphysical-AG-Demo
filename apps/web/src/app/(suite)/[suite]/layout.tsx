import React from 'react';
import { notFound } from 'next/navigation';
import { SUITE_MODES, parseSuiteSlug, suiteToSlug } from '../../../lib/suite-routes';
import { SuiteProviders } from '../../../components/shell/SuiteSession';
import { SuiteHeader } from '../../../components/shell/SuiteHeader';
import { ArchitectureExplainer } from '../../../components/shell/HeaderControls';
import { OfflineBanner } from '../../../components/shell/OfflineBanner';
import { BottomNav, NavigationDock } from '../../../components/suite/NavigationDock';

export const dynamicParams = false;

export function generateStaticParams() {
  return SUITE_MODES.map((mode) => ({ suite: suiteToSlug(mode) }));
}

export default async function SuiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ suite: string }>;
}) {
  const { suite } = await params;
  const suiteMode = parseSuiteSlug(suite);
  if (!suiteMode) notFound();

  return (
    <SuiteProviders suiteMode={suiteMode}>
      <a href="#gp-main" className="gp-skip-link">
        Skip to main content
      </a>
      <div className="gp-shell">
        <NavigationDock suiteMode={suiteMode} />
        <div className="gp-workspace">
          <SuiteHeader suiteMode={suiteMode} />
          <ArchitectureExplainer />
          <OfflineBanner />
          <main id="gp-main" className="gp-main" tabIndex={-1}>
            {children}
          </main>
        </div>
        <BottomNav suiteMode={suiteMode} />
      </div>
    </SuiteProviders>
  );
}
