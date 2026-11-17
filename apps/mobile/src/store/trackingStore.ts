import { create } from "zustand";

export interface LoggedSet {
  setNumber: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export interface LoggedExercise {
  id: string;
  name: string;
  targetCategory?: string;
  sets: LoggedSet[];
}

export interface LiftSession {
  id: string;
  title: string;
  date: string;
  durationSeconds: number;
  exercises: LoggedExercise[];
  totalVolumeKg: number;
  totalSets: number;
  isPR?: boolean;
}

export type MoveSportType =
  | "run"
  | "cycling"
  | "walk"
  | "hike"
  | "pickleball"
  | "tennis"
  | "boxing"
  | "basketball"
  | "swimming"
  | "hiit"
  | "rowing"
  | "yoga";

export interface MoveActivity {
  id: string;
  sport: MoveSportType;
  title: string;
  date: string;
  durationSeconds: number;
  distanceKm: number;
  paceMinKm: string;
  avgSpeedKmH?: number;
  caloriesBurned: number;
  routeCoords: [number, number][];
  /** Only set when a sensor actually reported it. */
  elevationM?: number;
  avgBpm?: number;
}

export interface FoodItemBreakdown {
  name: string;
  portion: string;
  cal: number;
  p: number;
  c: number;
  f: number;
}

export interface LoggedMeal {
  id: string;
  name: string;
  date: string;
  totalCal: number;
  totalP: number;
  totalC: number;
  totalF: number;
  items: FoodItemBreakdown[];
  oracleNotes?: string;
}

export interface ProgramExercise {
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
}

export interface ProgramDay {
  id: string;
  dayName: string;
  exercises: ProgramExercise[];
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  days: ProgramDay[];
}

export interface UserBiometrics {
  age: number;
  gender: "male" | "female";
  heightCm: number;
  weightKg: number;
  activityLevel: "sedentary" | "light" | "moderate" | "heavy" | "athlete";
  goal: "hypertrophy" | "fat_loss" | "strength" | "endurance" | "maintenance";
  bmr: number;
  tdee: number;
  bmi: number;
}

export interface TrackingState {
  liftSessions: LiftSession[];
  moveActivities: MoveActivity[];
  foodMeals: LoggedMeal[];
  savedPrograms: TrainingProgram[];
  userBiometrics: UserBiometrics;
  hydrationLiters: number;
  dailyTargets: { calories: number; protein: number; carbs: number; fat: number; hydration: number };
  saveLiftSession: (session: Omit<LiftSession, "id" | "date">) => LiftSession;
  saveMoveActivity: (act: Omit<MoveActivity, "id" | "date">) => MoveActivity;
  saveFoodMeal: (meal: Omit<LoggedMeal, "id" | "date">) => LoggedMeal;
  saveProgram: (prog: TrainingProgram) => void;
  updateBiometrics: (bio: Partial<UserBiometrics>, targets?: TrackingState["dailyTargets"]) => void;
  deleteFoodMeal: (id: string) => void;
  clearFoodMeals: () => void;
  addHydration: (liters: number) => void;
  /** True once the person has entered their own body metrics. */
  hasSetBiometrics: boolean;
  resetTracking: () => void;
}

/**
 * Neutral starting values so the calculators have something to work from.
 * `hasSetBiometrics` stays false until the person enters their own.
 */
const DEFAULT_BIOMETRICS: UserBiometrics = {
  age: 30,
  gender: "male",
  heightCm: 170,
  weightKg: 70,
  activityLevel: "moderate",
  goal: "maintenance",
  bmr: 0,
  tdee: 0,
  bmi: 0,
};

const DEFAULT_TARGETS = { calories: 2000, protein: 120, carbs: 250, fat: 65, hydration: 2.5 };

export const useTrackingStore = create<TrackingState>((set) => ({
  liftSessions: [],
  moveActivities: [],
  foodMeals: [],
  savedPrograms: [],
  userBiometrics: DEFAULT_BIOMETRICS,
  hasSetBiometrics: false,
  hydrationLiters: 0,
  dailyTargets: DEFAULT_TARGETS,

  resetTracking: () =>
    set({
      liftSessions: [],
      moveActivities: [],
      foodMeals: [],
      savedPrograms: [],
      userBiometrics: DEFAULT_BIOMETRICS,
      hasSetBiometrics: false,
      hydrationLiters: 0,
      dailyTargets: DEFAULT_TARGETS,
    }),

  saveLiftSession: (data) => {
    const s: LiftSession = { ...data, id: `lift_${Date.now()}`, date: new Date().toISOString() };
    set((state) => ({ liftSessions: [s, ...state.liftSessions] }));
    return s;
  },

  saveMoveActivity: (data) => {
    const a: MoveActivity = { ...data, id: `move_${Date.now()}`, date: new Date().toISOString() };
    set((state) => ({ moveActivities: [a, ...state.moveActivities] }));
    return a;
  },

  saveFoodMeal: (data) => {
    const m: LoggedMeal = { ...data, id: `meal_${Date.now()}`, date: new Date().toISOString() };
    set((state) => ({ foodMeals: [m, ...state.foodMeals] }));
    return m;
  },

  saveProgram: (prog) =>
    set((state) => ({ savedPrograms: [prog, ...state.savedPrograms.filter((p) => p.id !== prog.id)] })),

  updateBiometrics: (bio, targets) =>
    set((state) => ({
      userBiometrics: { ...state.userBiometrics, ...bio },
      hasSetBiometrics: true,
      dailyTargets: targets ? { ...state.dailyTargets, ...targets } : state.dailyTargets,
    })),

  deleteFoodMeal: (id) => set((state) => ({ foodMeals: state.foodMeals.filter((m) => m.id !== id) })),
  clearFoodMeals: () => set({ foodMeals: [] }),
  addHydration: (liters) =>
    set((state) => ({ hydrationLiters: Math.min(6, Math.max(0, +(state.hydrationLiters + liters).toFixed(2))) })),
}));
