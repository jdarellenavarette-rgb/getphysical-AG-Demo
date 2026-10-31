import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  Menu,
  MessageSquare,
  Bell,
  Settings,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Coins,
  Ticket,
  BarChart2,
  Plus,
  Wallet,
  User,
  Wifi,
  Battery,
  Sliders,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { ExactVIPCard } from '../cards/ExactVIPCard';
import { JourneyFeatureModal } from '../journey/JourneyFeatureModal';

interface FigmaDualPhoneViewProps {
  onOpenSettings?: () => void;
  onOpenTestbench?: () => void;
  onSwitchToMobile?: () => void;
}

export const FigmaDualPhoneView: React.FC<FigmaDualPhoneViewProps> = ({
  onOpenSettings,
  onOpenTestbench,
  onSwitchToMobile
}) => {
  const {
    currentUser,
    passes,
    isQRFlapped,
    setIsQRFlapped,
    qrCountdown,
    ledger,
    posts,
    toggleLikePost,
    showToast,
    setSodiaTab
  } = useEcosystem();

  const [activeTabPhone1, setActiveTabPhone1] = useState<'cards' | 'sodia'>('cards');
  const [activeTabPhone2, setActiveTabPhone2] = useState<'cards' | 'sodia'>('sodia');
  const [isSaved, setIsSaved] = useState(false);
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [journeyTab, setJourneyTab] = useState<'overview' | 'journal' | 'timer' | 'reps'>('overview');

  const activePass = passes[0];
  const moePost = posts.find(p => p.authorUsername === 'mowtuscano') || posts[0];

  const handleFlipCard = () => {
    setIsQRFlapped(!isQRFlapped);
    if (!isQRFlapped) {
      showToast('☀️ Screen brightness auto-maximized for optical turnstile scan.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#13171f] py-6 px-4 flex flex-col items-center justify-start select-none overflow-x-auto">
      {/* Top Direct Screen Options Bar ("isipin mo yung option na dapat nasa settings kita sa mismong screen, sa taas") */}
      <div className="w-full max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-2 bg-[#1e2530]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 shadow-xl">
        <div className="flex items-center gap-2">
          {onSwitchToMobile && (
            <button
              onClick={onSwitchToMobile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="Switch to single native responsive mobile view"
            >
              <Smartphone className="h-3.5 w-3.5 text-[#ec4899]" />
              <span>Native Mobile View</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#d946ef] text-white text-xs font-extrabold shadow-md hover:opacity-95 active:scale-95 transition-all"
              title="Open full Executive Settings Modal"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Top Settings & Portals</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>DB Synced ({ledger.length} Tx · {passes.length} Passes)</span>
          </div>
        </div>

        {onOpenTestbench && (
          <button
            onClick={onOpenTestbench}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>34 Flowchart Dives</span>
          </button>
        )}
      </div>

      {/* Figma Dual Phone Presentation Container (Matches image_265ed752.png) */}
      <div className="flex flex-col xl:flex-row items-center justify-center gap-8 md:gap-12 max-w-7xl mx-auto">
        
        {/* ======================================================== */}
        {/* PHONE 1 (LEFT): VIP WALLET & TRANSACTION HISTORY */}
        {/* ======================================================== */}
        <div className="w-[375px] sm:w-[390px] h-[812px] bg-black rounded-[48px] border-[10px] border-[#1e293b] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(59,130,246,0.15)] flex flex-col relative overflow-hidden shrink-0">
          {/* iOS Status Bar */}
          <div className="pt-3 px-7 flex items-center justify-between text-white text-xs font-semibold z-30 select-none">
            <span>9:41 AM</span>
            <div className="flex items-center gap-1.5">
              {/* Cellular 4 bars */}
              <div className="flex items-end gap-[1.5px] h-3">
                <div className="w-[2.5px] h-1.5 bg-white rounded-xs" />
                <div className="w-[2.5px] h-2 bg-white rounded-xs" />
                <div className="w-[2.5px] h-2.5 bg-white rounded-xs" />
                <div className="w-[2.5px] h-3 bg-white rounded-xs" />
              </div>
              <Wifi className="h-3.5 w-3.5" />
              <div className="flex items-center gap-1">
                <span className="text-[10px]">100%</span>
                <div className="w-5 h-2.5 rounded-[4px] border border-white p-[1px] flex items-center">
                  <div className="h-full w-full bg-white rounded-[2px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Top Bar: ☰ getphysical, Message, Bell, Settings */}
          <div className="pt-2 px-5 pb-3 flex items-center justify-between z-30">
            <div className="flex items-center gap-3">
              <Menu className="h-6 w-6 stroke-[2.2] text-white cursor-pointer" />
              <span className="text-xl font-black lowercase tracking-tight text-white">
                getphysical
              </span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="relative">
                <MessageSquare className="h-5 w-5 stroke-[2] cursor-pointer" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#ec4899]" />
              </div>
              <div className="relative">
                <Bell className="h-5 w-5 stroke-[2] cursor-pointer" />
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
              </div>
              <button
                onClick={onOpenSettings}
                title="Settings & Switcher"
                aria-label="Settings"
                className="hover:opacity-80 transition-opacity"
              >
                <Settings className="h-5 w-5 stroke-[2] cursor-pointer" />
              </button>
            </div>
          </div>

          {/* Phone 1 Body: User Greeting & VIP Card Stack */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col justify-between">
            <div className="px-5 pt-1 space-y-4">
              {/* User Avatar + Adam Arête */}
              <div
                onClick={() => {
                  setJourneyTab('overview');
                  setIsJourneyOpen(true);
                }}
                className="flex items-center gap-3.5 cursor-pointer hover:opacity-90 transition-opacity"
                title="Tap to view Adam Arête's Journey"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-white/50 shadow-md"
                />
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {currentUser.name}
                  </h2>
                  <span className="text-[11px] text-[#ec4899] font-bold">Titanium VIP · View Journey →</span>
                </div>
              </div>

              {/* Exact VIP Card */}
              <div className="pt-1">
                <ExactVIPCard
                  pass={activePass}
                  isFlipped={isQRFlapped}
                  onFlip={handleFlipCard}
                  qrCountdown={qrCountdown}
                />
              </div>
            </div>

            {/* Pure White Curved Sheet ("Transaction History") */}
            <div className="mt-4 rounded-t-[38px] bg-white text-black px-5 pt-6 pb-24 shadow-2xl">
              <h3 className="text-lg font-black text-black text-center mb-4 tracking-tight">
                Transaction History
              </h3>

              {/* Transactions List */}
              <div className="space-y-2.5">

                {/* Item 1: Sprout Pickleball Club */}
                <div className="flex items-center justify-between rounded-2xl border border-zinc-150 bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-400/60 bg-orange-50 text-[#f97316]">
                      <MapPin className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-black leading-tight">
                        Sprout Pickleball Club
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-medium">
                        Check-in: Today, 01:32PM
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-black">FREE/PASS</div>
                    <div className="text-[10px] text-zinc-400 font-medium">PHP 999</div>
                  </div>
                </div>

                {/* Item 2: AMP FITNESS SJDM */}
                <div className="flex items-center justify-between rounded-2xl border border-zinc-150 bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-400/60 bg-orange-50 text-[#f97316]">
                      <Coins className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-black leading-tight">
                        AMP FITNESS SJDM
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-medium">
                        Membership: Yesterday, 11:01AM
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-black">MONTHLY</div>
                    <div className="text-[10px] text-zinc-400 font-medium">PHP 799</div>
                  </div>
                </div>

                {/* Item 3: GetPhysical+ */}
                <div className="flex items-center justify-between rounded-2xl border border-zinc-150 bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-purple-400/60 bg-purple-50 text-[#9333ea]">
                      <Ticket className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-black leading-tight">
                        GetPhysical+
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-medium">
                        Subscription: Yesterday, 06:48AM
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-black">MONTHLY</div>
                    <div className="text-[10px] text-zinc-400 font-medium">PHP 149</div>
                  </div>
                </div>
              </div>

              {/* View Full History Button */}
              <div className="pt-4">
                <button
                  onClick={() => showToast('Opening immutable Statement of Account ledger...')}
                  className="w-full mx-auto flex items-center justify-center rounded-full bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#d946ef] py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-pink-500/25 hover:opacity-95 active:scale-95 transition-all"
                >
                  VIEW FULL HISTORY
                </button>
              </div>
            </div>
          </div>

          {/* Phone 1 Floating Bottom Navigation Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-40">
            <div className="rounded-full bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/20 shadow-2xl px-5 py-2 flex items-center justify-between">
              <button
                onClick={() => {
                  setSodiaTab('discover');
                  if (onSwitchToMobile) onSwitchToMobile();
                }}
                className="text-white/80 hover:text-white transition-colors"
                title="Discover"
                aria-label="Discover"
              >
                <MapPin className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  setJourneyTab('overview');
                  setIsJourneyOpen(true);
                }}
                className="text-white/80 hover:text-white transition-colors"
                title="The Journey & Workouts"
                aria-label="The Journey"
              >
                <BarChart2 className="h-5 w-5" />
              </button>

              <div className="relative -translate-y-3">
                <button
                  onClick={() => showToast('Quick Log: Camera & Post creator')}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#ec4899] to-[#d946ef] text-white shadow-xl shadow-pink-600/40 ring-4 ring-black cursor-pointer active:scale-95 transition-transform"
                  aria-label="Create Post"
                >
                  <Plus className="h-6 w-6 stroke-[3]" />
                </button>
              </div>

              <button
                onClick={() => {
                  setSodiaTab('cards');
                  if (onSwitchToMobile) onSwitchToMobile();
                }}
                className="text-[#ec4899]"
                title="VIP Cards & Wallet"
                aria-label="VIP Cards"
              >
                <Wallet className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  setSodiaTab('profile');
                  if (onSwitchToMobile) onSwitchToMobile();
                }}
                className="text-white/80 hover:text-white transition-colors"
                title="Profile & Journey"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PHONE 2 (RIGHT): SODIA IMMERSIVE WORKOUT REEL */}
        {/* ======================================================== */}
        <div className="w-[375px] sm:w-[390px] h-[812px] bg-black rounded-[48px] border-[10px] border-[#1e293b] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(236,72,153,0.15)] flex flex-col relative overflow-hidden shrink-0">
          {/* iOS Status Bar */}
          <div className="pt-3 px-7 flex items-center justify-between text-white text-xs font-semibold z-30 select-none">
            <span>9:41 AM</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-[1.5px] h-3">
                <div className="w-[2.5px] h-1.5 bg-white rounded-xs" />
                <div className="w-[2.5px] h-2 bg-white rounded-xs" />
                <div className="w-[2.5px] h-2.5 bg-white rounded-xs" />
                <div className="w-[2.5px] h-3 bg-white rounded-xs" />
              </div>
              <Wifi className="h-3.5 w-3.5" />
              <div className="flex items-center gap-1">
                <span className="text-[10px]">100%</span>
                <div className="w-5 h-2.5 rounded-[4px] border border-white p-[1px] flex items-center">
                  <div className="h-full w-full bg-white rounded-[2px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Top Bar (Transparent Overlay on Video) */}
          <div className="pt-2 px-5 pb-3 flex items-center justify-between z-30">
            <div className="flex items-center gap-3">
              <Menu className="h-6 w-6 stroke-[2.2] text-white cursor-pointer" />
              <span className="text-xl font-black lowercase tracking-tight text-white">
                getphysical
              </span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="relative">
                <MessageSquare className="h-5 w-5 stroke-[2] cursor-pointer" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#ec4899]" />
              </div>
              <div className="relative">
                <Bell className="h-5 w-5 stroke-[2] cursor-pointer" />
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#ec4899]" />
              </div>
              <button
                onClick={onOpenSettings}
                title="Settings & Switcher"
                aria-label="Settings"
                className="hover:opacity-80 transition-opacity"
              >
                <Settings className="h-5 w-5 stroke-[2] cursor-pointer" />
              </button>
            </div>
          </div>

          {/* Fullscreen Video / Photo Background (Moe Tuscano glute workout) */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80"
              alt="Moe Tuscano Workout"
              className="h-full w-full object-cover object-center filter brightness-[0.88]"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
          </div>

          {/* Right Action Rail (Like, Comment, Share, Save) */}
          <div className="absolute right-3.5 bottom-28 z-20 flex flex-col items-center gap-5">
            {/* Like */}
            <button
              onClick={() => toggleLikePost(moePost.id)}
              className="flex flex-col items-center gap-1 active:scale-75 transition-transform"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full text-white">
                <Heart
                  className={`h-8 w-8 stroke-[1.8] ${
                    moePost.hasLiked ? 'fill-[#ec4899] text-[#ec4899]' : ''
                  }`}
                />
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow-md">Like</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => showToast('Opening comments for @mowtuscano...')}
              className="flex flex-col items-center gap-1 active:scale-75 transition-transform"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full text-white">
                <MessageCircle className="h-8 w-8 stroke-[1.8]" />
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow-md">Comment</span>
            </button>

            {/* Share */}
            <button
              onClick={() => showToast('Workout link copied to clipboard!')}
              className="flex flex-col items-center gap-1 active:scale-75 transition-transform"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full text-white">
                <Share2 className="h-7 w-7 stroke-[1.8]" />
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow-md">Share</span>
            </button>

            {/* Save */}
            <button
              onClick={() => {
                setIsSaved(!isSaved);
                showToast(!isSaved ? 'Saved to collection' : 'Removed from collection');
              }}
              className="flex flex-col items-center gap-1 active:scale-75 transition-transform"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full text-white">
                <Bookmark
                  className={`h-7 w-7 stroke-[1.8] ${
                    isSaved ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
              </div>
              <span className="text-[11px] font-bold text-white drop-shadow-md">Save</span>
            </button>
          </div>

          {/* Bottom Left Creator Overlay (Moe Tuscano) */}
          <div className="absolute left-4 right-16 bottom-24 z-20 space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={moePost.authorAvatar}
                alt={moePost.authorName}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-white/70 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white tracking-tight drop-shadow-md">
                    {moePost.authorName}
                  </span>
                  <div className="h-5 w-5 rounded-full border border-white/40 flex items-center justify-center text-white cursor-pointer hover:bg-white/20">
                    <MoreHorizontal className="h-3 w-3" />
                  </div>
                </div>
                <div className="text-xs text-white/75 font-medium">
                  @{moePost.authorUsername}
                </div>
              </div>
            </div>

            <p className="text-sm font-medium text-white/95 leading-snug drop-shadow-md">
              {moePost.content}
            </p>
          </div>

          {/* Phone 2 Floating Bottom Navigation Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-40">
            <div className="rounded-full bg-black/85 backdrop-blur-xl border border-white/20 shadow-2xl px-5 py-2 flex items-center justify-between">
              <button
                onClick={() => {
                  setSodiaTab('discover');
                  if (onSwitchToMobile) onSwitchToMobile();
                }}
                className="text-white/80 hover:text-white transition-colors"
                title="Discover"
                aria-label="Discover"
              >
                <MapPin className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  setJourneyTab('overview');
                  setIsJourneyOpen(true);
                }}
                className="text-white/80 hover:text-white transition-colors"
                title="The Journey & Workouts"
                aria-label="The Journey"
              >
                <BarChart2 className="h-5 w-5" />
              </button>

              <div className="relative -translate-y-3">
                <button
                  onClick={() => showToast('Quick Log: Camera & Post creator')}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#ec4899] to-[#d946ef] text-white shadow-xl shadow-pink-600/40 ring-4 ring-black cursor-pointer active:scale-95 transition-transform"
                  aria-label="Create Post"
                >
                  <Plus className="h-6 w-6 stroke-[3]" />
                </button>
              </div>

              <button
                onClick={() => {
                  setSodiaTab('cards');
                  if (onSwitchToMobile) onSwitchToMobile();
                }}
                className="text-white/80 hover:text-white transition-colors"
                title="VIP Cards & Wallet"
                aria-label="Cards"
              >
                <Wallet className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  setSodiaTab('profile');
                  if (onSwitchToMobile) onSwitchToMobile();
                }}
                className="text-white/80 hover:text-white transition-colors"
                title="Profile & Journey"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* The Journey Feature Modal */}
      <JourneyFeatureModal
        isOpen={isJourneyOpen}
        onClose={() => setIsJourneyOpen(false)}
        initialTab={journeyTab}
      />
    </div>
  );
};
