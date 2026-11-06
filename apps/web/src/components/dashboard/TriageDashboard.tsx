'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertOctagon, CheckCircle2, Sparkles, TrendingDown } from 'lucide-react';
import { createEmptyState, createSuccessState, type TenStateEnvelope } from 'sodia-core/states';
import { StateView, SuccessNotice } from '../ui/StateView';
import { INITIAL_AT_RISK, INITIAL_TRIAGE, type AtRiskMember, type TriageItem } from './triage-data';

function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return {
    toast,
    show: (msg: string) => {
      setToast(msg);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setToast(null), 4000);
    },
  };
}

/** Manager triage queue + predictive attrition CRM. */
export function TriageDashboard() {
  const [triage, setTriage] = useState<TriageItem[]>(INITIAL_TRIAGE);
  const [atRisk, setAtRisk] = useState<AtRiskMember[]>(INITIAL_AT_RISK);
  const { toast, show } = useToast();
  const pending = triage.filter((t) => !t.resolved).length;

  const queueState: TenStateEnvelope<readonly TriageItem[]> =
    triage.length === 0 ? createEmptyState('No incidents have been raised this shift.', 'Refresh') : createSuccessState<readonly TriageItem[]>(triage);
  const riskState: TenStateEnvelope<readonly AtRiskMember[]> =
    atRisk.length === 0 ? createEmptyState('No members are currently flagged as at-risk.', 'Refresh') : createSuccessState<readonly AtRiskMember[]>(atRisk);

  return (
    <div className="gp-grid-auto-wide">
      <section className="gp-card" aria-labelledby="gp-triage-title" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="gp-row-between">
          <h2 id="gp-triage-title" className="gp-row gp-section-title" style={{ fontSize: 18 }}>
            <AlertOctagon size={20} color="var(--gp-danger)" aria-hidden="true" /> Manager triage queue
          </h2>
          <span className={`gp-badge ${pending > 0 ? 'gp-badge-danger' : 'gp-badge-success'}`}>{pending > 0 ? `${pending} pending` : 'All clear'}</span>
        </div>
        {toast && <SuccessNotice>{toast}</SuccessNotice>}
        <StateView state={queueState} compact>
          {(items) => (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item) => (
                <li
                  key={item.id}
                  className="gp-subcard"
                  style={{ borderColor: item.resolved ? 'var(--gp-border-color)' : item.severity === 'HIGH' ? 'var(--gp-danger)' : 'var(--gp-warning)', opacity: item.resolved ? 0.7 : 1 }}
                >
                  <div className="gp-row-between" style={{ alignItems: 'flex-start', marginBottom: 6, flexWrap: 'nowrap' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800 }}>{item.title}</h3>
                    <span style={{ fontSize: 11, color: 'var(--gp-text-muted)', whiteSpace: 'nowrap' }}>{item.timestamp}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gp-text-secondary)', marginBottom: 10, lineHeight: 1.45 }}>{item.detail}</p>
                  <div className="gp-row-between">
                    <span className={`gp-badge ${item.severity === 'HIGH' ? 'gp-badge-danger' : 'gp-badge-warning'}`}>{item.severity} severity</span>
                    {item.resolved ? (
                      <span className="gp-row" style={{ fontSize: 12, fontWeight: 800, color: 'var(--gp-accent-green)', gap: 4 }}>
                        <CheckCircle2 size={14} aria-hidden="true" /> Resolved
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="gp-btn gp-btn-secondary gp-btn-sm"
                        onClick={() => {
                          setTriage((prev) => prev.map((t) => (t.id === item.id ? { ...t, resolved: true } : t)));
                          show('Incident resolved and logged to the audit trail.');
                        }}
                      >
                        Investigate & resolve
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </StateView>
      </section>

      <section className="gp-card" aria-labelledby="gp-attrition-title" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="gp-row-between">
          <h2 id="gp-attrition-title" className="gp-row gp-section-title" style={{ fontSize: 18 }}>
            <TrendingDown size={20} color="var(--gp-warning)" aria-hidden="true" /> Predictive attrition CRM
          </h2>
          <span style={{ fontSize: 12, color: 'var(--gp-text-muted)' }}>Velocity-drop model</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--gp-text-muted)' }}>Flags members whose attendance velocity drops more than 60% before they cancel.</p>
        <StateView state={riskState} compact>
          {(members) => (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {members.map((m) => (
                <li key={m.id} className="gp-subcard">
                  <div className="gp-row-between" style={{ marginBottom: 8, flexWrap: 'nowrap' }}>
                    <div className="gp-row" style={{ gap: 10, minWidth: 0 }}>
                      <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(59,130,246,0.14)', color: 'var(--gp-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                        {m.avatar}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</h3>
                        <p style={{ fontSize: 12, color: 'var(--gp-text-muted)' }}>
                          {m.plan} • Last visit: {m.lastVisit}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: m.riskScore > 85 ? 'var(--gp-danger)' : 'var(--gp-warning)' }}>{m.riskScore}%</div>
                      <div style={{ fontSize: 11, color: 'var(--gp-text-muted)', textTransform: 'uppercase' }}>Churn risk</div>
                    </div>
                  </div>
                  <div className="gp-row-between" style={{ backgroundColor: 'var(--gp-bg-card)', borderRadius: 8, padding: '6px 10px' }}>
                    <span style={{ fontSize: 12, color: 'var(--gp-danger)' }}>Drop: {m.attendanceDrop}</span>
                    {m.offerSent ? (
                      <span style={{ fontSize: 12, color: 'var(--gp-accent-green)', fontWeight: 800 }}>Win-back perk active</span>
                    ) : (
                      <button
                        type="button"
                        className="gp-btn gp-btn-primary gp-btn-sm"
                        onClick={() => {
                          setAtRisk((prev) => prev.map((x) => (x.id === m.id ? { ...x, offerSent: true } : x)));
                          show(`Win-back perk (recovery session + shake) sent to ${m.name}'s VIP wallet.`);
                        }}
                      >
                        <Sparkles size={12} aria-hidden="true" /> Send win-back offer
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </StateView>
      </section>
    </div>
  );
}
