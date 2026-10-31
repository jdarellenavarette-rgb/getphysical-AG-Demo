'use client';

import React, { useState } from 'react';
import { AlertOctagon, TrendingDown, Send, CheckCircle2, UserX, ShieldAlert, Sparkles } from 'lucide-react';

interface TriageItem {
  id: string;
  type: 'CASH_VARIANCE' | 'SQUATTER_BREACH' | 'OVERRIDE';
  title: string;
  detail: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  resolved: boolean;
}

interface AtRiskMember {
  id: string;
  name: string;
  avatar: string;
  riskScore: number;
  lastVisit: string;
  attendanceDrop: string;
  plan: string;
  offerSent: boolean;
}

const INITIAL_TRIAGE: TriageItem[] = [
  {
    id: 't1',
    type: 'CASH_VARIANCE',
    title: 'Register 01 Shift Blind Count Discrepancy',
    detail: 'Staff Jane D. reported ₱3,180. Expected drawer cash was ₱3,300 (-₱120.00 shortage).',
    severity: 'HIGH',
    timestamp: '14 mins ago',
    resolved: false,
  },
  {
    id: 't2',
    type: 'SQUATTER_BREACH',
    title: 'Repeated Turnstile Tailgating Flag',
    detail: 'Gate 02 camera optical sensor detected 2 bodies passing on single pass scan.',
    severity: 'HIGH',
    timestamp: '32 mins ago',
    resolved: false,
  },
  {
    id: 't3',
    type: 'OVERRIDE',
    title: 'Remote Turnstile Gate Override',
    detail: 'Front Desk staff unlocked turnstile manually for Guest Pass with missing phone verification.',
    severity: 'MEDIUM',
    timestamp: '1 hr ago',
    resolved: false,
  },
];

const INITIAL_AT_RISK: AtRiskMember[] = [
  {
    id: 'm1',
    name: 'Carlos Mendoza',
    avatar: 'CM',
    riskScore: 92,
    lastVisit: '14 days ago',
    attendanceDrop: '4x/wk → 0 visits',
    plan: 'Nexus VIP Annual',
    offerSent: false,
  },
  {
    id: 'm2',
    name: 'Patricia Lim',
    avatar: 'PL',
    riskScore: 78,
    lastVisit: '9 days ago',
    attendanceDrop: '3x/wk → 1 visit/mo',
    plan: 'Monthly All-Access',
    offerSent: false,
  },
  {
    id: 'm3',
    name: 'Dave Bautista',
    avatar: 'DB',
    riskScore: 65,
    lastVisit: '8 days ago',
    attendanceDrop: '5x/wk → 1 visit/wk',
    plan: 'CrossFit Unlimited',
    offerSent: false,
  },
];

export function TriageDashboard() {
  const [triage, setTriage] = useState<TriageItem[]>(INITIAL_TRIAGE);
  const [atRisk, setAtRisk] = useState<AtRiskMember[]>(INITIAL_AT_RISK);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const resolveTriage = (id: string) => {
    setTriage((prev) => prev.map((t) => (t.id === id ? { ...t, resolved: true } : t)));
    setActiveToast('Triage incident resolved and logged to audit trail.');
    setTimeout(() => setActiveToast(null), 3000);
  };

  const sendWinBackOffer = (id: string, name: string) => {
    setAtRisk((prev) => prev.map((m) => (m.id === id ? { ...m, offerSent: true } : m)));
    setActiveToast(`Win-back perk (Complimentary 1-on-1 Recovery + Whey Shake) dispatched to ${name}'s VIP Wallet.`);
    setTimeout(() => setActiveToast(null), 4000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
      {/* LEFT: Needs Attention Triage Queue */}
      <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOctagon size={20} color="#ef4444" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f9fafb' }}>Manager Triage Queue</h2>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ef444420', color: '#f87171' }}>
            {triage.filter((t) => !t.resolved).length} Pending Actions
          </span>
        </div>

        {activeToast && (
          <div style={{ backgroundColor: '#10b98120', border: '1px solid #10b981', borderRadius: '8px', padding: '10px', marginBottom: '14px', fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {activeToast}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {triage.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: item.resolved ? '#1e293b40' : '#1e293b',
                border: `1px solid ${item.resolved ? '#334155' : item.severity === 'HIGH' ? '#ef444450' : '#f59e0b50'}`,
                borderRadius: '10px', padding: '14px', opacity: item.resolved ? 0.6 : 1, transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>{item.title}</span>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>{item.timestamp}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px', lineHeight: 1.4 }}>{item.detail}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: item.severity === 'HIGH' ? '#ef444420' : '#f59e0b20', color: item.severity === 'HIGH' ? '#ef4444' : '#f59e0b' }}>
                  {item.severity} SEVERITY
                </span>
                {!item.resolved ? (
                  <button onClick={() => resolveTriage(item.id)} style={{ backgroundColor: '#374151', color: '#f9fafb', fontSize: '11px', fontWeight: 700, padding: '6px 12px', borderRadius: '6px' }}>Investigate & Resolve</button>
                ) : (
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>✓ Resolved</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Predictive Attrition CRM */}
      <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingDown size={20} color="#f59e0b" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f9fafb' }}>Predictive Attrition CRM</h2>
          </div>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>AI Velocity Drop Model</span>
        </div>

        <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '14px' }}>
          Spec 4.2: Flags members with attendance velocity drop &gt;60% before cancellation happens.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {atRisk.map((member) => (
            <div key={member.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '17px', backgroundColor: '#3b82f630', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                    {member.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{member.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{member.plan} • Last visit: {member.lastVisit}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: member.riskScore > 85 ? '#ef4444' : '#f59e0b', fontFamily: 'monospace' }}>
                    {member.riskScore}%
                  </div>
                  <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>Churn Risk</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: '6px', padding: '6px 10px', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#f87171' }}>Drop: {member.attendanceDrop}</span>
                {member.offerSent ? (
                  <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>✓ Win-Back Perk Active</span>
                ) : (
                  <button
                    onClick={() => sendWinBackOffer(member.id, member.name)}
                    style={{ backgroundColor: '#8b5cf6', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Sparkles size={12} /> 1-Tap Win-Back Offer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
