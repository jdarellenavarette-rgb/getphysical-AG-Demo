'use client';

import React, { useState } from 'react';
import { createCorrelationCode } from 'sodia-core/states';

/** Last-resort boundary when the root layout itself fails (renders its own <html>). */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [code] = useState(() => (error.digest ? `GP-500-${error.digest.slice(0, 6).toUpperCase()}` : createCorrelationCode('GP-500')));
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0, background: '#F4F4F5', color: '#09090B' }}>
        <div role="alert" style={{ textAlign: 'center', maxWidth: 420, padding: 24 }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>GetPhysical Web OS hit an unexpected error</h1>
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 6 }}>Reload to try again. If it keeps happening, share this reference with support:</p>
          <p style={{ fontFamily: 'monospace', fontSize: 13, marginBottom: 16 }}>{code}</p>
          <button type="button" onClick={reset} style={{ padding: '10px 18px', borderRadius: 10, background: '#E11D48', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
