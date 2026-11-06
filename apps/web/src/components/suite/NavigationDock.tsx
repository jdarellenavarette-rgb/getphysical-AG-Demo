'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Calendar, FileText, Home, MessageSquare, Settings, type LucideIcon } from 'lucide-react';
import {
  NAV_TABS,
  TAB_LABELS,
  TAB_SHORT_LABELS,
  suiteHref,
  tabFromPathname,
  type NavTab,
  type SuiteMode,
} from '../../lib/suite-routes';

export type { NavTab } from '../../lib/suite-routes';

const TAB_ICONS: Record<NavTab, LucideIcon> = {
  DASHBOARD: Home,
  SPATIAL: Calendar,
  INBOX: MessageSquare,
  BILLING: FileText,
  TRIAGE: BarChart2,
  SETTINGS: Settings,
};

function useActiveTab(): NavTab | null {
  return tabFromPathname(usePathname() ?? '');
}

/** Left dock: expanded with labels >=1024px, icon-only 768–1023px, hidden <768px (BottomNav takes over). */
export function NavigationDock({ suiteMode, footer }: { suiteMode: SuiteMode; footer?: React.ReactNode }) {
  const active = useActiveTab();
  return (
    <nav className="gp-dock" aria-label="Primary">
      <div>
        <Link href={suiteHref(suiteMode, 'DASHBOARD')} className="gp-dock-logo" aria-label="GetPhysical home">
          <span className="gp-dock-logo-mark" aria-hidden="true">
            GP
          </span>
          <span className="gp-dock-logo-text">Web OS</span>
        </Link>
        <ul className="gp-dock-nav">
          {NAV_TABS.map((tab) => {
            const Icon = TAB_ICONS[tab];
            const isActive = active === tab;
            return (
              <li key={tab}>
                <Link
                  href={suiteHref(suiteMode, tab)}
                  className="gp-dock-link"
                  aria-current={isActive ? 'page' : undefined}
                  title={TAB_LABELS[tab]}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                  <span className="gp-dock-link-label">{TAB_LABELS[tab]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {footer && <div className="gp-dock-footer">{footer}</div>}
    </nav>
  );
}

/** Bottom tab bar for phones (<768px). */
export function BottomNav({ suiteMode }: { suiteMode: SuiteMode }) {
  const active = useActiveTab();
  return (
    <nav aria-label="Primary (compact)">
      <ul className="gp-bottom-nav">
        {NAV_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab];
          const isActive = active === tab;
          return (
            <li key={tab}>
              <Link
                href={suiteHref(suiteMode, tab)}
                className="gp-bottom-link"
                aria-current={isActive ? 'page' : undefined}
                aria-label={TAB_LABELS[tab]}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                <span aria-hidden="true">{TAB_SHORT_LABELS[tab]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
