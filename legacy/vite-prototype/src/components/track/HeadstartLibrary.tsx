import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import { BookOpen, Sparkles, Dumbbell, Check, Plus, ShieldCheck } from 'lucide-react';

export const HeadstartLibrary: React.FC = () => {
  const { addLiftExercise, showToast } = useEcosystem();

  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardGoal, setWizardGoal] = useState('Strength');
  const [wizardDays, setWizardDays] = useState(4);
  const [wizardEquip, setWizardEquip] = useState('Full Gym');

  const exercises = [
    {
      name: 'Barbell Conventional Deadlift',
      muscle: 'Back & Hamstrings',
      equip: 'Barbell & Plates',
      cues: ['Feet hip-width apart', 'Lats locked down like oranges in armpits', 'Drive floor away through midfoot'],
      mistakes: ['Rounding lumbar spine', 'Hitching at knees']
    },
    {
      name: 'Barbell Back Squat (Low Bar)',
      muscle: 'Legs & Glutes',
      equip: 'Squat Rack & Barbell',
      cues: ['Bar pinned on rear delts', 'Break at hips and knees simultaneously', 'Hit parallel depth'],
      mistakes: ['Knees caving inward', 'Rising chest first on ascent']
    },
    {
      name: 'Flat Barbell Bench Press',
      muscle: 'Chest & Triceps',
      equip: 'Bench & Barbell',
      cues: ['Shoulder blades retracted and depressed', 'Tuck elbows ~45 degrees', 'Pause softly on sternum'],
      mistakes: ['Flaring elbows to 90 degrees', 'Bouncing off chest']
    },
    {
      name: 'Overhead Barbell Military Press',
      muscle: 'Shoulders & Core',
      equip: 'Barbell',
      cues: ['Glutes squeezed tight', 'Bar path travels straight past chin', 'Lockout overhead with head through window'],
      mistakes: ['Excessive backward lumbar lean', 'Incomplete lockout']
    },
    {
      name: 'Romanian Deadlift (RDL)',
      muscle: 'Hamstrings & Glutes',
      equip: 'Barbell / Dumbbells',
      cues: ['Soft knee bend', 'Push hips back toward wall', 'Feel deep stretch in hamstrings'],
      mistakes: ['Squatting down instead of hip hinge']
    }
  ];

  const filtered = selectedMuscle === 'All'
    ? exercises
    : exercises.filter(e => e.muscle.toLowerCase().includes(selectedMuscle.toLowerCase()));

  const handleFinishWizard = () => {
    setIsWizardOpen(false);
    setWizardStep(1);
    showToast(`🏆 Headstart Starter Program generated: ${wizardGoal} (${wizardDays} Days/Wk, ${wizardEquip}). Saved to Periodization calendar!`);
  };

  return (
    <div className="space-y-4">
      {/* Headstart Banner */}
      <div className="rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-900 to-indigo-950 p-5 text-white shadow-xl">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-300">
          <Sparkles className="h-4 w-4" /> Headstart • Learning & Program Engine
        </div>
        <h3 className="mt-1 text-base font-black">Exercise Bank & Starter Wizard</h3>
        <p className="mt-1 text-xs text-purple-200/80">
          Rule-based cues, posture guides, and custom program generator (GP+ verified).
        </p>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="mt-3 flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-purple-950 hover:bg-zinc-100 shadow-md active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          <span>Launch 4-Step Program Wizard</span>
        </button>
      </div>

      {/* Interactive Muscle Group Selector / Body Diagram Cues */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-zinc-800">
          Filter Exercise Bank by Muscle Group
        </span>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {['All', 'Chest', 'Back', 'Legs', 'Shoulders'].map(m => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                selectedMuscle === m
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Exercise Bank Cards */}
        <div className="divide-y divide-zinc-100 space-y-3 pt-2">
          {filtered.map((item, idx) => (
            <div key={idx} className="pt-3 first:pt-0 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-900">{item.name}</h4>
                  <div className="text-[10px] text-zinc-500 font-semibold">
                    {item.muscle} • {item.equip}
                  </div>
                </div>
                <button
                  onClick={() => addLiftExercise(item.name, item.muscle)}
                  className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-800 hover:bg-zinc-200 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add to Workout
                </button>
              </div>

              <div className="rounded-xl bg-zinc-50 p-2 text-[11px] space-y-1">
                <div className="font-bold text-zinc-700">Setup Cues:</div>
                <ul className="list-disc pl-4 text-zinc-600 space-y-0.5">
                  {item.cues.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Program Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-zinc-900">
                Starter Program Wizard (Step {wizardStep}/3)
              </h3>
              <span className="text-[10px] font-bold text-purple-600">GP+ Powered</span>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">What is your primary goal?</label>
                {['Strength & Powerlifting', 'Hypertrophy & Muscle', 'General Athletic Conditioning'].map(g => (
                  <button
                    key={g}
                    onClick={() => {
                      setWizardGoal(g);
                      setWizardStep(2);
                    }}
                    className="w-full rounded-xl border border-zinc-200 p-2.5 text-left text-xs font-bold hover:bg-zinc-50"
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">How many training days per week?</label>
                {[3, 4, 5, 6].map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      setWizardDays(d);
                      setWizardStep(3);
                    }}
                    className="w-full rounded-xl border border-zinc-200 p-2.5 text-left text-xs font-bold hover:bg-zinc-50"
                  >
                    {d} Days / Week
                  </button>
                ))}
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-700">Available Equipment</label>
                {['Full Commercial Gym', 'Barbell & Plates Only', 'Dumbbells & Bodyweight'].map(eq => (
                  <button
                    key={eq}
                    onClick={() => setWizardEquip(eq)}
                    className={`w-full rounded-xl border p-2.5 text-left text-xs font-bold ${
                      wizardEquip === eq ? 'border-zinc-950 bg-zinc-900 text-white' : 'border-zinc-200'
                    }`}
                  >
                    {eq}
                  </button>
                ))}

                <button
                  onClick={handleFinishWizard}
                  className="w-full rounded-2xl bg-purple-700 py-3 text-xs font-black text-white hover:bg-purple-800 shadow-md"
                >
                  Generate & Save Headstart Program
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
