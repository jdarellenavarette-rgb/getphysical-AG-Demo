'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SuiteThemeProvider } from '../suite/theme';
import { FloatGateModal, type ShiftSession } from '../daily-dash/FloatGateModal';
import type { SuiteMode } from '../../lib/suite-routes';

export type Branch = 'BGC' | 'MAKATI' | 'PASIG';
export const BRANCHES: readonly { id: Branch; label: string }[] = [
  { id: 'BGC', label: 'BGC High Street Arena' },
  { id: 'MAKATI', label: 'Makati West Complex' },
  { id: 'PASIG', label: 'Pasig Padel & Courts' },
];

/** Demo authorisation PIN for the seeded manager account. */
const DEMO_MANAGER_PIN = '1234';
/** Cash sales recorded by the till since the shift opened (from the POS ledger). */
const RECORDED_CASH_SALES_PHP = 820;

interface SuiteSessionValue {
  suiteMode: SuiteMode;
  branch: Branch;
  setBranch: (b: Branch) => void;
  shift: ShiftSession | null;
  openFloatGate: () => void;
  explainerOpen: boolean;
  toggleExplainer: () => void;
}

const SuiteSessionContext = createContext<SuiteSessionValue | null>(null);

export function useSuiteSession(): SuiteSessionValue {
  const ctx = useContext(SuiteSessionContext);
  if (!ctx) throw new Error('useSuiteSession must be used inside <SuiteProviders>');
  return ctx;
}

/**
 * Client boundary for state that must survive route changes inside a suite:
 * theme, branch, cashier shift float and the architecture explainer.
 * Children (route pages) remain Server Components.
 */
export function SuiteProviders({ suiteMode, children }: { suiteMode: SuiteMode; children: React.ReactNode }) {
  const [branch, setBranch] = useState<Branch>('BGC');
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [floatOpen, setFloatOpen] = useState(false);
  const [shift, setShift] = useState<ShiftSession | null>({
    staffId: 'st_882',
    staffName: 'Jane D. (Manager)',
    openedAt: '08:00 AM',
    openingFloat: 2500,
    isOpen: true,
  });

  const handleOpenShift = useCallback((pin: string, openingFloat: number) => {
    if (pin !== DEMO_MANAGER_PIN) {
      return { success: false, message: 'PIN not recognised for this branch. (Demo manager PIN: 1234)' };
    }
    setShift({
      staffId: 'st_882',
      staffName: 'Jane D. (Front Desk)',
      openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      openingFloat,
      isOpen: true,
    });
    return { success: true, message: 'Shift unlocked.' };
  }, []);

  const handleCloseShift = useCallback(
    (countedCash: number) => {
      const expected = (shift?.openingFloat ?? 0) + RECORDED_CASH_SALES_PHP;
      const variance = Math.round((countedCash - expected) * 100) / 100;
      setShift((prev) => (prev ? { ...prev, isOpen: false } : null));
      return { variance, flagged: variance !== 0 };
    },
    [shift?.openingFloat]
  );

  const value = useMemo<SuiteSessionValue>(
    () => ({
      suiteMode,
      branch,
      setBranch,
      shift,
      openFloatGate: () => setFloatOpen(true),
      explainerOpen,
      toggleExplainer: () => setExplainerOpen((v) => !v),
    }),
    [suiteMode, branch, shift, explainerOpen]
  );

  return (
    <SuiteThemeProvider>
      <SuiteSessionContext.Provider value={value}>
        {children}
        <FloatGateModal
          open={floatOpen}
          currentShift={shift}
          onOpenShift={handleOpenShift}
          onCloseShift={handleCloseShift}
          onDismiss={() => setFloatOpen(false)}
        />
      </SuiteSessionContext.Provider>
    </SuiteThemeProvider>
  );
}
