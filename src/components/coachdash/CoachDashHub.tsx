import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  Dumbbell,
  Users,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Send,
  Video,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const CoachDashHub: React.FC = () => {
  const {
    setPortal,
    coachClients,
    triggerClientNudge,
    injectMacrocycleProgram,
    showToast
  } = useEcosystem();

  const [activeCoachTab, setActiveCoachTab] = useState<'triage' | 'floor_roster' | 'cycle_builder' | 'video_check'>('triage');
  const [isVideoAnnotationSaved, setIsVideoAnnotationSaved] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      {/* Top Bar */}
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
            <h1 className="text-sm font-black text-white">CoachDash (Registry C Command Line)</h1>
            <p className="text-[10px] text-zinc-400">Independent Coach CRM & Planned vs Actual Sync</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'triage', label: 'Triage & Compliance' },
            { id: 'floor_roster', label: 'Live Floor Roster' },
            { id: 'cycle_builder', label: 'Cycle Builder' },
            { id: 'video_check', label: 'Video Form-Check' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCoachTab(tab.id as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                activeCoachTab === tab.id ? 'bg-white text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* 1. TRIAGE & PLANNED VS ACTUAL COMPLIANCE DASHBOARD (Section 2 & Deep Dive 10) */}
        {activeCoachTab === 'triage' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-purple-400">
                    Planned vs. Actual Compliance Engine
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Calculates variance between planned_track and client's actual Sodia logs. 3-day negative delta auto-triggers check-in nudge.
                  </p>
                </div>
                <span className="rounded-full bg-purple-900/60 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-300">
                  {coachClients.length} Active Roster
                </span>
              </div>

              {/* Client Rows */}
              <div className="divide-y divide-zinc-800">
                {coachClients.map(client => (
                  <div key={client.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={client.avatar} alt={client.name} className="h-10 w-10 rounded-full object-cover border border-zinc-700" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{client.name}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            client.status === 'in_building'
                              ? 'bg-emerald-500 text-white'
                              : client.status === 'at_risk'
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {client.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {client.goal} • {client.currentProgram}
                        </div>
                      </div>
                    </div>

                    {/* Macro Compliance Variance */}
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase">Protein Var</div>
                        <div className={`font-bold ${client.actualMacros.protein >= client.plannedMacros.protein ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {client.actualMacros.protein}/{client.plannedMacros.protein}g
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase">Remaining</div>
                        <div className="font-bold text-white">{client.remainingSessions} sessions</div>
                      </div>

                      {client.missedDays >= 3 ? (
                        <button
                          onClick={() => triggerClientNudge(client.id)}
                          className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white hover:bg-rose-500 shadow-sm"
                        >
                          <AlertTriangle className="h-3 w-3" /> Auto-Nudge (3-Day Delta)
                        </button>
                      ) : (
                        <button
                          onClick={() => showToast(`Adjusted training volume targets for ${client.name}.`)}
                          className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
                        >
                          Adjust Program
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. LIVE FLOOR MODE ROSTER & DUAL-AUTHORIZATION (Section 4 & 5) */}
        {activeCoachTab === 'floor_roster' && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white">Live Floor Roster (Twins Fitness BGC)</h3>
                <p className="text-xs text-zinc-400">
                  Turns from "Expected" to [IN BUILDING] when client scans turnstile. ₱150 floor fee routed automatically.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-400">
                Turnstile Synced
              </span>
            </div>

            <div className="space-y-3">
              {coachClients.map(client => (
                <div
                  key={client.id}
                  className={`rounded-2xl border p-4 flex items-center justify-between transition-all ${
                    client.status === 'in_building'
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : 'border-zinc-800 bg-zinc-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={client.avatar} alt={client.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{client.name}</span>
                        {client.status === 'in_building' && (
                          <span className="flex items-center gap-1 rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">
                            <CheckCircle2 className="h-3 w-3" /> IN BUILDING
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Scheduled: {client.scheduledTime || 'Walk-in Open Floor'} • Floor Fee ₱150 Settled
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast(`Floor check-in confirmed for ${client.name}. Loaded training session.`)}
                    className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700"
                  >
                    Start 1-on-1 Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CYCLE BUILDER (Section 3) */}
        {activeCoachTab === 'cycle_builder' && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white">Agnostic Macrocycle & Periodization Builder</h3>
                <p className="text-xs text-zinc-400">
                  Construct Micro (weekly), Meso (monthly), and Macro cycles. Pushes JSON payload directly to client's Sodia planned_track.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Strength Wave 1 (Base)', duration: '4 Weeks', focus: '1RM Strength' },
                { name: 'Hypertrophy & Work Capacity', duration: '6 Weeks', focus: 'Volume' },
                { name: 'Hyrox Race Peaking Cycle', duration: '8 Weeks', focus: 'Endurance & Power' }
              ].map(prog => (
                <div key={prog.name} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                  <div className="text-xs font-black text-white">{prog.name}</div>
                  <div className="text-[10px] text-zinc-400">{prog.duration} • {prog.focus}</div>
                  <button
                    onClick={() => injectMacrocycleProgram('cl_1', prog.name)}
                    className="w-full mt-2 rounded-xl bg-purple-700 py-1.5 text-xs font-bold text-white hover:bg-purple-600 shadow-sm"
                  >
                    Deploy to Client Roster
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. VIDEO FORM-CHECK (Section 5 & Deep Dive 27) */}
        {activeCoachTab === 'video_check' && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Video Form-Check Annotation Vault</h3>
                <p className="text-xs text-zinc-400">Client: @darelle (225 KG Deadlift Lockout)</p>
              </div>
              <span className="text-xs text-emerald-400 font-bold">Remote Video Attached</span>
            </div>

            {/* Video Canvas Simulation */}
            <div className="relative aspect-16/9 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
                alt="Form check"
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white">
                  <Play className="h-6 w-6 fill-white" />
                </div>
              </div>

              {/* Annotation Circle Overlay */}
              {isVideoAnnotationSaved && (
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-400 p-6 animate-pulse">
                  <span className="rounded bg-black/80 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                    Hip extension angle: Optimal (0.32 m/s)
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsVideoAnnotationSaved(!isVideoAnnotationSaved);
                  showToast(isVideoAnnotationSaved ? 'Removed posture overlay.' : 'Added drawing posture circle annotation to video frame.');
                }}
                className="flex-1 rounded-xl bg-zinc-800 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700"
              >
                {isVideoAnnotationSaved ? 'Clear Annotations' : 'Draw Posture Annotation'}
              </button>
              <button
                onClick={() => showToast('Timestamped voice note & annotated video sent to client Sodia inbox!')}
                className="flex-1 rounded-xl bg-purple-600 py-2.5 text-xs font-black text-white hover:bg-purple-500 shadow-md"
              >
                Send Voice Note to Sodia
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
