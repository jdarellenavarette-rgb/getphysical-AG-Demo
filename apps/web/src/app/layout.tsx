import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GymDash / Clubdash Web OS | GetPhysical B2B Engine',
  description: 'Enterprise turnstile scanner, bifurcated POS, spatial scheduling & triage CRM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </body>
    </html>
  );
}
