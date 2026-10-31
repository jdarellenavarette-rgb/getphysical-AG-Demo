import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  Trophy,
  Layers,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  Play,
  Share2,
  DollarSign
} from 'lucide-react';

export const ClubdashFacilityOS: React.FC = () => {
  const {
    setPortal,
    facilities,
    bookCourtSlot,
    bracketMatches,
    recordMatchScore,
    createTournamentEvent,
    showToast
  } = useEcosystem();

  const [activeSubView, setActiveSubView] = useState<'spatial' | 'organizer_funnel' | 'bracket'>('spatial');

  // Wizard state for Organizer Funnel Builder
  const [funnelStep, setFunnelStep] = useState(1);
  const [sportType, setSportType] = useState('Pickleball');
  const [formatType, setFormatType] = useState('Double Elimination');
  const [eventPrice, setEventPrice] = useState(800);
  const [enableScarcitySurge, setEnableScarcitySurge] = useState(true);

  // Match score inputs
  const [activeMatchScoreA, setActiveMatchScoreA] = useState(21);
  const [activeMatchScoreB, setActiveMatchScoreB] = useState(18);

  const metroArena = facilities.find(f => f.registry === 'B') || facilities[1];

  const handlePublishFunnel = () => {
    createTournamentEvent(sportType, formatType, metroArena.name, eventPrice);
    setFunnelStep(1);
    setActiveSubView('bracket');
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
            <h1 className="text-sm font-black text-white">Clubdash & Organizer Pro</h1>
            <p className="text-[10px] text-zinc-400">Registry B Courts, Spatial Engine & Tournaments</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('spatial')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeSubView === 'spatial' ? 'bg-white text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Spatial Sub-Division
          </button>
          <button
            onClick={() => setActiveSubView('organizer_funnel')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeSubView === 'organizer_funnel' ? 'bg-white text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mobile Funnel Builder
          </button>
          <button
            onClick={() => setActiveSubView('bracket')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeSubView === 'bracket' ? 'bg-white text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Universal Bracket Engine
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* 1. SPATIAL SUB-DIVISION ENGINE & SQUATTER SENSORS (Section 2 & Deep Dive 21/22) */}
        {activeSubView === 'spatial' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Layers className="h-4 w-4" /> The Spatial Sub-Division Engine
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Nested physical hierarchy: Locking 1 child court programmatically locks parent court while preserving siblings.
                  </p>
                </div>
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-mono font-bold text-zinc-300">
                  +15min Cross-Sport Buffer
                </span>
              </div>

              {/* Court Hierarchy Visualizer */}
              <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4 space-y-3">
                {/* Parent Asset: Basketball Court */}
                <div className={`rounded-xl border p-3 flex items-center justify-between transition-colors ${
                  metroArena.spatialAssets?.isParentLocked
                    ? 'border-amber-600 bg-amber-950/40 text-amber-200'
                    : 'border-emerald-600 bg-emerald-950/40 text-emerald-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {metroArena.spatialAssets?.isParentLocked ? <Lock className="h-4 w-4 text-amber-400" /> : <Unlock className="h-4 w-4 text-emerald-400" />}
                    <div>
                      <div className="text-xs font-black">{metroArena.spatialAssets?.parentName}</div>
                      <div className="text-[10px] opacity-80">
                        {metroArena.spatialAssets?.isParentLocked ? metroArena.spatialAssets.lockedReason : 'Available for Full Court Booking'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold">Parent Asset</span>
                </div>

                {/* Sub-Children: Pickleball Courts A, B, C */}
                <div className="pl-6 space-y-2 border-l-2 border-zinc-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Sub-Divided Child Courts (Pickleball)
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {metroArena.spatialAssets?.children.map(ch => (
                      <div
                        key={ch.id}
                        className={`rounded-xl border p-3 text-center space-y-1.5 transition-all ${
                          ch.isLocked
                            ? 'border-rose-700 bg-rose-950/40 text-rose-200'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <div className="text-xs font-black">{ch.name}</div>
                        <div className="text-[10px] font-mono">
                          {ch.isLocked ? ch.currentBooking || 'Reserved' : 'Open in Sodia'}
                        </div>
                        {!ch.isLocked && (
                          <button
                            onClick={() => bookCourtSlot(metroArena.id, ch.name, '04:00 PM - 05:00 PM')}
                            className="w-full rounded-lg bg-zinc-800 py-1 text-[10px] font-bold text-white hover:bg-zinc-700"
                          >
                            Simulate Reserve
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Squatter Detection & Gate-vs-Booking Alert */}
            <div className="rounded-3xl border border-rose-800/60 bg-rose-950/30 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase">
                <AlertTriangle className="h-4 w-4" /> Live Squatter Detection Alert
              </div>
              <p className="text-xs text-rose-200">
                Turnstile scan #51 detected for a 50-person tournament booking on Court 1!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => showToast('Forced Tier 0 digital waiver and ₱150 micro-fee payment to user #51 via Sodia app.')}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500"
                >
                  Enforce Tier 0 Base Waiver & Micro-Fee
                </button>
                <button
                  onClick={() => showToast('Pushed direct invoice payload to Organizer inbox.')}
                  className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300"
                >
                  Charge Organizer Ledger
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. MOBILE FUNNEL BUILDER (Section 2 Organizer Pro Blueprint) */}
        {activeSubView === 'organizer_funnel' && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 max-w-xl mx-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white">
                  Organizer Pro • 3-Step Event Funnel Builder
                </h3>
                <p className="text-xs text-zinc-400">Step {funnelStep} of 3</p>
              </div>
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-300">
                Self-Serve Sourcing
              </span>
            </div>

            {funnelStep === 1 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300">Step 1: Sport & Bracket Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pickleball Doubles', 'Basketball 3v3', 'Padel Open', 'Volleyball'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSportType(s)}
                      className={`rounded-xl border p-2.5 text-xs font-bold ${
                        sportType === s ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-zinc-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setFunnelStep(2)}
                  className="w-full mt-2 rounded-xl bg-white py-2.5 text-xs font-black text-zinc-950 hover:bg-zinc-200"
                >
                  Next: Venue Handshake ➔
                </button>
              </div>
            )}

            {funnelStep === 2 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300">Step 2: B2B Venue Handshake</label>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 space-y-2 text-xs">
                  <div className="font-bold text-white">{metroArena.name}</div>
                  <div className="text-zinc-400">{metroArena.address}</div>
                  <div className="text-emerald-400 font-mono">Time Slot: Saturday 08:00 AM - 05:00 PM</div>
                  <div className="text-[11px] text-zinc-500">
                    B2B Agreement: Rental cost automatically locked into split ledger.
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setFunnelStep(1)} className="flex-1 rounded-xl bg-zinc-800 py-2.5 text-xs font-bold">
                    Back
                  </button>
                  <button onClick={() => setFunnelStep(3)} className="flex-1 rounded-xl bg-white py-2.5 text-xs font-black text-zinc-950">
                    Next: Dynamic Pricing ➔
                  </button>
                </div>
              </div>
            )}

            {funnelStep === 3 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300">Step 3: Registration Fee & Scarcity Surging</label>
                <div>
                  <span className="text-[10px] text-zinc-400">Team Entry Fee (₱)</span>
                  <input
                    type="number"
                    value={eventPrice}
                    onChange={e => setEventPrice(Number(e.target.value))}
                    className="w-full rounded-xl bg-zinc-800 border border-zinc-700 p-2 font-mono font-bold text-white"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-zinc-800 p-3 text-xs">
                  <div>
                    <div className="font-bold text-white">Dynamic Scarcity Surging</div>
                    <div className="text-[10px] text-zinc-400">Auto-surges price for final 2 tournament spots</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableScarcitySurge}
                    onChange={e => setEnableScarcitySurge(e.target.checked)}
                    className="h-4 w-4 accent-amber-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setFunnelStep(2)} className="flex-1 rounded-xl bg-zinc-800 py-2.5 text-xs font-bold">
                    Back
                  </button>
                  <button
                    onClick={handlePublishFunnel}
                    className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-black text-zinc-950 hover:bg-amber-300"
                  >
                    Publish to Sodia Feed
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. UNIVERSAL BRACKET ENGINE (Section 3 Organizer Pro Blueprint & Deep Dive 23) */}
        {activeSubView === 'bracket' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" /> Universal JSON Bracket Engine
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Live Scoreboard, automated court assignment, and Stripe Connect split payout calculation.
                  </p>
                </div>
                <button
                  onClick={() => showToast('🏆 Tournament Ended! Gross revenue split: ₱15,000 to Metro Arena, ₱35,000 net profit to Organizer digital wallet via Stripe Connect.')}
                  className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-emerald-500 shadow-md"
                >
                  End Tournament & Split Payout
                </button>
              </div>

              {/* Bracket Elimination Tree */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bracketMatches.map(m => (
                  <div
                    key={m.id}
                    className={`rounded-2xl border p-4 space-y-3 ${
                      m.status === 'live' ? 'border-amber-400 bg-zinc-950 ring-2 ring-amber-400/40' : 'border-zinc-800 bg-zinc-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-400">{m.courtName} • Round {m.round}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        m.status === 'live' ? 'bg-amber-400 text-zinc-950 animate-pulse' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className={`flex justify-between items-center p-2 rounded-xl ${
                        m.teamA.isWinner ? 'bg-emerald-950/60 font-black text-emerald-300' : 'bg-zinc-900 text-zinc-300'
                      }`}>
                        <span>Seed #{m.teamA.seed}: {m.teamA.name}</span>
                        <span className="font-mono font-black">{m.teamA.score !== undefined ? m.teamA.score : '—'}</span>
                      </div>

                      <div className={`flex justify-between items-center p-2 rounded-xl ${
                        m.teamB.isWinner ? 'bg-emerald-950/60 font-black text-emerald-300' : 'bg-zinc-900 text-zinc-300'
                      }`}>
                        <span>Seed #{m.teamB.seed}: {m.teamB.name}</span>
                        <span className="font-mono font-black">{m.teamB.score !== undefined ? m.teamB.score : '—'}</span>
                      </div>
                    </div>

                    {m.status === 'live' && (
                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs">
                          <input
                            type="number"
                            value={activeMatchScoreA}
                            onChange={e => setActiveMatchScoreA(Number(e.target.value))}
                            className="w-12 rounded-lg bg-zinc-800 p-1 text-center font-mono font-bold text-white"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            value={activeMatchScoreB}
                            onChange={e => setActiveMatchScoreB(Number(e.target.value))}
                            className="w-12 rounded-lg bg-zinc-800 p-1 text-center font-mono font-bold text-white"
                          />
                        </div>

                        <button
                          onClick={() => recordMatchScore(m.id, activeMatchScoreA, activeMatchScoreB)}
                          className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-black text-zinc-950 hover:bg-amber-300"
                        >
                          Finalize Score & Advance
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
