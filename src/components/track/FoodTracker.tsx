import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  UtensilsCrossed,
  Droplet,
  Search,
  Scan,
  Plus,
  Trash2,
  Share2,
  Calculator,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { StampOverlay } from '../common/StampOverlay';
import { VerifiedStamp } from '../../types';

export const FoodTracker: React.FC = () => {
  const {
    foodLogs,
    hydrationLiters,
    addHydration,
    logFoodItem,
    parseNutritionixQuery,
    createPost,
    showToast
  } = useEcosystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Array<{ name: string; cal: number; p: number; c: number; f: number }> | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCal, setManualCal] = useState(350);
  const [manualP, setManualP] = useState(25);
  const [manualC, setManualC] = useState(40);
  const [manualF, setManualF] = useState(10);
  const [isNASMCalcOpen, setIsNASMCalcOpen] = useState(false);
  const [foodStampModal, setFoodStampModal] = useState<VerifiedStamp | null>(null);

  // Targets
  const targetCalories = 2400;
  const targetProtein = 180;
  const targetCarbs = 250;
  const targetFats = 70;

  // Totals
  const totalCalories = foodLogs.reduce((acc, f) => acc + f.calories, 0);
  const totalProtein = foodLogs.reduce((acc, f) => acc + f.protein, 0);
  const totalCarbs = foodLogs.reduce((acc, f) => acc + f.carbs, 0);
  const totalFats = foodLogs.reduce((acc, f) => acc + f.fats, 0);

  const handleSearchNLP = () => {
    if (!searchQuery.trim()) return;
    const results = parseNutritionixQuery(searchQuery);
    setParsedPreview(results);
  };

  const handleCommitNLPItems = () => {
    if (!parsedPreview) return;
    parsedPreview.forEach(item => {
      logFoodItem({
        name: item.name,
        serving: '1 Standard Serving',
        calories: item.cal,
        protein: item.p,
        carbs: item.c,
        fats: item.f,
        mealType: 'lunch'
      });
    });
    setParsedPreview(null);
    setSearchQuery('');
  };

  const handleShareDailyMacros = () => {
    const stamp: VerifiedStamp = {
      id: 'stmp_macro_' + Date.now(),
      type: 'food',
      timestamp: 'Today, Daily Total',
      title: 'CLOSED DAILY MACROS',
      primaryMetric: `${totalCalories} / ${targetCalories} KCAL`,
      subMetrics: [
        `Protein: ${totalProtein}g (${Math.round((totalProtein / targetProtein) * 100)}%)`,
        `Carbs: ${totalCarbs}g • Fats: ${totalFats}g`,
        `Hydration: ${hydrationLiters}L / 3.0L Target`
      ],
      isVerified: true
    };
    setFoodStampModal(stamp);
  };

  const handlePostStamp = () => {
    if (!foodStampModal) return;
    createPost('Hit 100% of my nutrition and hydration targets today! 🥗🥩', '', undefined, foodStampModal);
    setFoodStampModal(null);
  };

  return (
    <div className="space-y-4">
      {/* 1. Macro Dash Widgets (Section 5.1) */}
      <div className="rounded-[28px] bg-white p-5 ios-card-shadow border border-white/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#2563EB] tracking-tight">
              Daily Macro Dashboard
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Automatic balance · NASM metabolic calculation</p>
          </div>
          <button
            onClick={() => setIsNASMCalcOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:text-blue-700 transition-colors"
          >
            <Calculator className="h-3.5 w-3.5" /> Targets
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2.5 text-center">
          <div className="rounded-2xl bg-slate-50/80 p-3">
            <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Calories</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums tracking-tight">{totalCalories}</div>
            <div className="text-[9px] text-slate-400 font-medium">/{targetCalories}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50/60 p-3">
            <div className="text-[9px] uppercase tracking-wider font-bold text-emerald-600">Protein</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums tracking-tight">{totalProtein}g</div>
            <div className="text-[9px] text-emerald-600/70 font-medium">/{targetProtein}g</div>
          </div>
          <div className="rounded-2xl bg-amber-50/60 p-3">
            <div className="text-[9px] uppercase tracking-wider font-bold text-amber-600">Carbs</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums tracking-tight">{totalCarbs}g</div>
            <div className="text-[9px] text-amber-600/70 font-medium">/{targetCarbs}g</div>
          </div>
          <div className="rounded-2xl bg-rose-50/60 p-3">
            <div className="text-[9px] uppercase tracking-wider font-bold text-rose-500">Fats</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums tracking-tight">{totalFats}g</div>
            <div className="text-[9px] text-rose-500/70 font-medium">/{targetFats}g</div>
          </div>
        </div>

        {/* Hydration Tracker Row */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 p-3.5 border border-blue-100/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <Droplet className="h-5 w-5 fill-blue-600" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-blue-950">
                Hydration: {hydrationLiters} / 3.0 L
              </div>
              <div className="text-[10px] text-blue-700/80 font-medium">Daily optimal hydration window</div>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => addHydration(0.25)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 shadow-xs border border-blue-100 transition-all"
            >
              + 250ml
            </button>
            <button
              onClick={() => addHydration(0.5)}
              className="rounded-full bg-[#2563EB] px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-all"
            >
              + 500ml
            </button>
          </div>
        </div>
      </div>

      {/* 2. Nutritionix NLP Search Bar & Barcode Scanner */}
      <div className="rounded-[28px] bg-white p-5 ios-card-shadow border border-white/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#2563EB] tracking-tight">
            Nutritionix Natural Language Food Log
          </span>
          <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> NLP Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchNLP()}
              placeholder='Try "2 boiled eggs and 1 cup rice" or "chicken salad"...'
              className="w-full rounded-2xl bg-slate-50 pl-10 pr-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            onClick={() => showToast('Opening Barcode Scanner native camera simulation...')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
            title="Scan UPC Barcode"
          >
            <Scan className="h-4 w-4" />
          </button>

          <button
            onClick={handleSearchNLP}
            className="rounded-2xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all"
          >
            Parse
          </button>
        </div>

        {/* NLP Preview Items Result */}
        {parsedPreview && (
          <div className="rounded-2xl bg-purple-50/70 border border-purple-200/60 p-3.5 space-y-2 animate-in fade-in">
            <div className="text-[11px] font-bold text-purple-900">
              Parsed {parsedPreview.length} items from NLP:
            </div>
            <div className="space-y-1">
              {parsedPreview.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-purple-950 font-medium">
                  <span>{item.name}</span>
                  <span className="font-mono font-bold">
                    {item.cal} kcal · P: {item.p}g · C: {item.c}g · F: {item.f}g
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={handleCommitNLPItems}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 py-2.5 text-xs font-extrabold text-white transition-colors"
            >
              Log All Items to Daily Ledger
            </button>
          </div>
        )}

        {/* "My Meals" Quick-Log Slider Pills (Section 5.1) */}
        <div>
          <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
            One-Tap "My Meals"
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() =>
                logFoodItem({
                  name: 'Morning Oats + Whey',
                  serving: '1 bowl',
                  calories: 450,
                  protein: 35,
                  carbs: 55,
                  fats: 8,
                  mealType: 'breakfast'
                })
              }
              className="shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-800 transition-colors"
            >
              🥣 Morning Oats (450 kcal)
            </button>
            <button
              onClick={() =>
                logFoodItem({
                  name: 'Post-Workout Shake',
                  serving: '500ml',
                  calories: 280,
                  protein: 40,
                  carbs: 20,
                  fats: 3,
                  mealType: 'snack'
                })
              }
              className="shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-800 transition-colors"
            >
              🥤 Post-Workout Shake (280 kcal)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Daily Food Log History */}
      <div className="rounded-[28px] bg-white p-5 ios-card-shadow border border-white/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#2563EB] tracking-tight">
            Today's Logged Items
          </span>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-blue-700"
          >
            <Plus className="h-3 w-3" /> Manual Add
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {foodLogs.map(item => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-xs font-bold text-slate-900">{item.name}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {item.serving} · P: {item.protein}g · C: {item.carbs}g · F: {item.fats}g
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-900 tabular-nums">{item.calories}</span>
                <span className="text-[10px] text-slate-400 ml-1 font-medium">kcal</span>
              </div>
            </div>
          ))}
        </div>

        {/* Ecosystem Hook: Share Daily Macros Button */}
        <button
          onClick={handleShareDailyMacros}
          className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-[#2563EB] hover:bg-blue-700 py-3 text-xs font-extrabold text-white ios-card-shadow transition-all"
        >
          <Share2 className="h-4 w-4" /> Share Daily Macros (Food Stamp)
        </button>
      </div>

      {/* Manual Food Add Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-black text-zinc-900">Manual Food Entry</h3>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Food Name</label>
              <input
                type="text"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="e.g. Ribeye Steak"
                className="mt-1 w-full rounded-xl border border-zinc-300 p-2 text-xs font-bold"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[9px] font-bold text-zinc-400 uppercase">Calories</label>
                <input
                  type="number"
                  value={manualCal}
                  onChange={e => setManualCal(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-1.5 text-center text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-emerald-600 uppercase">Protein</label>
                <input
                  type="number"
                  value={manualP}
                  onChange={e => setManualP(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-1.5 text-center text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-amber-600 uppercase">Carbs</label>
                <input
                  type="number"
                  value={manualC}
                  onChange={e => setManualC(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-1.5 text-center text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-rose-600 uppercase">Fats</label>
                <input
                  type="number"
                  value={manualF}
                  onChange={e => setManualF(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-1.5 text-center text-xs font-bold"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="flex-1 rounded-xl bg-zinc-100 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logFoodItem({
                    name: manualName || 'Custom Food',
                    serving: '1 Custom Portion',
                    calories: manualCal,
                    protein: manualP,
                    carbs: manualC,
                    fats: manualF,
                    mealType: 'dinner'
                  });
                  setIsManualModalOpen(false);
                  setManualName('');
                }}
                className="flex-1 rounded-xl bg-zinc-950 py-2 text-xs font-bold text-white hover:bg-zinc-800"
              >
                Save & Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NASM Target Calculator Modal (Section 5.1) */}
      {isNASMCalcOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-black text-zinc-900">NASM BMR & TDEE Calculator</h3>
            <p className="text-xs text-zinc-500">
              Formulas based on Mifflin-St Jeor & activity multipliers.
            </p>
            <div className="rounded-2xl bg-zinc-50 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Basal Metabolic Rate (BMR):</span>
                <strong>1,780 kcal</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Daily Expenditure (TDEE):</span>
                <strong>2,450 kcal</strong>
              </div>
              <div className="flex justify-between font-bold text-indigo-700">
                <span>Recommended Calorie Target:</span>
                <span>2,400 kcal (Lean Bulk)</span>
              </div>
            </div>
            <button
              onClick={() => {
                showToast('NASM daily targets applied to your profile!');
                setIsNASMCalcOpen(false);
              }}
              className="w-full rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white"
            >
              Apply Targets
            </button>
          </div>
        </div>
      )}

      {/* Food Stamp Share Modal */}
      {foodStampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl text-center space-y-4">
            <h3 className="text-base font-black text-zinc-900">Closed Daily Macro Stamp</h3>
            <div className="flex justify-center py-2">
              <StampOverlay stamp={foodStampModal} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFoodStampModal(null)}
                className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={handlePostStamp}
                className="flex-1 rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 flex items-center justify-center gap-1"
              >
                <Share2 className="h-3.5 w-3.5" /> Post to Sodia Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
