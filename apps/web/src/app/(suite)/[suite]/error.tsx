'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createCorrelationCode, createErrorState } from 'sodia-core/states';
import { StateView } from '../../../components/ui/StateView';
import { DEFAULT_SUITE, suiteFromPathname, suiteHref } from '../../../lib/suite-routes';

/** Route-segment error boundary: friendly copy, correlation code for support, Retry via reset(). */
export default function SuiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname() ?? '';
  const [code] = useState(() => (error.digest ? `GP-500-${error.digest.slice(0, 6).toUpperCase()}` : createCorrelationCode('GP-500')));

  useEffect(() => {
    console.error(`[${code}]`, error);
  }, [code, error]);

  const state = createErrorState<null>(code, 'This view failed to load. Your data is safe — try again, or quote the reference below to support.', true);

  return (
    <div className="gp-card">
      <StateView state={state} onRetry={reset} />
      <div style={{ textAlign: 'center', marginTop: -8, paddingBottom: 12 }}>
        <Link href={suiteHref(suiteFromPathname(pathname) ?? DEFAULT_SUITE, 'DASHBOARD')} className="gp-btn gp-btn-ghost gp-btn-sm">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
