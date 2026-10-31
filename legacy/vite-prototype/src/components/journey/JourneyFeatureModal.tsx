import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Share2,
  Trash2,
  Edit3,
  ChevronRight,
  Sparkles,
  Calendar,
  Check,
  Flame,
  ChevronDown,
  Info,
  Scale,
  Award
} from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

interface JourneyFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'overview' | 'journal' | 'timer' | 'reps';
}

export const JourneyFeatureModal: React.FC<JourneyFeatureModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'overview'
}) => {
  const { showToast } = useEcosystem();

  const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'timer' | 'reps'>(initialTab);
  
  // Timer state (Reference IMG_3456 / IMG_3453)
  const [restSeconds, setRestSeconds] = useState(123);
  const [maxRestSeconds, setMaxRestSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Weight & Reps state (Reference IMG_3452)
  const [sets, setSets] = useState([
    { set: 1, lbs: 10, reps: 10, rpe: 7, isDone: true },
    { set: 2, lbs: 10, reps: 9, rpe: 8, isDone: true },
    { set: 3, lbs: 10, reps: 10, rpe: 8, isDone: false },
  ]);

  // Weigh-in state (Reference IMG_3457)
  const [currentWeight, setCurrentWeight] = useState(152);
  const [isWeighInOpen, setIsWeighInOpen] = useState(false);
  const [tempWeight, setTempWeight] = useState('152');

  // Journal entries state (Reference IMG_3455)
  const [journalEntries, setJournalEntries] = useState([
    {
      id: 'j1',
      date: 'FEB 17, 2025',
      type: 'quote',
      text: '“My mission in life is not merely to survive, but to thrive; and to do so with some passion, some compassion, some humor, and some style.” —Maya Angelou'
    },
    {
      id: 'j2',
      date: 'FEB 16, 2025',
      type: 'gratitude',
      items: ['Sunshine 🌻☀️', 'My friends and family!']
    }
  ]);
  const [newGratitudeText, setNewGratitudeText] = useState('');
  const [isAddingGratitude, setIsAddingGratitude] = useState(false);

  // Timer countdown hook
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      showToast('⏰ Rest period complete! Time for the next set.');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, restSeconds, showToast]);

  if (!isOpen) return null;

  const handleAdjustTimer = (delta: number) => {
    setRestSeconds((prev) => Math.max(0, Math.min(prev + delta, 600)));
  };

  const handleAddGratitude = () => {
    if (!newGratitudeText.trim()) return;
    setJournalEntries((prev) => [
      {
        id: `j_${Date.now()}`,
        date: 'TODAY',
        type: 'gratitude',
        items: [newGratitudeText.trim()]
      },
      ...prev
    ]);
    setNewGratitudeText('');
    setIsAddingGratitude(false);
    showToast('✨ Added to gratitude journal!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg h-[92vh] max-h-[820px] rounded-[36px] bg-[#0c1017] text-white border border-white/20 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar with Tab Switcher */}
        <div className="px-5 pt-4 pb-3 border-b border-white/10 shrink-0 bg-[#121824]/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-black tracking-tight text-white">
                  The Journey <span className="text-xs font-semibold text-blue-400">Feature</span>
                </h3>
                <p className="text-[10px] text-zinc-400">Holistic performance & mindfulness</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
              title="Close Journey Feature"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Sub-tab pills (Exact visual match to feature modules) */}
          <div className="grid grid-cols-4 gap-1 bg-black/50 p-1 rounded-2xl border border-white/10 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === 'journal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Journal
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === 'timer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Rest Timer
            </button>
            <button
              onClick={() => setActiveTab('reps')}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === 'reps'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Reps & Sets
            </button>
          </div>
        </div>

        {/* Feature Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          
          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW (Reference IMG_3457) */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Massive Metric Card */}
              <div className="rounded-[32px] bg-gradient-to-b from-white to-blue-50/80 p-6 text-slate-900 text-center relative overflow-hidden shadow-xl border border-white/40">
                <div className="absolute top-3 left-4 text-amber-300 font-mono text-xl select-none">☀</div>
                <div className="absolute top-3 right-4 text-amber-300 font-mono text-xl select-none">☀</div>

                <div className="text-xs font-black text-blue-600 tracking-wide uppercase">
                  Your Journey
                </div>

                <div className="text-5xl font-black tracking-tight text-blue-600 mt-1 font-sans">
                  18,702
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                  Total Active Min
                </div>

                <div className="mt-5 grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200 pt-3">
                  <div>
                    <div className="text-2xl font-black text-blue-600">350</div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Workouts
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-blue-600">53:43</div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Avg. Duration
                    </div>
                  </div>
                </div>
              </div>

              {/* Cobalt Blue Container: History & Weight Trend (IMG_3457) */}
              <div className="rounded-[32px] bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] p-5 text-white space-y-5 shadow-xl">
                {/* History Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-white text-sm">History</span>
                    <button
                      onClick={() => showToast('Opening complete workout history logs')}
                      className="text-white/80 hover:text-white font-bold"
                    >
                      View all
                    </button>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab('reps');
                      showToast('Opening exercise details');
                    }}
                    className="flex items-center gap-3.5 rounded-2xl bg-white p-3 text-slate-900 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl shrink-0">
                      🧘‍♀️
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Daily Workouts
                      </div>
                      <div className="text-sm font-extrabold text-blue-600">Complete Core</div>
                      <div className="text-[11px] text-slate-500 font-medium">Abs & Stability · 24 min</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Weight Trend Line Chart */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-white text-sm">Weight</span>
                    <button
                      onClick={() => setIsWeighInOpen(true)}
                      className="text-white/90 hover:text-white font-bold underline cursor-pointer"
                    >
                      Weigh in
                    </button>
                  </div>

                  <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Trend
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-blue-600">{currentWeight} lbs</span>
                        <span className="text-[10px] text-emerald-600 font-bold ml-1.5">-11 lbs</span>
                      </div>
                    </div>

                    {/* SVG Line Graph */}
                    <div className="relative h-20 w-full pt-1">
                      <svg className="h-full w-full overflow-visible" viewBox="0 0 300 60">
                        <path
                          d="M 30,20 L 150,45 L 270,30"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx="30" cy="20" r="4" fill="#2563EB" />
                        <text x="30" y="10" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2563EB">
                          163
                        </text>

                        <circle cx="150" cy="45" r="4" fill="#2563EB" />
                        <text x="150" y="38" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2563EB">
                          148
                        </text>

                        <circle cx="270" cy="30" r="10" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" />
                        <circle cx="270" cy="30" r="4" fill="#2563EB" />
                      </svg>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-slate-400 px-2 pt-1 border-t border-slate-100">
                      <span>Feb 20</span>
                      <span>Apr 8</span>
                      <span>May 14</span>
                    </div>
                  </div>
                </div>

                {/* Progress Pics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-white text-sm">Progress Pics</span>
                    <button
                      onClick={() => showToast('Opening photo album')}
                      className="text-white/80 hover:text-white font-bold"
                    >
                      View all
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-square rounded-2xl bg-white/20 border border-white/30 overflow-hidden shadow-xs">
                      <img
                        src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80"
                        alt="Progress 1"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-2xl bg-white/20 border border-white/30 overflow-hidden shadow-xs">
                      <img
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80"
                        alt="Progress 2"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => showToast('📷 Camera opened for new progress pic')}
                      className="aspect-square rounded-2xl bg-white/10 border-2 border-dashed border-white/40 flex flex-col items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="text-[9px] font-black uppercase mt-1">Add Photo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: JOURNAL (Reference IMG_3455) */}
          {/* ======================================================== */}
          {activeTab === 'journal' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Journal Hero Pink/Purple Gradient Banner */}
              <div className="relative rounded-[32px] bg-gradient-to-tr from-[#fbcfe8] via-[#e9d5ff] to-[#c7d2fe] p-6 text-blue-600 shadow-xl overflow-hidden min-h-[170px] flex flex-col justify-between">
                <span className="text-lg font-black tracking-tight">Journal</span>
                <div className="text-right">
                  <span className="block text-3xl sm:text-4xl font-light text-white/90 lowercase tracking-wide italic">
                    it's a
                  </span>
                  <span className="block text-4xl sm:text-5xl font-black text-white/90 lowercase tracking-tight -mt-1">
                    beautiful
                  </span>
                  <span className="block text-3xl sm:text-4xl font-light text-white/90 lowercase tracking-tight -mt-1">
                    day to be
                  </span>
                  <span className="block text-5xl sm:text-6xl font-black text-blue-600 lowercase tracking-tighter -mt-2">
                    alive
                  </span>
                </div>
              </div>

              {/* Journal Quote Card */}
              <div className="rounded-2xl bg-white p-5 text-slate-800 shadow-md border border-slate-100 space-y-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  FEB 17, 2025
                </div>
                <p className="text-sm font-semibold text-blue-600 leading-relaxed">
                  “My mission in life is not merely to survive, but to thrive; and to do so with some passion, some compassion, some humor, and some style.” —Maya Angelou
                </p>
                <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-blue-600 text-xs">
                  <button onClick={() => showToast('Editing quote note')} className="hover:opacity-80">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => showToast('Note deleted')} className="hover:opacity-80">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                  <button onClick={() => showToast('Share link copied')} className="hover:opacity-80 ml-auto">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Gratitude List Card */}
              <div className="rounded-2xl bg-white p-5 text-slate-800 shadow-md border border-slate-100 space-y-3 relative">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  FEB 16, 2025 · DAILY GRATITUDE
                </div>
                <div className="space-y-2 text-sm font-bold text-blue-600">
                  <div className="flex items-center gap-3 p-2 bg-blue-50/60 rounded-xl">
                    <span className="font-mono text-xs text-blue-400">1</span>
                    <span>Sunshine 🌻☀️</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-50/60 rounded-xl">
                    <span className="font-mono text-xs text-blue-400">2</span>
                    <span>My friends and family!</span>
                  </div>
                </div>

                {isAddingGratitude ? (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="What are you grateful for today?"
                      value={newGratitudeText}
                      onChange={(e) => setNewGratitudeText(e.target.value)}
                      className="flex-1 rounded-xl border border-blue-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={handleAddGratitude}
                      className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingGratitude(true)}
                    className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                    title="Add gratitude note"
                  >
                    <Plus className="h-5 w-5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: REST TIMER (Reference IMG_3456 & IMG_3453) */}
          {/* ======================================================== */}
          {activeTab === 'timer' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="rounded-[32px] bg-white text-slate-900 p-6 shadow-xl border border-slate-100 flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-xs font-bold text-blue-600 mb-2">
                  <button onClick={() => showToast('Reordering sets')} className="hover:underline">
                    REORDER
                  </button>
                  <span className="font-mono text-sm text-slate-800">15:27</span>
                  <button onClick={() => showToast('Timer settings')} className="hover:underline">
                    SETTINGS
                  </button>
                </div>

                <div className="text-center mt-2">
                  <div className="text-sm font-extrabold text-blue-600">Rest</div>
                  <div className="text-[10px] font-black uppercase text-slate-400">
                    {maxRestSeconds} SECONDS
                  </div>
                </div>

                {/* Circular Progress Timer */}
                <div className="relative my-6 flex items-center justify-center">
                  <svg className="w-48 h-48 -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#f1f5f9"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#2563EB"
                      strokeWidth="8"
                      strokeDasharray={502}
                      strokeDashoffset={502 - (502 * restSeconds) / maxRestSeconds}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-300"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black text-blue-600 font-sans tracking-tight">
                      {restSeconds}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      SEC
                    </span>
                  </div>

                  {/* Quick -10s / +10s side buttons */}
                  <button
                    onClick={() => handleAdjustTimer(-10)}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 transition-colors shadow-2xs"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => handleAdjustTimer(+10)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 transition-colors shadow-2xs"
                  >
                    +10
                  </button>
                </div>

                {/* Track Weight & Reps Link Pill */}
                <button
                  onClick={() => setActiveTab('reps')}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors mb-4"
                >
                  <span>Track weight & reps</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                {/* Up Next Card */}
                <div className="w-full rounded-2xl bg-slate-50 p-3 border border-slate-100 flex items-center gap-3">
                  <div className="flex-1">
                    <span className="px-2 py-0.5 rounded-md bg-lime-300 text-slate-900 text-[9px] font-black uppercase">
                      UP NEXT
                    </span>
                    <h4 className="text-sm font-extrabold text-blue-600 mt-1">Barbell RDL</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-bold">
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">8 REPS</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">2/3 SET</span>
                    </div>
                  </div>
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80"
                      alt="Barbell RDL"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Media Playback Controls */}
                <div className="w-full flex items-center justify-between pt-5 px-3 border-t border-slate-100 mt-4 text-blue-600">
                  <button onClick={() => showToast('Opening exercise tutorial video')} className="flex flex-col items-center text-[10px] font-bold">
                    <Sparkles className="h-4 w-4" />
                    <span>LEARN</span>
                  </button>
                  <button onClick={() => handleAdjustTimer(-30)} className="p-2 hover:bg-blue-50 rounded-full">
                    ⏮
                  </button>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-transform active:scale-95"
                  >
                    {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </button>
                  <button onClick={() => handleAdjustTimer(+30)} className="p-2 hover:bg-blue-50 rounded-full">
                    ⏭
                  </button>
                  <button onClick={() => showToast('Swapped with alternate exercise')} className="flex flex-col items-center text-[10px] font-bold">
                    <RotateCcw className="h-4 w-4" />
                    <span>SWAP</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: REPS & SETS TRACKER (Reference IMG_3452) */}
          {/* ======================================================== */}
          {activeTab === 'reps' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="rounded-[32px] bg-white text-slate-900 p-6 shadow-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-black text-blue-600">
                    Glute dominant barbell RDL
                  </h4>
                  <button
                    onClick={() => showToast('Weights and sets saved to ledger!')}
                    className="text-xs font-black text-blue-600 uppercase hover:underline"
                  >
                    SAVE
                  </button>
                </div>

                <div className="text-[11px] font-medium text-slate-400 mb-4">
                  Last weight: <span className="font-bold text-blue-600">10 lbs × 9 reps (8 rpe)</span>
                </div>

                {/* Current Date Session Header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-black uppercase text-slate-700">APRIL 22, 2026</span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#ec4899] text-[9px] font-extrabold uppercase">
                    CURRENT
                  </span>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  <span>SET</span>
                  <span>LBS</span>
                  <span>REPS</span>
                  <span>RPE</span>
                </div>

                {/* Sets Rows */}
                <div className="space-y-2.5 pt-2">
                  {sets.map((s, idx) => (
                    <div
                      key={s.set}
                      className={`grid grid-cols-4 gap-2 items-center text-center p-2 rounded-xl transition-all ${
                        s.isDone ? 'bg-blue-50/70 text-blue-600 font-black' : 'bg-slate-50 text-slate-700 font-bold'
                      }`}
                    >
                      <span className="text-sm font-black">{s.set}</span>
                      <input
                        type="number"
                        value={s.lbs}
                        onChange={(e) => {
                          const newSets = [...sets];
                          newSets[idx].lbs = parseInt(e.target.value) || 0;
                          setSets(newSets);
                        }}
                        className="w-full text-center bg-transparent border-b border-blue-200 text-sm font-black text-blue-600 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={s.reps}
                        onChange={(e) => {
                          const newSets = [...sets];
                          newSets[idx].reps = parseInt(e.target.value) || 0;
                          setSets(newSets);
                        }}
                        className="w-full text-center bg-transparent border-b border-blue-200 text-sm font-black text-blue-600 focus:outline-none"
                      />
                      <span className="text-sm font-black text-blue-600">{s.rpe}</span>
                    </div>
                  ))}
                </div>

                {/* Add Set Button */}
                <button
                  onClick={() => {
                    const nextNum = sets.length + 1;
                    setSets([...sets, { set: nextNum, lbs: 10, reps: 10, rpe: 8, isDone: false }]);
                    showToast(`Added Set ${nextNum}`);
                  }}
                  className="w-full mt-4 flex items-center justify-center gap-1 py-2.5 rounded-xl border border-dashed border-blue-300 text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Set</span>
                </button>

                {/* Past Logs Accordion */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    APRIL 2, 2026 (PREVIOUS SESSION)
                  </div>
                  <div className="text-xs text-slate-600 font-semibold space-y-1">
                    <div>Set 1: 10 lbs × 10 reps (RPE 7)</div>
                    <div>Set 2: 10 lbs × 10 reps (RPE 7)</div>
                    <div>Set 3: 10 lbs × 10 reps (RPE 8)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#121824]/90 flex items-center justify-between text-xs font-bold text-zinc-400">
          <span>Synced with Apple Health & Nascent OS</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-all"
          >
            Done
          </button>
        </div>

      </div>

      {/* Weigh-in Mini Dialog */}
      {isWeighInOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl space-y-3 text-slate-900">
            <h4 className="text-sm font-extrabold text-blue-600">Daily Weigh-In</h4>
            <p className="text-xs text-slate-500">Updates your trendline and NASM calorie baseline.</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tempWeight}
                onChange={(e) => setTempWeight(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-2 text-center text-lg font-black text-blue-600 font-mono"
              />
              <span className="text-xs font-bold text-slate-400">LBS</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setIsWeighInOpen(false)}
                className="flex-1 rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCurrentWeight(parseInt(tempWeight) || 152);
                  setIsWeighInOpen(false);
                  showToast(`Weighed in at ${tempWeight} lbs. Chart updated!`);
                }}
                className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
