import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  X,
  Smartphone,
  Building2,
  Trophy,
  Dumbbell,
  Monitor,
  ShieldCheck,
  Database,
  RotateCcw,
  Download,
  Wifi,
  WifiOff,
  Sparkles,
  UserCheck,
  Sliders,
  Check
} from 'lucide-react';

interface ExecutiveSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTestbench: () => void;
  figmaMockupMode: boolean;
  setFigmaMockupMode: (b: boolean) => void;
}

export const ExecutiveSettingsModal: React.FC<ExecutiveSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenTestbench,
  figmaMockupMode,
  setFigmaMockupMode
}) => {
  const {
    portal,
    setPortal,
    currentUser,
    switchRole,
    isOfflineMode,
    setIsOfflineMode,
    ledger,
    passes,
    showToast
  } = useEcosystem();

  if (!isOpen) return null;

  const handleResetDatabase = () => {
    try {
      localStorage.clear();
      showToast('Database reset to official specs! Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (e) {
      showToast('Reset completed.');
    }
  };

  const handleExportAudit = () => {
    const exportData = {
      app: 'getphysical',
      version: '4.1',
      exportedAt: new Date().toISOString(),
      user: currentUser,
      activePasses: passes,
      ledger: ledger
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `getphysical-audit-${Date.now()}.json`;
    a.click();
    showToast('Audit JSON downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-[36px] sm:rounded-[32px] bg-[#141417] text-white border border-white/15 p-6 shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#ec4899] to-[#d946ef] text-white shadow-md">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Settings & Ecosystem Controls
              </h2>
              <p className="text-xs text-zinc-400">System configuration, databases & portals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 no-scrollbar">
          {/* Section 1: Display Presentation Mode */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
              Display & Presentation Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setFigmaMockupMode(false); showToast('Switched to Native Mobile Mode'); }}
                className={`flex flex-col items-start gap-1 p-3.5 rounded-2xl border transition-all text-left ${
                  !figmaMockupMode
                    ? 'border-[#ec4899] bg-[#ec4899]/10 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Smartphone className="h-5 w-5 text-[#ec4899]" />
                  {!figmaMockupMode && <Check className="h-4 w-4 text-[#ec4899]" />}
                </div>
                <div className="text-xs font-bold text-white mt-1">Native Mobile View</div>
                <div className="text-[10px] text-zinc-400">Responsive interactive app</div>
              </button>

              <button
                onClick={() => { setFigmaMockupMode(true); setPortal('sodia'); showToast('Switched to Dual Figma Output View'); }}
                className={`flex flex-col items-start gap-1 p-3.5 rounded-2xl border transition-all text-left ${
                  figmaMockupMode
                    ? 'border-[#ec4899] bg-[#ec4899]/10 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Monitor className="h-5 w-5 text-[#f97316]" />
                  {figmaMockupMode && <Check className="h-4 w-4 text-[#ec4899]" />}
                </div>
                <div className="text-xs font-bold text-white mt-1">Figma Dual Mockup</div>
                <div className="text-[10px] text-zinc-400">Side-by-side device frames</div>
              </button>
            </div>
          </div>

          {/* Section 2: Ecosystem Portals Switcher */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
              Active Ecosystem Portal
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => { setPortal('sodia'); setFigmaMockupMode(false); onClose(); }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  portal === 'sodia' && !figmaMockupMode
                    ? 'border-[#ec4899] bg-gradient-to-r from-[#ec4899]/20 to-[#d946ef]/10 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ec4899] text-white">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-white">Consumer App (Sodia B2C)</div>
                    <div className="text-[10px] text-zinc-400">VIP Passes, Workout Reels & Feed</div>
                  </div>
                </div>
                {portal === 'sodia' && !figmaMockupMode && <Check className="h-4 w-4 text-[#ec4899]" />}
              </button>

              <button
                onClick={() => { setPortal('gymdash-tablet'); setFigmaMockupMode(false); onClose(); }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  portal === 'gymdash-tablet'
                    ? 'border-blue-500 bg-blue-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-white">GymDash Front-Desk Tablet</div>
                    <div className="text-[10px] text-zinc-400">Turnstile, DTR Clock-In, Float Gate PIN (1234)</div>
                  </div>
                </div>
                {portal === 'gymdash-tablet' && <Check className="h-4 w-4 text-blue-400" />}
              </button>

              <button
                onClick={() => { setPortal('gymdash-os'); setFigmaMockupMode(false); onClose(); }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  portal === 'gymdash-os'
                    ? 'border-indigo-500 bg-indigo-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-white">GymDash Web OS (Commercial Admin)</div>
                    <div className="text-[10px] text-zinc-400">Xendit hybrid splits, member rosters, occupancy</div>
                  </div>
                </div>
                {portal === 'gymdash-os' && <Check className="h-4 w-4 text-indigo-400" />}
              </button>

              <button
                onClick={() => { setPortal('clubdash'); setFigmaMockupMode(false); onClose(); }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  portal === 'clubdash'
                    ? 'border-emerald-500 bg-emerald-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-white">Clubdash Facility OS (Reg B)</div>
                    <div className="text-[10px] text-zinc-400">Court sub-divisions, squatter gate, tournament brackets</div>
                  </div>
                </div>
                {portal === 'clubdash' && <Check className="h-4 w-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => { setPortal('coachdash'); setFigmaMockupMode(false); onClose(); }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  portal === 'coachdash'
                    ? 'border-purple-500 bg-purple-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-white">CoachDash Trainer Hub (Reg C)</div>
                    <div className="text-[10px] text-zinc-400">Program injection, client adherence, compliance nudges</div>
                  </div>
                </div>
                {portal === 'coachdash' && <Check className="h-4 w-4 text-purple-400" />}
              </button>
            </div>
          </div>

          {/* Section 3: Identity & Role Switcher */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
              Active User Persona
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { switchRole('individual'); showToast('Switched identity: Adam Arête (Athlete)'); }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20"
                />
                <div>
                  <div className="text-xs font-bold text-white">Adam Arête</div>
                  <div className="text-[10px] text-zinc-400">Athlete Role</div>
                </div>
              </button>

              <button
                onClick={() => { switchRole('staff'); showToast('Switched identity: Twins Staff Member'); }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-left"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                  TF
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Staff Member</div>
                  <div className="text-[10px] text-zinc-400">Twins Fitness</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 4: Absolute Truth & Database Persistence */}
          <div className="space-y-2.5 rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-extrabold text-white">Database & Absolute Truth</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live & Synced
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Transactions, VIP wallet, food logs, and turnstile check-ins persist locally across reloads.
            </p>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 text-zinc-300">
              <span>Append-Only Ledger:</span>
              <span className="font-mono font-bold text-white">{ledger.length} immutable records</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span>Active Passes:</span>
              <span className="font-mono font-bold text-white">{passes.length} wallet passes</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleExportAudit}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 py-2 text-[11px] font-bold text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Audit JSON</span>
              </button>

              <button
                onClick={handleResetDatabase}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 py-2 text-[11px] font-bold text-rose-300 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Specs</span>
              </button>
            </div>
          </div>

          {/* Section 5: Offline Turnstile Simulation */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              {isOfflineMode ? (
                <WifiOff className="h-5 w-5 text-amber-400" />
              ) : (
                <Wifi className="h-5 w-5 text-emerald-400" />
              )}
              <div>
                <div className="text-xs font-bold text-white">
                  {isOfflineMode ? 'Offline Resilient Mode' : 'Cloud Sync Connected'}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {isOfflineMode
                    ? 'Turnstile fallback to local TOTP cache'
                    : 'Real-time WebSocket & API connection'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isOfflineMode
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/10 text-zinc-300 hover:bg-white/15'
              }`}
            >
              {isOfflineMode ? 'Go Online' : 'Simulate Offline'}
            </button>
          </div>

          {/* Section 6: Launch Flowchart Deep Dives (34 Dives) */}
          <div className="pt-1">
            <button
              onClick={() => { onClose(); onOpenTestbench(); }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl hover:opacity-95 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Launch 34 Flowchart Deep Dives Runner</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 text-center text-[10px] text-zinc-500 font-medium">
          getphysical ecosystem engine · absolute truth verified
        </div>
      </div>
    </div>
  );
};
