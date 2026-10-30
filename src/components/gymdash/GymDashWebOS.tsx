import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Flame,
  ArrowLeft,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  Send,
  Eye,
  Percent,
  Layers,
  Clock
} from 'lucide-react';

export const GymDashWebOS: React.FC = () => {
  const { setPortal, showToast } = useEcosystem();

  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly' | 'All-Time'>('Monthly');
  const [activeTab, setActiveTab] = useState<'growth' | 'triage' | 'crm' | 'yield' | 'import'>('growth');
  const [selectedDiscount, setSelectedDiscount] = useState<number>(20);

  const atRiskMembers = [
    { id: 'm1', name: 'Marco Perez', lastVisit: '16 days ago', expiry: 'in 4 days', plan: 'Monthly Pro', visitsPerMo: '1.2' },
    { id: 'm2', name: 'Alyssa Chen', lastVisit: '18 days ago', expiry: 'in 6 days', plan: 'Quarterly VIP', visitsPerMo: '2.0' },
    { id: 'm3', name: 'Ramon Diaz', lastVisit: '21 days ago', expiry: 'in 2 days', plan: 'Student Pass', visitsPerMo: '0.8' }
  ];

  const handleSendWinBack = (memberName: string) => {
    showToast(`📩 Win-Back Offer (${selectedDiscount}% OFF Renewal) injected into @${memberName}'s Sodia DM!`);
  };

  const handleDeployFlashSKU = () => {
    showToast('⚡ Flash Promo SKU deployed! "Tuesday Dead-Hour Pass" pushed to Sodia consumer discovery feed.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPortal('sodia')}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Consumer Sodia
          </button>
          <div className="h-4 w-px bg-zinc-700" />
          <div>
            <h1 className="text-sm font-black text-white">Twins Fitness BGC • Command OS</h1>
            <p className="text-[10px] text-zinc-400">Registry A Enterprise Management</p>
          </div>
        </div>

        {/* Global Timeframe Selector (Section 7) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-bold">Timeframe:</span>
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value as any)}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-black text-white focus:outline-hidden"
          >
            <option value="Daily">Daily (Today)</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="All-Time">All-Time (Valuation)</option>
          </select>
        </div>
      </header>

      {/* Sub-Nav Tabs */}
      <nav className="flex gap-2 border-b border-zinc-800 bg-zinc-900/50 px-6 py-2 text-xs font-bold overflow-x-auto no-scrollbar">
        {[
          { id: 'growth', label: 'Lifecycle Growth' },
          { id: 'triage', label: 'Needs Attention (Triage)' },
          { id: 'crm', label: 'Predictive Churn CRM' },
          { id: 'yield', label: 'Yield Heatmap & Skim Gap' },
          { id: 'import', label: 'Legacy CSV Wizard' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`rounded-xl px-3.5 py-1.5 transition-all ${
              activeTab === t.id
                ? 'bg-white text-zinc-950 font-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Main OS Viewport */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* 1. LIFECYCLE GROWTH EQUATION (Section 7) */}
        {activeTab === 'growth' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400">
                    The Member Lifecycle Equation ({timeframe})
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Mathematical proof of net growth across commercial memberships
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-400">
                  +10.0% MoM Net Growth
                </span>
              </div>

              {/* Net Equation Diagram Card: Start + New + Renew - Churn = End */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="rounded-2xl bg-zinc-800/80 p-4 border border-zinc-700">
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Start Active</div>
                  <div className="text-2xl font-black text-white mt-1">500</div>
                  <div className="text-[10px] text-zinc-500">Base count</div>
                </div>

                <div className="rounded-2xl bg-emerald-950/40 border border-emerald-700/50 p-4">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">New Signups</div>
                  <div className="text-2xl font-black text-emerald-300 mt-1">+60</div>
                  <div className="text-[10px] text-emerald-500">Sodia feed + Walkin</div>
                </div>

                <div className="rounded-2xl bg-blue-950/40 border border-blue-700/50 p-4">
                  <div className="text-[10px] uppercase font-bold text-blue-400">Renewals</div>
                  <div className="text-2xl font-black text-blue-300 mt-1">+30</div>
                  <div className="text-[10px] text-blue-500">Auto-recurring</div>
                </div>

                <div className="rounded-2xl bg-rose-950/40 border border-rose-700/50 p-4">
                  <div className="text-[10px] uppercase font-bold text-rose-400">Churned</div>
                  <div className="text-2xl font-black text-rose-300 mt-1">-40</div>
                  <div className="text-[10px] text-rose-500">Non-renewed</div>
                </div>

                <div className="col-span-2 sm:col-span-1 rounded-2xl bg-amber-400 p-4 text-zinc-950 shadow-lg">
                  <div className="text-[10px] uppercase font-black text-zinc-800">Ending Total</div>
                  <div className="text-2xl font-black mt-1">550</div>
                  <div className="text-[10px] font-bold text-zinc-700">Net Active Roster</div>
                </div>
              </div>
            </div>

            {/* Platform ROI Card & Valuation (Section 7 & 8) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400">
                  <Sparkles className="h-4 w-4" /> GetPhysical Platform ROI Card
                </div>
                <div className="text-2xl font-black text-white">₱142,500 Generated</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Explicitly isolates app-sourced consumer bookings (Sodia feed discovery + Coach Pro client floor fees) to mathematically prove GetPhysical's value to the landlord.
                </p>
                <div className="text-[11px] text-emerald-400 font-bold">
                  89 New Clients Acquired via Discovery Cards
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-400">
                  <DollarSign className="h-4 w-4" /> Facility Enterprise Valuation
                </div>
                <div className="text-2xl font-black text-white">₱1.85M Annualized LTV</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Calculates verified Gross Sales and True LTV (Lifetime Value) required for bank lending, capital expansion, or facility sale.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. NEEDS ATTENTION (TRIAGE ENGINE) */}
        {activeTab === 'triage' && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-300">
              Operational Fires & Triage Queue
            </h2>
            <p className="text-xs text-zinc-400">
              Zero spreadsheet data-hunting. Only high-priority items with immediate actions appear here.
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-2xl border border-rose-800/60 bg-rose-950/40 p-3.5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-rose-200">
                      Blind Cash Count Mismatch: Shift #402 (Staff: Darelle)
                    </div>
                    <div className="text-[11px] text-rose-300/80">
                      Drawer count reported ₱2,450 vs Expected ₱2,450 (Match).
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Approved and cleared shift ledger audit log.')}
                  className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700"
                >
                  Approve
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-amber-800/60 bg-amber-950/40 p-3.5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-amber-200">
                      Squatter Capacity Breach: Court 1 (14 Scans for 10-person booking)
                    </div>
                    <div className="text-[11px] text-amber-300/80">
                      4 unentitled attendees detected at Quickdash turnstile.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Silently pushed 4x Drop-In invoice payload to Tournament Organizer!')}
                  className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-black text-zinc-950 hover:bg-amber-400"
                >
                  Force Upsell to Organizer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. PREDICTIVE ATTRITION CRM */}
        {activeTab === 'crm' && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-300">
                  Predictive Churn Interception Funnel
                </h2>
                <p className="text-xs text-zinc-400">
                  Members absent for &gt;14 days or expiring within 7 days enter this automated win-back queue.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Discount SKU:</span>
                {[10, 20, 30].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setSelectedDiscount(pct)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      selectedDiscount === pct ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-zinc-800">
              {atRiskMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-xs font-black text-white">{m.name}</div>
                    <div className="text-[11px] text-zinc-400">
                      Absent: <span className="text-rose-400 font-bold">{m.lastVisit}</span> • Expires {m.expiry} • {m.plan}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendWinBack(m.name)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white hover:bg-emerald-500 shadow-sm"
                  >
                    <Send className="h-3 w-3" /> Send {selectedDiscount}% Win-Back Offer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. YIELD MANAGEMENT & HOURLY HEATMAP */}
        {activeTab === 'yield' && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Hourly Floor Headcount Heatmap</h3>
                  <p className="text-xs text-zinc-400">Dead-Hour detection identifies structural vacancies.</p>
                </div>
                <button
                  onClick={handleDeployFlashSKU}
                  className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-black text-zinc-950 hover:bg-amber-300"
                >
                  ⚡ Deploy Off-Peak SKU to Sodia Feed
                </button>
              </div>

              {/* Heatmap Grid Simulation */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="grid grid-cols-6 gap-2 text-center text-[10px] text-zinc-500 font-bold">
                  <div>06:00 AM (Peak)</div>
                  <div className="text-rose-400 font-black">11:00 AM (Dead Hour)</div>
                  <div>02:00 PM (Moderate)</div>
                  <div>05:00 PM (Peak)</div>
                  <div>07:00 PM (Rush)</div>
                  <div>09:00 PM (Taper)</div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  <div className="h-10 rounded-xl bg-emerald-600/80 flex items-center justify-center font-bold">85%</div>
                  <div className="h-10 rounded-xl bg-rose-600/80 flex items-center justify-center font-bold animate-pulse">18%</div>
                  <div className="h-10 rounded-xl bg-amber-600/80 flex items-center justify-center font-bold">45%</div>
                  <div className="h-10 rounded-xl bg-emerald-600/80 flex items-center justify-center font-bold">92%</div>
                  <div className="h-10 rounded-xl bg-emerald-700/80 flex items-center justify-center font-bold">96%</div>
                  <div className="h-10 rounded-xl bg-blue-600/80 flex items-center justify-center font-bold">40%</div>
                </div>
              </div>
            </div>

            {/* Gate-vs-Till Gap Audit */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 space-y-2">
              <div className="text-xs font-black uppercase text-amber-400">
                Gate-versus-Till Gap (Anti-Skim Algorithm)
              </div>
              <p className="text-xs text-zinc-400">
                Cross-references physical anonymous turnstile entries against logged POS cash sales.
              </p>
              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-zinc-800">
                <span>Logged Anonymous Turnstile Admits: <strong>14</strong></span>
                <span>Logged POS Cash Transactions: <strong>14</strong></span>
                <span className="text-emerald-400 font-bold">Variance: ₱0 (100% Clean)</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. LEGACY CSV IMPORT WIZARD */}
        {activeTab === 'import' && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-300">
              Non-Disruptive Legacy CSV Transition Tool
            </h2>
            <p className="text-xs text-zinc-400">
              Migrate members from paper rosters or Excel spreadsheets into offline_members. When users walk in, verify phone and print Claim QR to digitize into Sodia!
            </p>

            <div className="rounded-2xl border-2 border-dashed border-zinc-700 p-8 text-center space-y-2">
              <FileSpreadsheet className="mx-auto h-10 w-10 text-zinc-500" />
              <div className="text-xs font-bold text-white">Upload Legacy Members CSV</div>
              <div className="text-[10px] text-zinc-500">Columns: Name, Phone Number, Pass Expiry Date</div>
              <button
                onClick={() => showToast('Parsed 48 legacy records into offline_members table! Ready for walk-in claim codes.')}
                className="mt-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200"
              >
                Simulate CSV Upload (48 Records)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
