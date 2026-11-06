'use client';

import React, { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { TIMEFRAMES, type TimeframeId } from '../../../lib/timeframes';

/** Writes the selected range to ?range= so the dashboard view is bookmarkable. */
export function TimeframeSelect({ value }: { value: TimeframeId }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ position: 'relative' }}>
      <label htmlFor="gp-timeframe" className="gp-sr-only">
        Reporting period
      </label>
      <select
        id="gp-timeframe"
        className="gp-select"
        value={value}
        aria-busy={pending}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams?.toString());
          params.set('range', e.target.value);
          startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
        }}
        style={{ appearance: 'none', padding: '8px 32px 8px 14px', fontSize: 13, fontWeight: 700, width: 'auto', opacity: pending ? 0.7 : 1 }}
      >
        {TIMEFRAMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        aria-hidden="true"
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--gp-text-muted)' }}
      />
    </div>
  );
}
