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

export type MoveSportType = "run" | "cycling" | "walk" | "hike" | "pickleball" | "tennis" | "boxing" | "basketball" | "swimming" | "hiit" | "rowing" | "yoga";

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
  elevationM: number;
  avgBpm: number;
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
}

const INITIAL_PROGRAMS: TrainingProgram[] = [
  {
    id: "prog_ppl",
    title: "NASM Athletic Hypertrophy Split",
    description: "3-Day Push/Pull/Legs periodized for muscle mass & core stability.",
    days: [
      {
        id: "day_push",
        dayName: "Day 1: Upper Push",
        exercises: [
          { name: "Barbell Incline Bench Press", sets: 4, reps: 8, weightKg: 85 },
          { name: "Dumbbell Shoulder Press", sets: 3, reps: 10, weightKg: 28 },
          { name: "Cable Chest Flyes", sets: 3, reps: 12, weightKg: 20 },
        ],
      },
      {
        id: "day_pull",
        dayName: "Day 2: Posterior Pull",
        exercises: [
          { name: "Conventional Deadlift", sets: 3, reps: 5, weightKg: 180 },
          { name: "Barbell Bent-Over Row", sets: 4, reps: 8, weightKg: 90 },
          { name: "Weighted Pull-Ups", sets: 3, reps: 8, weightKg: 15 },
        ],
      },
      {
        id: "day_legs",
        dayName: "Day 3: Lower Body Power",
        exercises: [
          { name: "Barbell Back Squat", sets: 4, reps: 6, weightKg: 140 },
          { name: "Romanian Deadlift", sets: 3, reps: 10, weightKg: 110 },
          { name: "Standing Calf Raises", sets: 4, reps: 15, weightKg: 60 },
        ],
      },
    ],
  },
];

const INITIAL_BIOMETRICS: UserBiometrics = {
  age: 26,
  gender: "male",
  heightCm: 178,
  weightKg: 82,
  activityLevel: "heavy",
  goal: "hypertrophy",
  bmr: 1815,
  tdee: 2720,
  bmi: 25.9,
};

export const useTrackingStore = create<TrackingState>((set) => ({
  liftSessions: [
    {
      id: "lift_seed_1",
      title: "Heavy Pull & Posterior Chain",
      date: new Date(Date.now() - 7200000).toISOString(),
      durationSeconds: 3120,
      exercises: [
        {
          id: "ex_1",
          name: "Conventional Deadlift",
          sets: [
            { setNumber: 1, weight: 140, reps: 5, isCompleted: true },
            { setNumber: 2, weight: 180, reps: 3, isCompleted: true },
            { setNumber: 3, weight: 225, reps: 1, isCompleted: true },
          ],
        },
      ],
      totalVolumeKg: 1465,
      totalSets: 3,
      isPR: true,
    },
  ],
  moveActivities: [
    {
      id: "move_seed_1",
      sport: "run",
      title: "BGC Greenway Strava 5K Loop",
      date: new Date(Date.now() - 86400000).toISOString(),
      durationSeconds: 1680,
      distanceKm: 5.02,
      paceMinKm: "5:34",
      avgSpeedKmH: 10.7,
      caloriesBurned: 342,
      routeCoords: [[14.5492, 121.0487], [14.551, 121.0505], [14.553, 121.052], [14.5512, 121.0482]],
      elevationM: 24,
      avgBpm: 154,
    },
  ],
  foodMeals: [],
  savedPrograms: INITIAL_PROGRAMS,
  userBiometrics: INITIAL_BIOMETRICS,
  hydrationLiters: 1.75,
  dailyTargets: { calories: 2650, protein: 180, carbs: 280, fat: 72, hydration: 3.0 },


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
      dailyTargets: targets ? { ...state.dailyTargets, ...targets } : state.dailyTargets,
    })),

  deleteFoodMeal: (id) => set((state) => ({ foodMeals: state.foodMeals.filter((m) => m.id !== id) })),
  clearFoodMeals: () => set({ foodMeals: [] }),
  addHydration: (liters) =>
    set((state) => ({ hydrationLiters: Math.min(6, Math.max(0, +(state.hydrationLiters + liters).toFixed(2))) })),
}));
