import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Check,
  Calculator,
  Share2,
  X,
  HelpCircle
} from 'lucide-react';
import { StampOverlay } from '../common/StampOverlay';
import { VerifiedStamp } from '../../types';

export const LiftTracker: React.FC = () => {
  const {
    activeLiftWorkout,
    startLiftWorkout,
    toggleLiftSet,
    finishLiftWorkout,
    createPost,
    showToast
  } = useEcosystem();

  const [activeSheet, setActiveSheet] = useState<'timer' | 'table'>('timer');
  const [restSeconds, setRestSeconds] = useState(123);
  const [isResting, setIsResting] = useState(true);
  const totalRest = 180;
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [finishedStamp, setFinishedStamp] = useState<VerifiedStamp | null>(null);
  const [is1RMCalcOpen, setIs1RMCalcOpen] = useState(false);
  const [calcWeight, setCalcWeight] = useState(225);
  const [calcReps, setCalcReps] = useState(5);

  const estimated1RM = Math.round(calcWeight * (1 + calcReps / 30));

  // Current exercise
  const currentEx = activeLiftWorkout.exercises[selectedExerciseIndex] || activeLiftWorkout.exercises[0];

  const handleAdjustTime = (delta: number) => {
    setRestSeconds(s => Math.max(0, s + delta));
  };

  const handleFinish = () => {
    const stamp = finishLiftWorkout();
    setFinishedStamp(stamp);
  };

  const handleShareToSodia = () => {
    if (!finishedStamp) return;
    createPost('Verified RDL set locked in! Clean bar trajectory.', '', undefined, finishedStamp);
    setFinishedStamp(null);
  };

  // SVG circular arc math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (restSeconds / totalRest) * circumference;

  return (
    <div className="space-y-4">
      {/* 7-Day Consistency Weekday Ribbon */}
      <div className="flex items-center justify-between px-2 pt-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          This Week
        </span>
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
          <span>Target: 3/3 sessions</span>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center px-1">
        {[
          { day: 'M', completed: true },
          { day: 'T', completed: false },
          { day: 'W', completed: true },
          { day: 'T', completed: true },
          { day: 'F', completed: false },
          { day: 'S', completed: false },
          { day: 'S', completed: false }
        ].map((item, idx) => (
          <div
            key={idx}
            className={`rounded-2xl py-2 px-1 text-center transition-all ${
              item.completed
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white/80 text-slate-400 border border-slate-100'
            }`}
          >
            <div className="text-[10px] font-bold opacity-80">{item.day}</div>
            <div className="text-xs font-black mt-0.5">{item.completed ? '✓' : '·'}</div>
          </div>
        ))}
      </div>

      {/* Main Workout Showcase / Active Card */}
      <div className="rounded-[32px] bg-white border border-slate-100 p-5 ios-card-floating relative overflow-hidden">
        {/* Card Top Utility Bar */}
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100/80 pb-3">
          <button
            onClick={() => showToast('Reorder exercises')}
            className="hover:text-blue-800 transition-colors"
          >
            Reorder
          </button>
          <span className="text-slate-800 font-mono font-black text-xs">
            15:27 Session
          </span>
          <button
            onClick={() => setIs1RMCalcOpen(true)}
            className="hover:text-blue-800 transition-colors"
          >
            1RM Calc
          </button>
        </div>

        {/* View Toggle: Radial Rest Timer OR Set Table */}
        {activeSheet === 'timer' ? (
          <div className="pt-5 space-y-6">
            {/* Header */}
            <div className="text-center space-y-0.5">
              <h3 className="text-base font-extrabold text-blue-600">Rest</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                180 Seconds Interval
              </p>
            </div>

            {/* Circular Timer Ring with -10 / +10 quick adjust (Reference IMG_3456) */}
            <div className="relative flex items-center justify-center py-2">
              {/* -10s Left Button */}
              <button
                onClick={() => handleAdjustTime(-10)}
                className="absolute left-6 z-10 flex h-11 w-11 flex-col items-center justify-center rounded-full border border-blue-200/80 bg-blue-50/50 text-blue-600 hover:bg-blue-100/60 transition-transform active:scale-90"
                title="Subtract 10 seconds"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black leading-none mt-0.5">10</span>
              </button>

              {/* Central Radial SVG Ring */}
              <div className="relative flex h-44 w-44 items-center justify-center">
                <svg className="h-full w-full rotate-[-90deg]">
                  {/* Background Track */}
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke="#EFF6FF"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  {/* Active Cobalt Sweep */}
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke="#2563EB"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                {/* Center Big Typography */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold tracking-tight text-blue-600 font-sans">
                    {restSeconds}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-blue-500 mt-0.5">
                    Sec
                  </span>
                </div>
              </div>

              {/* +10s Right Button */}
              <button
                onClick={() => handleAdjustTime(10)}
                className="absolute right-6 z-10 flex h-11 w-11 flex-col items-center justify-center rounded-full border border-blue-200/80 bg-blue-50/50 text-blue-600 hover:bg-blue-100/60 transition-transform active:scale-90"
                title="Add 10 seconds"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black leading-none mt-0.5">10</span>
              </button>
            </div>

            {/* Switch to Sets View Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setActiveSheet('table')}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100/70 transition-all active:scale-95 shadow-xs"
              >
                <span>Track weight & reps</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Exercise Preview Card (Smith Machine / Barbell RDL) */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-xs bg-[#d9f99d] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-900">
                    Up Next
                  </span>
                  <h4 className="text-sm font-black text-blue-600 mt-1">
                    {currentEx.name}
                  </h4>
                </div>

                <div className="flex gap-2 text-center">
                  <div className="rounded-xl bg-white border border-slate-200/70 px-2.5 py-1.5">
                    <div className="text-xs font-black text-blue-600">8</div>
                    <div className="text-[8px] font-bold uppercase text-slate-400">Reps</div>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200/70 px-2.5 py-1.5">
                    <div className="text-xs font-black text-blue-600">2/3</div>
                    <div className="text-[8px] font-bold uppercase text-slate-400">Set</div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-blue-600/80 bg-blue-50/70 rounded-lg px-2.5 py-1">
                PREV: 225 LBS × 4 REPS (RPE 9.5)
              </div>
            </div>

            {/* Audio-Style Workout Player Bar (Reference IMG_3456) */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-blue-600">
              <button
                onClick={() => showToast('Opening exercise form breakdown')}
                className="flex flex-col items-center gap-0.5 text-[10px] font-bold hover:text-blue-800"
              >
                <Sparkles className="h-4 w-4" />
                <span>LEARN</span>
              </button>

              <button
                onClick={() => setSelectedExerciseIndex(Math.max(0, selectedExerciseIndex - 1))}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Previous exercise"
              >
                <SkipBack className="h-5 w-5 fill-current" />
              </button>

              <button
                onClick={() => setIsResting(!isResting)}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-transform active:scale-95 shadow-sm"
              >
                {isResting ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => setSelectedExerciseIndex((selectedExerciseIndex + 1) % activeLiftWorkout.exercises.length)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Next exercise"
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </button>

              <button
                onClick={() => showToast('Exercise swapped with alternative')}
                className="flex flex-col items-center gap-0.5 text-[10px] font-bold hover:text-blue-800"
              >
                <RotateCcw className="h-4 w-4" />
                <span>SWAP</span>
              </button>
            </div>
          </div>
        ) : (
          /* Table View: Track Weight & Reps (Reference IMG_3452) */
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveSheet('timer')}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Timer
              </button>
              <button
                onClick={handleFinish}
                className="text-xs font-black uppercase text-blue-600 hover:text-blue-800 tracking-wider"
              >
                Finish & Save
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-blue-600">
                {currentEx.name}
              </h3>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span>TODAY, OCT 28</span>
                <span className="rounded bg-pink-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-pink-600">
                  Current
                </span>
              </div>
            </div>

            {/* Tabular Sets Table */}
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-xs">
              {/* Header */}
              <div className="grid grid-cols-12 bg-slate-50/80 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <span className="col-span-2">SET</span>
                <span className="col-span-3 text-center">LBS</span>
                <span className="col-span-1 text-center"></span>
                <span className="col-span-3 text-center">REPS</span>
                <span className="col-span-3 text-right pr-2">RPE</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {currentEx.sets.map((s, idx) => {
                  const isCurrentActive = idx === 1; // Set 2 current active
                  return (
                    <div
                      key={s.setNumber}
                      onClick={() => toggleLiftSet(selectedExerciseIndex, idx)}
                      className={`grid grid-cols-12 items-center px-3 py-3 text-xs font-bold cursor-pointer transition-colors ${
                        isCurrentActive ? 'bg-blue-50/30 border-l-3 border-pink-500' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <span className="col-span-2 font-mono text-blue-600 font-extrabold">
                        {s.setNumber}
                      </span>

                      <div className="col-span-3 flex justify-center">
                        <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-blue-600 font-black">
                          {s.weight}
                        </span>
                      </div>

                      <span className="col-span-1 text-center text-slate-300 font-bold">×</span>

                      <div className="col-span-3 flex justify-center">
                        <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-blue-600 font-black">
                          {s.reps}
                        </span>
                      </div>

                      <div className="col-span-3 flex items-center justify-end gap-1.5 pr-1">
                        <span className="font-mono text-blue-600 font-black">
                          {s.setNumber === 1 ? '7' : s.setNumber === 2 ? '8' : '1-10'}
                        </span>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full transition-all ${
                            s.isCompleted
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Apple Health integration badge (Reference IMG_3453) */}
            <div className="flex items-center justify-between pt-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-700 shadow-2xs">
                <span>❤️ Works with <strong>Apple Health</strong></span>
              </div>
              <button
                onClick={() => showToast('Opening past history logs')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                See Full History ➔
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1RM Calculator Modal */}
      {is1RMCalcOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-blue-600">Epley 1RM Calculator</h3>
              <button onClick={() => setIs1RMCalcOpen(false)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Weight (LBS)</label>
                <input
                  type="number"
                  value={calcWeight}
                  onChange={e => setCalcWeight(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-center text-sm font-black text-blue-600 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Reps Done</label>
                <input
                  type="number"
                  value={calcReps}
                  onChange={e => setCalcReps(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-center text-sm font-black text-blue-600 font-mono"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50/70 p-4 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Estimated 1RM</div>
              <div className="text-3xl font-extrabold text-blue-600">{estimated1RM} LBS</div>
            </div>

            <button
              onClick={() => setIs1RMCalcOpen(false)}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              Apply as Target
            </button>
          </div>
        </div>
      )}

      {/* Finished Stamp Modal */}
      {finishedStamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-2xl text-center space-y-4">
            <h3 className="text-base font-extrabold text-blue-600">Workout Completed!</h3>
            <p className="text-xs text-slate-500">
              Verified stamp generated directly from your logged sets:
            </p>

            <div className="flex justify-center py-2">
              <StampOverlay stamp={finishedStamp} />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFinishedStamp(null)}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={handleShareToSodia}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 flex items-center justify-center gap-1 shadow-sm"
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
