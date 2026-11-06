'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Coins, KeyRound, Lock } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { FormField } from '../ui/FormField';
import { blindCountSchema, openShiftSchema } from '../../lib/schemas/shift';
import { firstFieldErrors, type FieldErrors } from '../../lib/schemas/field-errors';

export interface ShiftSession {
  staffId: string;
  staffName: string;
  openedAt: string;
  openingFloat: number;
  isOpen: boolean;
}

interface FloatGateModalProps {
  open: boolean;
  currentShift: ShiftSession | null;
  onOpenShift: (staffPin: string, openingFloat: number) => { success: boolean; message: string };
  onCloseShift: (countedCash: number) => { variance: number; flagged: boolean };
  onDismiss: () => void;
}

type OpenField = 'pin' | 'openingFloat';
type CloseField = 'countedCash';

function formatPeso(n: number): string {
  return `₱${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Shift-start float declaration and shift-end blind count (dual-control cash reconciliation). */
export function FloatGateModal({ open, currentShift, onOpenShift, onCloseShift, onDismiss }: FloatGateModalProps) {
  const [pin, setPin] = useState('');
  const [openingCash, setOpeningCash] = useState('2500');
  const [closingCash, setClosingCash] = useState('');
  const [openErrors, setOpenErrors] = useState<FieldErrors<OpenField>>({});
  const [closeErrors, setCloseErrors] = useState<FieldErrors<CloseField>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [varianceResult, setVarianceResult] = useState<{ variance: number; flagged: boolean } | null>(null);

  useEffect(() => {
    if (!open) return;
    setPin('');
    setClosingCash('');
    setOpenErrors({});
    setCloseErrors({});
    setAuthError(null);
    setVarianceResult(null);
  }, [open]);

  const shiftOpen = currentShift?.isOpen ?? false;

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = openShiftSchema.safeParse({ pin, openingFloat: openingCash });
    if (!parsed.success) {
      setOpenErrors(firstFieldErrors<OpenField>(parsed.error));
      return;
    }
    setOpenErrors({});
    const res = onOpenShift(parsed.data.pin, parsed.data.openingFloat);
    if (!res.success) {
      setAuthError(res.message);
      setOpenErrors({ pin: 'PIN not accepted.' });
      return;
    }
    onDismiss();
  };

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = blindCountSchema.safeParse({ countedCash: closingCash });
    if (!parsed.success) {
      setCloseErrors(firstFieldErrors<CloseField>(parsed.error));
      return;
    }
    setCloseErrors({});
    setVarianceResult(onCloseShift(parsed.data.countedCash));
  };

  const icon = (
    <span
      aria-hidden="true"
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: shiftOpen ? 'rgba(59,130,246,0.12)' : 'var(--gp-accent-green-muted)',
        color: shiftOpen ? 'var(--gp-info)' : 'var(--gp-accent-green)',
      }}
    >
      {shiftOpen ? <Lock size={20} /> : <Coins size={20} />}
    </span>
  );

  return (
    <Dialog
      open={open}
      onClose={onDismiss}
      maxWidth={460}
      icon={icon}
      title={varianceResult ? 'Drawer reconciled' : shiftOpen ? 'Shift end blind count' : 'Register float gate'}
      description={shiftOpen ? 'Dual-control blind cash count reconciliation' : 'Mandatory shift-start opening cash declaration'}
    >
      {varianceResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className={`gp-notice ${varianceResult.flagged ? 'gp-notice-danger' : 'gp-notice-success'}`} role="status" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {varianceResult.flagged ? <AlertTriangle size={30} aria-hidden="true" /> : <CheckCircle2 size={30} aria-hidden="true" />}
            <strong style={{ fontSize: 16 }}>{varianceResult.flagged ? 'Variance detected' : 'Perfect drawer reconciliation'}</strong>
            <span>
              Cash variance: {varianceResult.variance < 0 ? '−' : '+'}
              {formatPeso(varianceResult.variance)}
            </span>
            {varianceResult.flagged && <span style={{ fontSize: 12 }}>The discrepancy was sent to the Manager Triage queue.</span>}
          </div>
          <button type="button" className="gp-btn gp-btn-primary" onClick={onDismiss} data-autofocus>
            Close drawer & log out
          </button>
        </div>
      ) : !shiftOpen ? (
        <form noValidate onSubmit={handleOpen} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {authError && (
            <div className="gp-notice gp-notice-danger" role="alert">
              <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}
          <FormField label="Staff authorization PIN" error={openErrors.pin} hint="4–6 digits. Demo PIN: 1234.">
            {(props) => (
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} aria-hidden="true" style={{ position: 'absolute', left: 12, top: 13, color: 'var(--gp-text-muted)' }} />
                <input
                  {...props}
                  className="gp-input"
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setAuthError(null);
                    if (openErrors.pin) setOpenErrors((p) => ({ ...p, pin: undefined }));
                  }}
                  style={{ paddingLeft: 36 }}
                  data-autofocus
                />
              </div>
            )}
          </FormField>
          <FormField label="Opening drawer float (₱)" error={openErrors.openingFloat} hint="POS & turnstiles stay locked until the float is declared.">
            {(props) => (
              <input
                {...props}
                className="gp-input"
                type="text"
                inputMode="decimal"
                value={openingCash}
                onChange={(e) => {
                  setOpeningCash(e.target.value);
                  if (openErrors.openingFloat) setOpenErrors((p) => ({ ...p, openingFloat: undefined }));
                }}
              />
            )}
          </FormField>
          <div className="gp-row" style={{ gap: 10 }}>
            <button type="button" className="gp-btn gp-btn-secondary" style={{ flex: 1 }} onClick={onDismiss}>
              Cancel
            </button>
            <button type="submit" className="gp-btn gp-btn-success" style={{ flex: 2 }}>
              Unlock register & begin shift
            </button>
          </div>
        </form>
      ) : (
        <form noValidate onSubmit={handleClose} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <dl className="gp-subcard" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, fontSize: 13 }}>
            <dt style={{ color: 'var(--gp-text-muted)' }}>Active shift</dt>
            <dd style={{ fontWeight: 700 }}>{currentShift?.staffName}</dd>
            <dt style={{ color: 'var(--gp-text-muted)' }}>Opening float declared</dt>
            <dd style={{ fontWeight: 700, color: 'var(--gp-accent-green)' }}>₱{currentShift?.openingFloat.toLocaleString()}</dd>
          </dl>
          <FormField label="Counted physical drawer cash (₱)" error={closeErrors.countedCash} hint="Blind rule: expected totals are hidden to prevent skim cover-ups.">
            {(props) => (
              <input
                {...props}
                className="gp-input"
                type="text"
                inputMode="decimal"
                value={closingCash}
                placeholder="Exact count, e.g. 3320.00"
                onChange={(e) => {
                  setClosingCash(e.target.value);
                  if (closeErrors.countedCash) setCloseErrors({});
                }}
                data-autofocus
              />
            )}
          </FormField>
          <div className="gp-row" style={{ gap: 10 }}>
            <button type="button" className="gp-btn gp-btn-secondary" style={{ flex: 1 }} onClick={onDismiss}>
              Resume shift
            </button>
            <button type="submit" className="gp-btn gp-btn-primary" style={{ flex: 2 }}>
              Submit blind count
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
