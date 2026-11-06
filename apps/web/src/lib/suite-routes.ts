/**
 * Single source of truth for the Web OS URL scheme.
 *   /{suite}/{tab}   e.g. /gymdash/dashboard, /clubdash/spatial
 * Plain module (no "use client") so both Server and Client Components can import it.
 */

export type SuiteMode = 'GYMDASH' | 'CLUBDASH' | 'COACHDASH' | 'ORGANIZERDASH';
export type NavTab = 'DASHBOARD' | 'SPATIAL' | 'INBOX' | 'BILLING' | 'TRIAGE' | 'SETTINGS';

export const SUITE_MODES: readonly SuiteMode[] = ['GYMDASH', 'CLUBDASH', 'COACHDASH', 'ORGANIZERDASH'];
export const NAV_TABS: readonly NavTab[] = ['DASHBOARD', 'SPATIAL', 'INBOX', 'BILLING', 'TRIAGE', 'SETTINGS'];

export const DEFAULT_SUITE: SuiteMode = 'GYMDASH';
export const DEFAULT_TAB: NavTab = 'DASHBOARD';

export const SUITE_LABELS: Record<SuiteMode, string> = {
  GYMDASH: 'GymDash',
  CLUBDASH: 'Clubdash',
  COACHDASH: 'CoachDash',
  ORGANIZERDASH: 'OrganizerDash',
};

export const TAB_LABELS: Record<NavTab, string> = {
  DASHBOARD: 'Dashboard',
  SPATIAL: 'Spatial Schedule',
  INBOX: 'Athletic Inbox & CRM',
  BILLING: 'Front Desk & Ledgers',
  TRIAGE: 'Turnstile & Triage',
  SETTINGS: 'Facility Settings',
};

/** Short labels used by the compact bottom navigation bar (<768px). */
export const TAB_SHORT_LABELS: Record<NavTab, string> = {
  DASHBOARD: 'Home',
  SPATIAL: 'Schedule',
  INBOX: 'Inbox',
  BILLING: 'Desk',
  TRIAGE: 'Triage',
  SETTINGS: 'Settings',
};

export function suiteToSlug(mode: SuiteMode): string {
  return mode.toLowerCase();
}

export function tabToSlug(tab: NavTab): string {
  return tab.toLowerCase();
}

export function parseSuiteSlug(slug: string): SuiteMode | null {
  const upper = slug.toUpperCase();
  return SUITE_MODES.find((m) => m === upper) ?? null;
}

export function parseTabSlug(slug: string): NavTab | null {
  const upper = slug.toUpperCase();
  return NAV_TABS.find((t) => t === upper) ?? null;
}

export function suiteHref(mode: SuiteMode, tab: NavTab = DEFAULT_TAB): string {
  return `/${suiteToSlug(mode)}/${tabToSlug(tab)}`;
}

/** Extracts the active tab from a pathname like /clubdash/inbox. */
export function tabFromPathname(pathname: string): NavTab | null {
  const segment = pathname.split('/').filter(Boolean)[1];
  return segment ? parseTabSlug(segment) : null;
}

export function suiteFromPathname(pathname: string): SuiteMode | null {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment ? parseSuiteSlug(segment) : null;
}

/** Which suites expose the cashier float gate in the header. */
export function suiteHasFloatGate(mode: SuiteMode): boolean {
  return mode === 'GYMDASH' || mode === 'CLUBDASH';
}
