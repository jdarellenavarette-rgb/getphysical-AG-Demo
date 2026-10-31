'use client';

import React, { useState } from 'react';
import { KeyRound, Coins, ShieldCheck, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

export interface ShiftSession {
  staffId: string;
  staffName: string;
  openedAt: string;
  openingFloat: number;
  isOpen: boolean;
}

interface FloatGateModalProps {
  currentShift: ShiftSession | null;
  onOpenShift: (staffPin: string, openingFloat: number) => { success: boolean; message: string };
  onCloseShift: (countedCash: number) => { variance: number; flagged: boolean };
  onDismiss: () => void;
}

export function FloatGateModal({
  currentShift,
  onOpenShift,
  onCloseShift,
  onDismiss,
}: FloatGateModalProps) {
  const [pin, setPin] = useState('');
  const [openingCash, setOpeningCash] = useState('2500');
  const [closingCash, setClosingCash] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [varianceResult, setVarianceResult] = useState<{ variance: number; flagged: boolean } | null>(null);

  const handleOpen = () => {
    if (pin.length < 4) {
      setErrorMsg('Please enter a valid 4-digit staff PIN.');
      return;
    }
    const floatAmount = parseFloat(openingCash);
    if (isNaN(floatAmount) || floatAmount < 0) {
      setErrorMsg('Invalid float amount.');
      return;
    }
    const res = onOpenShift(pin, floatAmount);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setErrorMsg(null);
      onDismiss();
    }
  };

  const handleClose = () => {
    const counted = parseFloat(closingCash);
    if (isNaN(counted) || counted < 0) {
      setErrorMsg('Enter the actual counted physical cash in drawer.');
      return;
    }
    const res = onCloseShift(counted);
    setVarianceResult(res);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '14px',
        width: '460px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            backgroundColor: currentShift?.isOpen ? '#3b82f620' : '#10b98120',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {currentShift?.isOpen ? <Lock size={20} color="#3b82f6" /> : <Coins size={20} color="#10b981" />}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f9fafb' }}>
              {currentShift?.isOpen ? 'Shift End Blind Count' : 'The Register Float Gate'}
            </h3>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              {currentShift?.isOpen ? 'Dual-control blind cash count reconciliation' : 'Mandatory shift-start opening cash declaration'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#ef444420', border: '1px solid #ef444440', borderRadius: '8px', padding: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#ef4444" />
            <span style={{ fontSize: '13px', color: '#fca5a5' }}>{errorMsg}</span>
          </div>
        )}

        {!currentShift?.isOpen ? (
          /* Shift Open Flow */
          <div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Staff Authorization PIN</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter 4-digit PIN (e.g. 1234)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  style={{
                    width: '100%', backgroundColor: '#1f2937', border: '1px solid #374151',
                    borderRadius: '8px', padding: '10px 12px 10px 36px', color: '#f3f4f6', fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Opening Drawer Float (₱)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#10b981', fontWeight: 700 }}>₱</span>
                <input
                  type="number"
                  placeholder="2500"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  style={{
                    width: '100%', backgroundColor: '#1f2937', border: '1px solid #374151',
                    borderRadius: '8px', padding: '10px 12px 10px 30px', color: '#f3f4f6', fontSize: '14px', fontWeight: 600
                  }}
                />
              </div>
              <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Spec rule: POS & Turnstiles lock until float declaration is signed.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onDismiss} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#374151', color: '#d1d5db', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleOpen} style={{ flex: 2, padding: '10px', borderRadius: '8px', backgroundColor: '#10b981', color: '#000', fontSize: '13px', fontWeight: 700 }}>Unlock Register & Begin Shift</button>
            </div>
          </div>
        ) : varianceResult ? (
          /* Variance Result Card */
          <div>
            <div style={{
              backgroundColor: varianceResult.flagged ? '#ef444420' : '#10b98120',
              border: `1px solid ${varianceResult.flagged ? '#ef444450' : '#10b98150'}`,
              borderRadius: '10px', padding: '16px', marginBottom: '16px', textAlign: 'center'
            }}>
              {varianceResult.flagged ? <AlertTriangle size={32} color="#ef4444" style={{ margin: '0 auto 8px' }} /> : <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />}
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: varianceResult.flagged ? '#f87171' : '#34d399' }}>
                {varianceResult.flagged ? 'Variance Detected' : 'Perfect Drawer Reconciliation'}
              </h4>
              <p style={{ fontSize: '13px', color: '#d1d5db', marginTop: '4px' }}>
                Cash Variance: <strong style={{ color: varianceResult.variance === 0 ? '#10b981' : varianceResult.variance < 0 ? '#ef4444' : '#f59e0b' }}>
                  {varianceResult.variance >= 0 ? `+₱${varianceResult.variance.toFixed(2)}` : `-₱${Math.abs(varianceResult.variance).toFixed(2)}`}
                </strong>
              </p>
              {varianceResult.flagged && (
                <p style={{ fontSize: '11px', color: '#fca5a5', marginTop: '6px' }}>Discrepancy has been dispatched to Manager Triage Queue for investigation.</p>
              )}
            </div>
            <button onClick={onDismiss} style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#fff', fontSize: '13px', fontWeight: 700 }}>Close Drawer & Log Out</button>
          </div>
        ) : (
          /* Shift End Blind Count Input */
          <div>
            <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                <span>Active Shift:</span>
                <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{currentShift.staffName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
                <span>Opening Float Declared:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>₱{currentShift.openingFloat.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Counted Physical Drawer Cash (₱)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#3b82f6', fontWeight: 700 }}>₱</span>
                <input
                  type="number"
                  placeholder="Enter exact count without system hint"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  style={{
                    width: '100%', backgroundColor: '#1f2937', border: '1px solid #374151',
                    borderRadius: '8px', padding: '10px 12px 10px 30px', color: '#f3f4f6', fontSize: '14px', fontWeight: 600
                  }}
                />
              </div>
              <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Blind Rule: System expected totals are intentionally hidden to prevent skim coverups.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onDismiss} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#374151', color: '#d1d5db', fontSize: '13px', fontWeight: 600 }}>Resume Shift</button>
              <button onClick={handleClose} style={{ flex: 2, padding: '10px', borderRadius: '8px', backgroundColor: '#f59e0b', color: '#000', fontSize: '13px', fontWeight: 700 }}>Submit Blind Count & Reconcile</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
