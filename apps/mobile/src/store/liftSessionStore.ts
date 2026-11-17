import { create } from "zustand";
import type { LoggedSet } from "./trackingStore";

/** A new session starts with untouched sets; nothing counts until it is ticked. */
export const BLANK_SETS: LoggedSet[] = [
  { setNumber: 1, weight: 60, reps: 5, isCompleted: false },
  { setNumber: 2, weight: 60, reps: 5, isCompleted: false },
  { setNumber: 3, weight: 60, reps: 5, isCompleted: false },
];

interface LiftSessionState {
  isTraining: boolean;
  workoutTitle: string;
  exerciseName: string;
  sets: LoggedSet[];
  /** When the workout started (ms). The clock is derived from this, so it cannot drift. */
  startedAt: number | null;
  /** When the current rest period ends (ms), or null when not resting. */
  restUntil: number | null;
  /** Bumped for every new session so the set rows start from fresh typed values. */
  sessionId: number;
  setWorkoutTitle: (title: string) => void;
  setExerciseName: (name: string) => void;
  setSets: (update: (sets: LoggedSet[]) => LoggedSet[]) => void;
  setRestUntil: (restUntil: number | null) => void;
  start: (title: string | undefined, exerciseName: string | undefined, sets: LoggedSet[]) => void;
  end: () => void;
}

/**
 * The workout in progress. It lives outside the screen so switching tab, or
 * opening messages mid-set, does not throw the session away.
 */
export const useLiftSessionStore = create<LiftSessionState>((set) => ({
  isTraining: false,
  workoutTitle: "",
  exerciseName: "",
  sets: BLANK_SETS,
  startedAt: null,
  restUntil: null,
  sessionId: 0,

  setWorkoutTitle: (workoutTitle) => set({ workoutTitle }),
  setExerciseName: (exerciseName) => set({ exerciseName }),
  setSets: (update) => set((state) => ({ sets: update(state.sets) })),
  setRestUntil: (restUntil) => set({ restUntil }),

  start: (title, exerciseName, sets) =>
    set((state) => ({
      isTraining: true,
      workoutTitle: title ?? state.workoutTitle,
      exerciseName: exerciseName ?? "",
      sets,
      startedAt: Date.now(),
      restUntil: null,
      sessionId: state.sessionId + 1,
    })),

  end: () =>
    set((state) => ({
      isTraining: false,
      workoutTitle: "",
      exerciseName: "",
      sets: BLANK_SETS,
      startedAt: null,
      restUntil: null,
      sessionId: state.sessionId + 1,
    })),
}));
