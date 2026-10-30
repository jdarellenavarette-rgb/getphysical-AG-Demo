import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import { Sparkles, X, Play, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

interface MasterTestbenchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasterTestbenchDrawer: React.FC<MasterTestbenchDrawerProps> = ({ isOpen, onClose }) => {
  const { runMasterFlowchartDeepDive, showToast } = useEcosystem();
  const [filterCategory, setFilterCategory] = useState<string>('All');

  if (!isOpen) return null;

  const scenarios = [
    { num: 1, title: 'Auth Landing & SMS OTP auto-advance', cat: 'Auth' },
    { num: 2, title: 'Sodia Feed "Drop In" pill ➔ Universal Checkout', cat: 'B2C' },
    { num: 3, title: 'Discover Mapbox search ➔ Facility Pin Sheet', cat: 'B2C' },
    { num: 4, title: 'VIP Card 180° Flip ➔ 60s Ticking QR Hash', cat: 'B2C' },
    { num: 5, title: 'Lift Tracker Active Grid ➔ Rest Timer ➔ Stamp', cat: 'Track' },
    { num: 6, title: 'Move Court Mode ➔ 11-8 Score ➔ Rivalry Match Verification', cat: 'Track' },
    { num: 7, title: 'Food Tracker NLP "2 boiled eggs and 1 cup rice"', cat: 'Track' },
    { num: 9, title: 'Staff DTR Selfie Clock-in & Float Gate PIN', cat: 'GymDash' },
    { num: 10, title: 'CoachDash Triage ➔ 3-Day Negative Delta Auto-Nudge', cat: 'CoachDash' },
    { num: 11, title: 'Waitlist Sniper Engine ➔ Pre-Auth Hold Auto-Capture', cat: 'B2B2C' },
    { num: 12, title: 'Squatter Detection Alert (14 scans for 10-person booking)', cat: 'GymDash' },
    { num: 13, title: 'Tracker Stamp Compositing & 24h Sodia Story', cat: 'B2C' },
    { num: 14, title: 'Predictive Attrition CRM ➔ 20% Discount Win-Back', cat: 'GymDash' },
    { num: 15, title: 'Account Deletion Hard-Block (Active Sub Found)', cat: 'Safety' },
    { num: 17, title: 'Offline Ledger Sync Protocol ➔ 6-Digit TOTP Fallback', cat: 'Offline' },
    { num: 18, title: 'B2B2C Floor Fee Split ➔ Dual-Auth Turnstile BLUE', cat: 'CoachDash' },
    { num: 21, title: 'Organizer Pro Mobile Funnel Builder ➔ Scarcity Surge', cat: 'Clubdash' },
    { num: 22, title: 'Spatial Sub-Division ➔ Child Court Locks Parent Gymnasium', cat: 'Clubdash' },
    { num: 23, title: 'Universal Bracket Engine ➔ Score Finalize ➔ Split Payout', cat: 'Clubdash' },
    { num: 25, title: 'GDPR vs Immutable Ledger Anonymization Protocol', cat: 'Safety' },
    { num: 26, title: 'Cancelling Tournament ➔ Cascading Split-Clawback', cat: 'Clubdash' },
    { num: 30, title: 'Mixed Cart Conflict ➔ Pay via App Disabled', cat: 'GymDash' },
    { num: 31, title: 'SKU Immutability Guardrail ➔ Monthly Sub V2', cat: 'GymDash' },
    { num: 33, title: 'B2B Staff Handshake Card ➔ POS PIN 1234 Issued', cat: 'GymDash' },
    { num: 34, title: 'CoachDash Macrocycle Injection ➔ Sodia planned_track', cat: 'CoachDash' }
  ];

  const categories = ['All', 'B2C', 'Track', 'GymDash', 'Clubdash', 'CoachDash', 'B2B2C', 'Safety'];

  const filtered = filterCategory === 'All'
    ? scenarios
    : scenarios.filter(s => s.cat === filterCategory);

  const handleRun = (diveNum: number) => {
    runMasterFlowchartDeepDive(diveNum);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
      <div className="flex h-full max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 border-zinc-100 bg-zinc-950 text-white">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-black">Master Flowchart Testbench</h3>
              <p className="text-[10px] text-zinc-400">Trigger all 34 Deep Dive edge cases</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-zinc-800 p-1.5 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto p-3 border-b border-zinc-100 no-scrollbar bg-zinc-50">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all shrink-0 ${
                filterCategory === cat
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scenarios List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.map(sc => (
            <div
              key={sc.num}
              onClick={() => handleRun(sc.num)}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-3 hover:border-purple-500 hover:bg-purple-50/30 cursor-pointer transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-900 font-mono text-xs font-black text-white shrink-0 group-hover:bg-purple-600 transition-colors">
                  #{sc.num}
                </span>
                <div>
                  <div className="text-xs font-black text-zinc-900 group-hover:text-purple-950">
                    {sc.title}
                  </div>
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500 uppercase">
                    {sc.cat}
                  </span>
                </div>
              </div>

              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Play className="h-3 w-3 fill-current ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
