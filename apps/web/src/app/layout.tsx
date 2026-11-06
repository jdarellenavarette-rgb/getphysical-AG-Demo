import type { Metadata, Viewport } from 'next';
import { DARK_PALETTE, LIGHT_PALETTE } from 'sodia-core/design-tokens';
import { THEME_BOOT_SCRIPT, buildThemeCss } from '../lib/theme-css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'GetPhysical Web OS',
    template: '%s · GetPhysical Web OS',
  },
  description: 'GymDash, Clubdash, CoachDash and OrganizerDash: front desk, scheduling, CRM and triage for GetPhysical partners.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: LIGHT_PALETTE.bgHeader },
    { media: '(prefers-color-scheme: dark)', color: DARK_PALETTE.bgHeader },
  ],
};

const THEME_CSS = buildThemeCss();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme is set pre-paint by THEME_BOOT_SCRIPT, so <html> attributes legitimately differ from the server render.
    <html lang="en" suppressHydrationWarning>
      <head>
        <style id="gp-theme-tokens" dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
