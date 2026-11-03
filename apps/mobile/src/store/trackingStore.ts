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

export interface TrackingState {
  liftSessions: LiftSession[];
  moveActivities: MoveActivity[];
  foodMeals: LoggedMeal[];
  hydrationLiters: number;
  dailyTargets: { calories: number; protein: number; carbs: number; fat: number; hydration: number };
  saveLiftSession: (session: Omit<LiftSession, "id" | "date">) => LiftSession;
  saveMoveActivity: (act: Omit<MoveActivity, "id" | "date">) => MoveActivity;
  saveFoodMeal: (meal: Omit<LoggedMeal, "id" | "date">) => LoggedMeal;
  deleteFoodMeal: (id: string) => void;
  clearFoodMeals: () => void;
  addHydration: (liters: number) => void;
}

const INITIAL_LIFTS: LiftSession[] = [
  {
    id: "lift_seed_1",
    title: "Heavy Pull & Posterior Chain",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    durationSeconds: 3120,
    exercises: [
      {
        id: "ex_1",
        name: "Conventional Deadlift",
        targetCategory: "Heavy 1-5 RM",
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
];

const INITIAL_MOVES: MoveActivity[] = [
  {
    id: "move_seed_1",
    sport: "run",
    title: "BGC Greenway Strava 5K Loop",
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    durationSeconds: 1680,
    distanceKm: 5.02,
    paceMinKm: "5:34",
    avgSpeedKmH: 10.7,
    caloriesBurned: 342,
    routeCoords: [
      [14.5492, 121.0487],
      [14.551, 121.0505],
      [14.553, 121.052],
      [14.5545, 121.0508],
      [14.552, 121.0482],
      [14.5492, 121.0487],
    ],
    elevationM: 24,
    avgBpm: 154,
  },
];

const INITIAL_MEALS: LoggedMeal[] = [
  {
    id: "meal_seed_1",
    name: "Whey Isolate & Blueberries",
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    totalCal: 220,
    totalP: 30,
    totalC: 18,
    totalF: 2,
    items: [
      { name: "Whey Protein Isolate", portion: "1 scoop (32g)", cal: 130, p: 26, c: 2, f: 1 },
      { name: "Fresh Blueberries", portion: "1 cup (148g)", cal: 84, p: 1, c: 21, f: 0.5 },
    ],
    oracleNotes: "Optimized fast-absorbing amino acid spike for recovery.",
  },
  {
    id: "meal_seed_2",
    name: "Grilled Chicken Breast & Jasmine Rice",
    date: new Date(Date.now() - 3600000 * 1).toISOString(),
    totalCal: 580,
    totalP: 52,
    totalC: 68,
    totalF: 8,
    items: [
      { name: "Boneless Skinless Chicken Breast", portion: "200g cooked", cal: 330, p: 48, c: 0, f: 5 },
      { name: "Steamed Jasmine Rice", portion: "1.5 cups cooked", cal: 310, p: 6, c: 68, f: 1 },
    ],
    oracleNotes: "High satiety lean protein with glycogen-replenishing clean carbs.",
  },
];

export const useTrackingStore = create<TrackingState>((set) => ({
  liftSessions: INITIAL_LIFTS,
  moveActivities: INITIAL_MOVES,
  foodMeals: INITIAL_MEALS,
  hydrationLiters: 1.75,
  dailyTargets: { calories: 2600, protein: 180, carbs: 260, fat: 70, hydration: 3.0 },

  saveLiftSession: (sessionData) => {
    const session: LiftSession = {
      ...sessionData,
      id: `lift_${Date.now()}`,
      date: new Date().toISOString(),
    };
    set((state) => ({ liftSessions: [session, ...state.liftSessions] }));
    return session;
  },

  saveMoveActivity: (actData) => {
    const act: MoveActivity = {
      ...actData,
      id: `move_${Date.now()}`,
      date: new Date().toISOString(),
    };
    set((state) => ({ moveActivities: [act, ...state.moveActivities] }));
    return act;
  },

  saveFoodMeal: (mealData) => {
    const meal: LoggedMeal = {
      ...mealData,
      id: `meal_${Date.now()}`,
      date: new Date().toISOString(),
    };
    set((state) => ({ foodMeals: [meal, ...state.foodMeals] }));
    return meal;
  },

  deleteFoodMeal: (id) =>
    set((state) => ({ foodMeals: state.foodMeals.filter((m) => m.id !== id) })),

  clearFoodMeals: () => set({ foodMeals: [] }),

  addHydration: (liters) =>
    set((state) => ({
      hydrationLiters: Math.min(6, Math.max(0, +(state.hydrationLiters + liters).toFixed(2))),
    })),
}));
