import React, { useState, useEffect } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  Play,
  Pause,
  Square,
  Activity,
  Heart,
  MapPin,
  Clock,
  Compass,
  Trophy,
  Share2,
  Users,
  CheckCircle2
} from 'lucide-react';
import { StampOverlay } from '../common/StampOverlay';
import { VerifiedStamp } from '../../types';

export const MoveTracker: React.FC = () => {
  const {
    activeMoveSession,
    startMoveSession,
    pauseMoveSession,
    resumeMoveSession,
    finishMoveSession,
    createPost,
    showToast
  } = useEcosystem();

  const [selectedSport, setSelectedSport] = useState('Pickleball');
  const [isCourtMatchModalOpen, setIsCourtMatchModalOpen] = useState(false);
  const [matchResult, setMatchResult] = useState<'win' | 'loss'>('win');
  const [matchScore, setMatchScore] = useState('11-8');
  const [opponentHandle, setOpponentHandle] = useState('alex_r');
  const [generatedStamp, setGeneratedStamp] = useState<VerifiedStamp | null>(null);

  // Live timer tick when active and not paused
  useEffect(() => {
    if (!activeMoveSession.isActive || activeMoveSession.isPaused) return;
    const interval = setInterval(() => {
      // simulate distance increment for GPS run, or time for court
      // (activeMoveSession is tracked in context)
    }, 1000);
    return () => clearInterval(interval);
  }, [activeMoveSession.isActive, activeMoveSession.isPaused]);

  const sports = [
    { name: 'Pickleball', isCourt: true, icon: '🏓' },
    { name: 'Padel', isCourt: true, icon: '🎾' },
    { name: 'Outdoor Run', isCourt: false, icon: '🏃' },
    { name: 'Cycling', isCourt: false, icon: '🚴' },
    { name: 'Tennis', isCourt: true, icon: '🎾' },
    { name: 'Basketball 3v3', isCourt: true, icon: '🏀' },
    { name: 'Open Water Swim', isCourt: false, icon: '🏊' }
  ];

  const handleStart = (sportName: string, isCourt: boolean) => {
    startMoveSession(sportName, isCourt);
  };

  const handleFinishPrompt = () => {
    if (activeMoveSession.isCourtMode) {
      setIsCourtMatchModalOpen(true);
    } else {
      const stamp = finishMoveSession();
      setGeneratedStamp(stamp);
    }
  };

  const handleConfirmCourtMatch = () => {
    const stamp = finishMoveSession(matchResult, matchScore, opponentHandle);
    setIsCourtMatchModalOpen(false);
    setGeneratedStamp(stamp);
    showToast(`Match verification request sent to @${opponentHandle} in Sodia DM!`);
  };

  const handleShareToSodia = () => {
    if (!generatedStamp) return;
    createPost(
      `Finished verified session! ${generatedStamp.primaryMetric}`,
      '',
      undefined,
      generatedStamp
    );
    setGeneratedStamp(null);
  };

  return (
    <div className="space-y-4">
      {/* Weekly Mileage Ring & Goals Card */}
      <div className="rounded-[28px] bg-white p-5 ios-card-shadow border border-white/80 flex items-center justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
            Weekly Cardio Distance
          </span>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">18.4 / 25.0 KM</div>
          <p className="text-xs text-[#2563EB] font-bold mt-0.5">73% of weekly target reached</p>
        </div>

        {/* Circular Progress Representation */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <svg className="h-full w-full rotate-[-90deg]">
            <circle cx="28" cy="28" r="22" stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="#2563EB"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray="138"
              strokeDashoffset="37"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute font-mono text-[11px] font-extrabold text-slate-900">73%</span>
        </div>
      </div>

      {/* Live Active Session HUD */}
      {activeMoveSession.isActive ? (
        <div className="rounded-[28px] bg-slate-950 p-6 text-white ios-card-floating space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wide text-rose-400">
                {activeMoveSession.type} · {activeMoveSession.isCourtMode ? 'Court Mode' : 'Live GPS'}
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400">GPS Tracker Active</span>
          </div>

          {activeMoveSession.isCourtMode ? (
            /* Court Mode (Pulsing HR ring & Active Timer) */
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-rose-500/30 bg-rose-500/10 animate-pulse">
                <Heart className="h-10 w-10 text-rose-500 animate-bounce" />
                <span className="absolute bottom-2 font-mono text-xs font-black text-rose-300">
                  152 BPM
                </span>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold font-mono tracking-tight">34:12</div>
                <div className="text-xs text-slate-400 font-medium">Match Duration (Z3 Aerobic Zone)</div>
              </div>
            </div>
          ) : (
            /* GPS Trail Mode */
            <div className="grid grid-cols-3 gap-2 text-center py-2">
              <div className="rounded-2xl bg-slate-900/90 p-3">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Distance</div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight">5.20 KM</div>
              </div>
              <div className="rounded-2xl bg-slate-900/90 p-3">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Duration</div>
                <div className="text-xl font-extrabold text-white font-mono tracking-tight">26:45</div>
              </div>
              <div className="rounded-2xl bg-slate-900/90 p-3">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Pace</div>
                <div className="text-xl font-extrabold text-amber-400 font-mono tracking-tight">5:08/km</div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex gap-2 pt-1">
            {activeMoveSession.isPaused ? (
              <button
                onClick={resumeMoveSession}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-xs font-extrabold text-white hover:bg-emerald-700 transition-all shadow-sm"
              >
                <Play className="h-4 w-4" /> Resume
              </button>
            ) : (
              <button
                onClick={pauseMoveSession}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-slate-800 py-3 text-xs font-extrabold text-white hover:bg-slate-700 transition-all"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}

            <button
              onClick={handleFinishPrompt}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 py-3 text-xs font-extrabold text-white transition-all shadow-sm"
            >
              <Square className="h-4 w-4" /> Finish Session
            </button>
          </div>
        </div>
      ) : (
        /* Universal Selector Grid (Endurance, Court, Padel) */
        <div className="rounded-[28px] bg-white p-5 ios-card-shadow border border-white/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#2563EB] tracking-tight">
              Universal Activity Selector
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Padel & Court Ready</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {sports.map(s => (
              <button
                key={s.name}
                onClick={() => handleStart(s.name, s.isCourt)}
                className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3 text-left hover:bg-slate-100 transition-all active:scale-[0.98]"
              >
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">{s.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{s.isCourt ? 'Court Mode' : 'GPS Trail'}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Heart-Rate Zones UI Rendering (Exact 30mm SVG Stacked Bar Target from Spec Phase 5) */}
      <div className="rounded-[28px] bg-white p-5 ios-card-shadow border border-white/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-extrabold text-[#2563EB] tracking-tight">
              Wearable Heart-Rate Zones (Z1 – Z5)
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Apple Health & Garmin Connect telemetry timeseries</p>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Avg 148 BPM</span>
        </div>

        {/* Stacked Horizontal Zone Bar */}
        <div className="flex h-7 w-full overflow-hidden rounded-xl font-mono text-[10px] font-bold text-white shadow-inner">
          <div className="flex items-center justify-center bg-slate-400" style={{ width: '15%' }} title="Z1 Recovery (15%)">
            Z1
          </div>
          <div className="flex items-center justify-center bg-blue-500" style={{ width: '25%' }} title="Z2 Endurance (25%)">
            Z2
          </div>
          <div className="flex items-center justify-center bg-emerald-500" style={{ width: '35%' }} title="Z3 Aerobic (35%)">
            Z3
          </div>
          <div className="flex items-center justify-center bg-amber-500" style={{ width: '20%' }} title="Z4 Threshold (20%)">
            Z4
          </div>
          <div className="flex items-center justify-center bg-rose-600" style={{ width: '5%' }} title="Z5 Max (5%)">
            Z5
          </div>
        </div>

        <div className="grid grid-cols-5 text-center text-[10px] text-slate-500 font-medium">
          <div>15% Warmup</div>
          <div>25% Base</div>
          <div className="font-bold text-emerald-600">35% Aerobic</div>
          <div>20% Hard</div>
          <div>5% Sprint</div>
        </div>
      </div>

      {/* Post-Match Win/Loss Prompt Modal (Deep Dive 16) */}
      {isCourtMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-zinc-900">Court Match Final Score</h3>
            <p className="text-xs text-zinc-500">
              Record match results to update the Sodia Rivalry Ledger.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMatchResult('win')}
                className={`flex-1 rounded-xl py-2 text-xs font-black transition-all ${
                  matchResult === 'win' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                WIN 🏆
              </button>
              <button
                type="button"
                onClick={() => setMatchResult('loss')}
                className={`flex-1 rounded-xl py-2 text-xs font-black transition-all ${
                  matchResult === 'loss' ? 'bg-rose-600 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                LOSS
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Final Score</label>
              <input
                type="text"
                value={matchScore}
                onChange={e => setMatchScore(e.target.value)}
                placeholder="e.g. 11-8"
                className="mt-1 w-full rounded-xl border border-zinc-300 p-2 text-center text-sm font-black font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Tag Opponent (@username)</label>
              <input
                type="text"
                value={opponentHandle}
                onChange={e => setOpponentHandle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 p-2 text-xs font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsCourtMatchModalOpen(false)}
                className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCourtMatch}
                className="flex-1 rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white hover:bg-zinc-800"
              >
                Confirm & Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Stamp Share Modal */}
      {generatedStamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl text-center space-y-4">
            <h3 className="text-base font-black text-zinc-900">Cardio Activity Verified!</h3>
            <div className="flex justify-center py-2">
              <StampOverlay stamp={generatedStamp} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setGeneratedStamp(null)}
                className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={handleShareToSodia}
                className="flex-1 rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 flex items-center justify-center gap-1"
              >
                <Share2 className="h-3.5 w-3.5" /> Share to Sodia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
