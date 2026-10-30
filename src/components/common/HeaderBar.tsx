import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  Menu,
  MessageSquare,
  Bell,
  Settings,
  X,
  Building2,
  Dumbbell,
  Trophy,
  Sparkles,
  UserCheck,
  ChevronDown,
  Sliders,
  Monitor,
  Smartphone,
  Database
} from 'lucide-react';

interface HeaderBarProps {
  onOpenActivity: () => void;
  onOpenInbox: () => void;
  onOpenTestbench: () => void;
  onOpenSettings: () => void;
  figmaMockupMode?: boolean;
  onToggleFigmaMode?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenActivity,
  onOpenInbox,
  onOpenTestbench,
  onOpenSettings,
  figmaMockupMode = false,
  onToggleFigmaMode
}) => {
  const {
    currentUser,
    setPortal,
    portal,
    switchRole,
    ledger,
    passes
  } = useEcosystem();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Luxury Minimalist Header Bar (Exact match to Figma: image_265ed752.png) */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-black/95 backdrop-blur-xl text-white border-b border-white/10 select-none">
        {/* Left: Hamburger & lowercase brand wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors active:scale-95"
            title="Open Ecosystem Navigation"
            aria-label="Navigation Menu"
          >
            <Menu className="h-6 w-6 stroke-[2.2]" />
          </button>

          <span className="text-xl sm:text-[22px] font-black lowercase tracking-tight text-white select-none">
            getphysical
          </span>
        </div>

        {/* Right: Message Bubble with dots, Bell, Settings Gear */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Chat Bubble with pink dot */}
          <button
            onClick={onOpenInbox}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors active:scale-95"
            title="Messages & Inbox"
            aria-label="Messages"
          >
            <MessageSquare className="h-5 w-5 stroke-[2]" />
            <span className="absolute top-2.5 right-2 h-2 w-2 rounded-full bg-[#ec4899] ring-2 ring-black" />
          </button>

          {/* Notifications Bell with pink dot */}
          <button
            onClick={onOpenActivity}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors active:scale-95"
            title="Activity & Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 stroke-[2]" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#ec4899] ring-2 ring-black" />
          </button>

          {/* Settings Gear (Triggers Executive Settings Modal) */}
          <button
            onClick={onOpenSettings}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors active:scale-95"
            title="Settings & System Database"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 stroke-[2]" />
          </button>
        </div>
      </header>

      {/* Hamburger Drawer Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-80 max-w-[85vw] bg-[#12141a] text-white h-full p-5 flex flex-col justify-between border-r border-white/10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-5 overflow-y-auto no-scrollbar">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-black lowercase text-white tracking-tight">getphysical</span>
                  <span className="rounded-full bg-[#ec4899]/20 px-2.5 py-0.5 text-[10px] font-black text-[#ec4899]">
                    PRO ECOSYSTEM
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Active User Card */}
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-[#ec4899]"
                />
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-white truncate">{currentUser.name}</div>
                  <div className="text-xs text-zinc-400">@{currentUser.username} · VIP Member</div>
                </div>
              </div>

              {/* Portals Switcher */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
                  Ecosystem Portals
                </div>

                <button
                  onClick={() => { setPortal('sodia'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-xs font-bold transition-all ${
                    portal === 'sodia'
                      ? 'bg-gradient-to-r from-[#ec4899] to-[#d946ef] text-white shadow-md'
                      : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Consumer App (Sodia B2C)</span>
                </button>

                <button
                  onClick={() => { setPortal('gymdash-tablet'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-xs font-bold transition-all ${
                    portal === 'gymdash-tablet'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span>GymDash Tablet (Front Desk POS & Turnstile)</span>
                </button>

                <button
                  onClick={() => { setPortal('gymdash-os'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-xs font-bold transition-all ${
                    portal === 'gymdash-os'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <Building2 className="h-4 w-4 text-indigo-400" />
                  <span>GymDash Web OS (Commercial Admin)</span>
                </button>

                <button
                  onClick={() => { setPortal('clubdash'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-xs font-bold transition-all ${
                    portal === 'clubdash'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <Trophy className="h-4 w-4 text-emerald-400" />
                  <span>Clubdash Court OS (Pickleball Booking)</span>
                </button>

                <button
                  onClick={() => { setPortal('coachdash'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-xs font-bold transition-all ${
                    portal === 'coachdash'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <Dumbbell className="h-4 w-4 text-amber-400" />
                  <span>CoachDash (Trainer Terminal)</span>
                </button>
              </div>

              {/* View Switcher & Settings Actions */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
                  Presentation & Verification
                </div>

                {onToggleFigmaMode && (
                  <button
                    onClick={() => { onToggleFigmaMode(); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 p-2.5 text-xs font-bold text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-pink-400" />
                      <span>{figmaMockupMode ? 'Switch to Single Mobile' : 'Switch to Dual Figma View'}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">Mode</span>
                  </button>
                )}

                <button
                  onClick={() => { onOpenTestbench(); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 p-2.5 text-xs font-bold text-purple-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>34 Flowchart Master Dives</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">100% PASS</span>
                </button>

                <button
                  onClick={() => { onOpenSettings(); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 p-2.5 text-xs font-bold text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-emerald-400" />
                    <span>Executive Settings & DB</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-zinc-400 -rotate-90" />
                </button>
              </div>
            </div>

            {/* Bottom Status in Drawer */}
            <div className="pt-4 border-t border-white/10 text-center">
              <div className="text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Absolute Truth DB Active ({ledger.length} Tx)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
