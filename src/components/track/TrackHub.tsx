import React, { useState } from 'react';
import { Dumbbell, Activity, UtensilsCrossed, BookOpen, Sparkles, ChevronRight, Clock, Heart } from 'lucide-react';
import { LiftTracker } from './LiftTracker';
import { MoveTracker } from './MoveTracker';
import { FoodTracker } from './FoodTracker';
import { HeadstartLibrary } from './HeadstartLibrary';
import { JourneyFeatureModal } from '../journey/JourneyFeatureModal';

export const TrackHub: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'lift' | 'move' | 'food' | 'headstart'>('lift');
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [journeyInitialTab, setJourneyInitialTab] = useState<'overview' | 'journal' | 'timer' | 'reps'>('overview');

  const segments = [
    { id: 'lift', label: 'Lift', icon: <Dumbbell className="h-4 w-4" /> },
    { id: 'move', label: 'Move', icon: <Activity className="h-4 w-4" /> },
    { id: 'food', label: 'Food', icon: <UtensilsCrossed className="h-4 w-4" /> },
    { id: 'headstart', label: 'Headstart', icon: <BookOpen className="h-4 w-4" /> }
  ] as const;

  const handleOpenJourney = (tab: 'overview' | 'journal' | 'timer' | 'reps' = 'overview') => {
    setJourneyInitialTab(tab);
    setIsJourneyOpen(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-3 pb-28 space-y-4 select-none">
      
      {/* "Today" Summary Strip (Spec Phase 5 Header Rule) */}
      <div className="flex items-center justify-between rounded-2xl bg-zinc-900 border border-white/10 px-4 py-2.5 text-white shadow-md text-xs">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-zinc-400">Workouts</div>
          <div className="font-black text-amber-400">3 / 3 This Wk</div>
        </div>
        <div className="h-6 w-px bg-zinc-800" />
        <div>
          <div className="text-[9px] uppercase tracking-wider text-zinc-400">Calories Rem.</div>
          <div className="font-black text-emerald-400">550 kcal</div>
        </div>
        <div className="h-6 w-px bg-zinc-800" />
        <div>
          <div className="text-[9px] uppercase tracking-wider text-zinc-400">Weekly Dist.</div>
          <div className="font-black text-blue-400">18.4 km</div>
        </div>
      </div>

      {/* Featured Entry to The Journey (Lifestyle, Rest Timer, Weight Tracking, Journal) */}
      <div
        onClick={() => handleOpenJourney('overview')}
        className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-black border border-blue-500/30 text-white cursor-pointer hover:border-blue-400 transition-all active:scale-[0.99] shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">The Journey</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold uppercase">
                Feature
              </span>
            </div>
            <p className="text-[11px] text-zinc-300">
              18,702 active min · Rest timer · Daily gratitude
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-blue-400">
          <span>Open</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* Segmented Top Toggle: Lift | Move | Food | Headstart */}
      <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10 text-xs font-bold text-zinc-400">
        {segments.map((seg) => (
          <button
            key={seg.id}
            onClick={() => setActiveSegment(seg.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
              activeSegment === seg.id
                ? 'bg-white text-zinc-950 font-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {seg.icon}
            <span>{seg.label}</span>
          </button>
        ))}
      </div>

      {/* Render Active Engine */}
      {activeSegment === 'lift' && <LiftTracker />}
      {activeSegment === 'move' && <MoveTracker />}
      {activeSegment === 'food' && <FoodTracker />}
      {activeSegment === 'headstart' && <HeadstartLibrary />}

      {/* Journey Feature Modal */}
      <JourneyFeatureModal
        isOpen={isJourneyOpen}
        onClose={() => setIsJourneyOpen(false)}
        initialTab={journeyInitialTab}
      />
    </div>
  );
};
