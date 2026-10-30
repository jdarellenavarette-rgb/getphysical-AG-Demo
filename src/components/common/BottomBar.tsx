import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import { MapPin, BarChart2, Plus, Wallet, User, Dumbbell, Sparkles, QrCode } from 'lucide-react';
import { CreatePostModal } from '../sodia/CreatePostModal';

export const BottomBar: React.FC = () => {
  const { sodiaTab, setSodiaTab, setIsQRFlapped, showToast } = useEcosystem();
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const handleCenterPlusClick = () => {
    // Quick action trigger or toggle create
    setIsQuickCreateOpen(true);
  };

  return (
    <>
      <nav className="fixed bottom-4 left-4 right-4 max-w-sm sm:max-w-md mx-auto z-40">
        <div className="rounded-full bg-[#141417]/95 backdrop-blur-2xl border border-white/20 shadow-2xl px-6 py-2.5 flex items-center justify-between">
          {/* 1. Discover / Map Pin */}
          <button
            onClick={() => setSodiaTab('discover')}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center transition-all ${
              sodiaTab === 'discover' ? 'text-white scale-110' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Discover Map & Venues"
            aria-label="Discover"
          >
            <MapPin className="h-6 w-6 stroke-[2]" />
          </button>

          {/* 2. Track / Stats (BarChart2) */}
          <button
            onClick={() => setSodiaTab('track')}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center transition-all ${
              sodiaTab === 'track' ? 'text-white scale-110' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Track Workouts & Cardio"
            aria-label="Track Workouts"
          >
            <BarChart2 className="h-6 w-6 stroke-[2]" />
          </button>

          {/* 3. Center Elevated Gradient Plus Button */}
          <div className="relative -translate-y-3.5 flex items-center justify-center">
            <button
              onClick={handleCenterPlusClick}
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#f43f5e] via-[#ec4899] to-[#c026d3] text-white shadow-xl shadow-pink-500/35 ring-4 ring-black transition-transform active:scale-95 hover:scale-105"
              title="Quick Log / Create Post"
              aria-label="Create or Quick Action"
            >
              <Plus className="h-7 w-7 stroke-[3] transition-transform group-hover:rotate-90 duration-200" />
            </button>
          </div>

          {/* 4. Cards / Wallet */}
          <button
            onClick={() => setSodiaTab('cards')}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center transition-all ${
              sodiaTab === 'cards' ? 'text-white scale-110' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="VIP Wallet & Statement of Account"
            aria-label="Cards Wallet"
          >
            <Wallet className="h-6 w-6 stroke-[2]" />
          </button>

          {/* 5. User Profile / Journey */}
          <button
            onClick={() => setSodiaTab('profile')}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center transition-all ${
              sodiaTab === 'profile' ? 'text-white scale-110' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="User Profile & History"
            aria-label="User Profile"
          >
            <User className="h-6 w-6 stroke-[2]" />
          </button>
        </div>
      </nav>

      {/* Quick Action Modal when tapping center Plus button */}
      {isQuickCreateOpen && (
        <CreatePostModal onClose={() => setIsQuickCreateOpen(false)} />
      )}
    </>
  );
};
