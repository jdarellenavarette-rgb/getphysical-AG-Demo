import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  Trophy,
  Scale,
  Calendar,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Sparkles,
  ArrowRight,
  Plus,
  QrCode,
  ShieldCheck,
  Flame,
  Award,
  Wallet,
  Clock,
  Bookmark,
  Share2,
  Heart,
  TrendingUp,
  Activity,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { StampOverlay } from '../common/StampOverlay';
import { JourneyFeatureModal } from '../journey/JourneyFeatureModal';

export const ProfileHub: React.FC = () => {
  const {
    currentUser,
    switchRole,
    facilities,
    passes,
    ledger,
    isQRFlapped,
    setIsQRFlapped,
    showToast
  } = useEcosystem();

  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'trophy' | 'roster' | 'saved'>('overview');
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [journeyInitialTab, setJourneyInitialTab] = useState<'overview' | 'journal' | 'timer' | 'reps'>('overview');
  const [isHideTrophyEntry, setIsHideTrophyEntry] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activePass = passes[0];

  const handleOpenJourney = (tab: 'overview' | 'journal' | 'timer' | 'reps' = 'overview') => {
    setJourneyInitialTab(tab);
    setIsJourneyModalOpen(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-3 pb-28 space-y-5 select-none text-white">
      
      {/* ======================================================== */}
      {/* 1. LUXURY USER PROFILE HEADER (Matching Figma & App Spec) */}
      {/* ======================================================== */}
      <div className="rounded-[36px] bg-[#14171f] border border-white/10 p-5 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Top Status & Quick Switch Action */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#ec4899]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Titanium VIP Member</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsQRFlapped(!isQRFlapped);
                showToast(isQRFlapped ? 'Showing VIP card front' : 'Showing optical QR check-in pass');
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all active:scale-95 border border-white/10"
              title="Quick QR Pass"
            >
              <QrCode className="h-3.5 w-3.5 text-emerald-400" />
              <span>QR Pass</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors border border-white/10"
              title="Account Settings"
            >
              <SettingsIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* User Identity Details */}
        <div className="pt-4 flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-[#ec4899] shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-black">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white tracking-tight leading-snug truncate">
              {currentUser.name}
            </h1>
            <p className="text-xs font-semibold text-zinc-400">
              @adam.arete · Member #GP-2026-VIP
            </p>
            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed line-clamp-2">
              Strength & Hybrid Conditioning. Training at AMP Fitness SJDM & Sprout Pickleball Club.
            </p>
          </div>
        </div>

        {/* Key Profile Metric Counters */}
        <div className="mt-5 grid grid-cols-4 gap-2 bg-black/40 rounded-2xl p-2.5 border border-white/5 text-center">
          <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleOpenJourney('overview')}>
            <div className="text-base font-black text-white">350</div>
            <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Workouts</div>
          </div>
          <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleOpenJourney('overview')}>
            <div className="text-base font-black text-blue-400">18.7k</div>
            <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Act. Min</div>
          </div>
          <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleOpenJourney('journal')}>
            <div className="text-base font-black text-[#ec4899]">14</div>
            <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Streak 🔥</div>
          </div>
          <div>
            <div className="text-base font-black text-emerald-400">₱24.8k</div>
            <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">SOA Bal.</div>
          </div>
        </div>

        {/* Quick Action Profile Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => showToast('Profile editing available in settings')}
            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 active:scale-95 text-center"
          >
            Edit Profile
          </button>
          <button
            onClick={() => showToast('Profile link copied to clipboard!')}
            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 active:scale-95 text-center flex items-center justify-center gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. THE JOURNEY (FEATURE SHOWCASE CARD - NOT A REPLACEMENT) */}
      {/* ======================================================== */}
      <div className="rounded-[32px] bg-gradient-to-br from-[#1e1b4b] via-[#1e293b] to-[#0f172a] border border-indigo-500/30 p-5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-indigo-400/20">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Activity className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>The Journey</span>
                <span className="text-[11px] font-semibold text-blue-400">· Daily Tracker</span>
              </h2>
              <p className="text-[10px] text-zinc-400">Integrated lifestyle, rest timer & gratitude logs</p>
            </div>
          </div>

          <button
            onClick={() => handleOpenJourney('overview')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md transition-all active:scale-95"
          >
            <span>Open Feature</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
          <div
            onClick={() => handleOpenJourney('overview')}
            className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 cursor-pointer transition-all active:scale-95"
          >
            <div className="text-[10px] font-bold text-zinc-400 uppercase">Active Time</div>
            <div className="text-lg font-black text-blue-400 mt-0.5">18,702 min</div>
            <div className="text-[10px] text-zinc-400">350 workouts</div>
          </div>

          <div
            onClick={() => handleOpenJourney('overview')}
            className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 cursor-pointer transition-all active:scale-95"
          >
            <div className="text-[10px] font-bold text-zinc-400 uppercase">Weight Trend</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">152 lbs</div>
            <div className="text-[10px] text-emerald-400/90 font-medium">-11 lbs total</div>
          </div>

          <div
            onClick={() => handleOpenJourney('journal')}
            className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 cursor-pointer transition-all active:scale-95"
          >
            <div className="text-[10px] font-bold text-zinc-400 uppercase">Journal</div>
            <div className="text-sm font-black text-pink-400 mt-0.5 truncate">"alive..."</div>
            <div className="text-[10px] text-zinc-400">Gratitude entries</div>
          </div>

          <div
            onClick={() => handleOpenJourney('timer')}
            className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 cursor-pointer transition-all active:scale-95"
          >
            <div className="text-[10px] font-bold text-zinc-400 uppercase">Rest Timer</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">123 sec</div>
            <div className="text-[10px] text-zinc-400">Barbell RDL</div>
          </div>
        </div>

        {/* Feature Sub-action Pill Bar */}
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5 text-zinc-400">
          <span className="text-[11px]">Synced with HealthKit & Phase 5 Trinity</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenJourney('journal')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Daily Journal ✍️
            </button>
            <span>·</span>
            <button
              onClick={() => handleOpenJourney('timer')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Rest Clock ⏱️
            </button>
            <span>·</span>
            <button
              onClick={() => handleOpenJourney('reps')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Weight & Reps 🏋️
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PROFILE SUB-TABS (Overview, Trophies, Facilities, Saved) */}
      {/* ======================================================== */}
      <div className="flex rounded-2xl bg-white/5 p-1 text-xs font-bold text-zinc-400 border border-white/10">
        <button
          onClick={() => setActiveProfileTab('overview')}
          className={`flex-1 rounded-xl py-2 transition-all ${
            activeProfileTab === 'overview'
              ? 'bg-white/15 text-white shadow-xs font-black'
              : 'hover:text-zinc-200'
          }`}
        >
          Passes & SOA
        </button>
        <button
          onClick={() => setActiveProfileTab('trophy')}
          className={`flex-1 rounded-xl py-2 transition-all ${
            activeProfileTab === 'trophy'
              ? 'bg-white/15 text-white shadow-xs font-black'
              : 'hover:text-zinc-200'
          }`}
        >
          Trophy Case
        </button>
        <button
          onClick={() => setActiveProfileTab('roster')}
          className={`flex-1 rounded-xl py-2 transition-all ${
            activeProfileTab === 'roster'
              ? 'bg-white/15 text-white shadow-xs font-black'
              : 'hover:text-zinc-200'
          }`}
        >
          Clubs & Roster
        </button>
        <button
          onClick={() => setActiveProfileTab('saved')}
          className={`flex-1 rounded-xl py-2 transition-all ${
            activeProfileTab === 'saved'
              ? 'bg-white/15 text-white shadow-xs font-black'
              : 'hover:text-zinc-200'
          }`}
        >
          Saved Reels
        </button>
      </div>

      {/* TAB 1: PASSES & STATEMENT OF ACCOUNT */}
      {activeProfileTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Active Pass Card Preview */}
          <div className="rounded-[28px] bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/15 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-zinc-300">Active VIP Passes ({passes.length})</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Valid & Ready
              </span>
            </div>

            <div className="space-y-2">
              {passes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-[#ec4899] font-black">
                      VIP
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{p.facilityName}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Expires {p.validUntil} · {p.memberName}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Statement of Account (SOA) Mini Ledger */}
          <div className="rounded-[28px] bg-[#14171f] border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-white">Recent Pass Transactions</span>
              <span className="text-zinc-400 font-mono text-[11px]">Absolute Truth DB</span>
            </div>

            <div className="space-y-2">
              {ledger.slice(0, 3).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{tx.facilityName}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{tx.timestamp} · {tx.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white">
                      PHP {tx.amount.toLocaleString()}
                    </div>
                    <span className="text-[9px] text-emerald-400 uppercase font-bold">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TROPHY CASE */}
      {activeProfileTab === 'trophy' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Immutable Verified PR Stamps & Badges
            </span>
            <button
              onClick={() => {
                setIsHideTrophyEntry(!isHideTrophyEntry);
                showToast(isHideTrophyEntry ? 'Trophy Case entries visible.' : 'Entry hidden from public view.');
              }}
              className="flex items-center gap-1 text-xs font-bold text-pink-400 hover:underline"
            >
              {isHideTrophyEntry ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{isHideTrophyEntry ? 'Hidden' : 'Public'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StampOverlay
              stamp={{
                id: 'stmp_pr_1',
                type: 'lift',
                timestamp: 'Oct 28 · 06:45 AM',
                title: 'VERIFIED 1RM DEADLIFT',
                primaryMetric: '225 KG x 4',
                subMetrics: ['RPE 9.5', 'Twins Fitness BGC', 'Eleiko Bar'],
                isVerified: true,
                isPR: true,
                facilityName: 'Twins Fitness BGC'
              }}
            />

            <StampOverlay
              stamp={{
                id: 'stmp_court_1',
                type: 'move',
                timestamp: 'Oct 27 · 05:15 PM',
                title: 'RIVALRY MATCH VERIFIED',
                primaryMetric: 'WIN: 11 - 8',
                subMetrics: ['Pickleball Singles', 'Vs @alex_r (Confirmed)', 'Metro Sports Arena'],
                isVerified: true,
                facilityName: 'Metro Sports Arena'
              }}
            />
          </div>

          {/* 34 Dives Achievement Milestone */}
          <div className="rounded-2xl bg-purple-950/30 border border-purple-500/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Full Ecosystem Clearance</h4>
                <p className="text-[10px] text-purple-300/80">34 Engine Flowcharts Verified (Offline sync, anti-passback)</p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-400">100% PASS</span>
          </div>
        </div>
      )}

      {/* TAB 3: ROSTER */}
      {activeProfileTab === 'roster' && (
        <div className="space-y-3 animate-in fade-in">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            Registered Clubs & Facilities
          </span>
          <div className="space-y-2">
            {currentUser.activeRoster.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-2xl bg-[#14171f] border border-white/10 p-4 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">{r.name}</h4>
                    <div className="text-[11px] text-zinc-400 font-medium">Valid until {r.validUntil}</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-pink-400">{r.badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SAVED REELS */}
      {activeProfileTab === 'saved' && (
        <div className="space-y-3 animate-in fade-in">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            Saved Workouts & Video Reels
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => showToast('Playing saved reel: Moe Tuscano Glute Session')}
              className="rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden cursor-pointer group shadow-lg"
            >
              <div className="relative aspect-[9/14] bg-zinc-800">
                <img
                  src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80"
                  alt="Saved Workout"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                  <p className="text-xs font-extrabold text-white leading-tight">Moe Tuscano</p>
                  <p className="text-[10px] text-zinc-300">Glute dominant session</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => showToast('Playing saved routine: Complete Core Abs')}
              className="rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden cursor-pointer group shadow-lg"
            >
              <div className="relative aspect-[9/14] bg-zinc-800">
                <img
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80"
                  alt="Core Routine"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                  <p className="text-xs font-extrabold text-white leading-tight">Abs & Core 24m</p>
                  <p className="text-[10px] text-zinc-300">NASM verified circuit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. THE JOURNEY FULL INTERACTIVE MODAL */}
      {/* ======================================================== */}
      <JourneyFeatureModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
        initialTab={journeyInitialTab}
      />

      {/* Settings Modal Trigger */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[32px] bg-[#14171f] text-white border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-white">Profile & Account Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  switchRole('staff');
                  setIsSettingsOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 p-3 text-xs font-bold text-white hover:bg-white/10 transition-colors"
              >
                <span>Switch to GymDash (Staff Mode)</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </button>

              <button
                onClick={() => {
                  switchRole('coach');
                  setIsSettingsOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 p-3 text-xs font-bold text-white hover:bg-white/10 transition-colors"
              >
                <span>Switch to CoachDash (Trainer Mode)</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </button>

              <button
                onClick={() => {
                  handleOpenJourney('overview');
                  setIsSettingsOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-2xl bg-blue-600/20 border border-blue-500/30 p-3 text-xs font-bold text-blue-300 hover:bg-blue-600/30 transition-colors"
              >
                <span>Launch The Journey Feature</span>
                <ChevronRight className="h-4 w-4 text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
