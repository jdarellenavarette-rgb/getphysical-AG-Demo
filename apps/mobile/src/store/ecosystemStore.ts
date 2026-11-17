import { create } from "zustand";
import {
  SEED_FACILITIES,
  SEED_PASSES,
  SEED_CHALLENGES,
  SEED_POSTS,
  type FacilityRow,
  type PassRow,
  type SodiaPostRow,
  type PRChallengeRow,
  type ProfileRow,
  type UserRole,
} from "sodia-core";
import type { PassPurchase } from "../lib/passDisplay";

export interface MobileEcosystemState {
  currentRole: UserRole;
  profile: ProfileRow;
  /** Replace the guest profile with the signed-in user's real profile. */
  setProfile: (profile: ProfileRow) => void;
  /** Clears everything belonging to the previous session (sign-out, or switching account). */
  resetSession: () => void;
  facilities: readonly FacilityRow[];
  passes: readonly PassRow[];
  /** Purchase details per pass id, so receipts and statements show real amounts. */
  purchases: Readonly<Record<string, PassPurchase>>;
  posts: readonly SodiaPostRow[];
  challenges: readonly PRChallengeRow[];
  userStory: { image: string; text?: string; createdAt: string } | null;
  isOffline: boolean;
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;
  activeWorkout: {
    title: string;
    durationSeconds: number;
    isActive: boolean;
    restTimerSeconds: number;
    isResting: boolean;
  };
  setRole: (role: UserRole) => void;
  toggleOffline: () => void;
  startRestTimer: (seconds?: number) => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  stopRestTimer: () => void;
  addPost: (content: string, facilityId?: string, stamp?: SodiaPostRow["stamp"], mediaUrl?: string | null) => void;
  deletePost: (postId: string) => void;
  addUserStory: (image: string, text?: string) => void;
  startWorkout: (title?: string) => void;
  finishWorkout: () => void;
  loadDemoData: () => void;
  resetToEmpty: () => void;
}

/** Nobody is signed in: an empty profile with no roles beyond a regular member. */
export const GUEST_PROFILE: ProfileRow = {
  id: "guest",
  username: "guest",
  first_name: "Guest",
  last_name: "",
  avatar: null,
  avatar_url: null,
  cover_url: null,
  bio: null,
  dob: null,
  home_location: null,
  user_roles: ["individual"],
  is_private: false,
  streak_goal_per_week: null,
  default_launch_tab: "sodia",
  soft_deleted_at: null,
  created_at: null,
  updated_at: null,
  active_role: "individual",
  roles: ["individual"],
  phone_hash: null,
  streak_weeks: 0,
  streak_goal: null,
  streak_freeze_available: false,
  weights: null,
  metrics: null,
  name: "Guest",
  coach_plan: "FREE",
};

const IDLE_WORKOUT = { title: "", durationSeconds: 0, isActive: false, restTimerSeconds: 0, isResting: false };

/** Purchase details for the seeded demo passes. */
const SEED_PURCHASES: Record<string, PassPurchase> = {
  pass_vip_001: { baseAmountPhp: 250, billingKind: "one_time_pass", facilityName: "Metro Core Arena", isPreview: true },
  pass_vip_002: {
    baseAmountPhp: 200,
    billingKind: "one_time_pass",
    facilityName: "Nexus Racket & Court Club",
    isPreview: true,
  },
};

export const useEcosystemStore = create<MobileEcosystemState>((set) => ({
  currentRole: "individual",
  profile: GUEST_PROFILE,
  setProfile: (profile) => set({ profile }),
  resetSession: () =>
    set({
      profile: GUEST_PROFILE,
      currentRole: "individual",
      passes: [],
      purchases: {},
      posts: [],
      challenges: [],
      userStory: null,
      activeWorkout: IDLE_WORKOUT,
    }),
  facilities: SEED_FACILITIES,
  passes: [],
  purchases: {},
  posts: [],
  challenges: [],
  userStory: null,
  isOffline: false,
  isGuest: false,
  setIsGuest: (isGuest) => set({ isGuest }),
  activeWorkout: {
    title: "",
    durationSeconds: 0,
    isActive: false,
    restTimerSeconds: 0,
    isResting: false,
  },

  setRole: (role) => set({ currentRole: role }),
  toggleOffline: () => set((state) => ({ isOffline: !state.isOffline })),

  startRestTimer: (seconds = 90) =>
    set((state) => ({
      activeWorkout: {
        ...state.activeWorkout,
        restTimerSeconds: seconds,
        isResting: true,
      },
    })),

  adjustRestTimer: (delta) =>
    set((state) => ({
      activeWorkout: {
        ...state.activeWorkout,
        restTimerSeconds: Math.max(0, state.activeWorkout.restTimerSeconds + delta),
      },
    })),

  stopRestTimer: () =>
    set((state) => ({
      activeWorkout: { ...state.activeWorkout, isResting: false },
    })),

  startWorkout: (title = "Full Body Push/Pull") =>
    set({
      activeWorkout: {
        title,
        durationSeconds: 1,
        isActive: true,
        restTimerSeconds: 0,
        isResting: false,
      },
    }),

  finishWorkout: () =>
    set({
      activeWorkout: {
        title: "",
        durationSeconds: 0,
        isActive: false,
        restTimerSeconds: 0,
        isResting: false,
      },
    }),

  addPost: (content, facilityId, stamp, mediaUrl) =>
    set((state) => {
      const facility = state.facilities.find((f) => f.id === facilityId);
      const newPost: SodiaPostRow = {
        id: `post_${Date.now()}`,
        user_id: state.profile.id,
        author_name: `${state.profile.first_name ?? ""} ${state.profile.last_name ?? ""}`.trim(),
        author_avatar: state.profile.avatar_url,
        author_role: state.currentRole,
        content,
        media_url: mediaUrl ?? null,
        likes_count: 0,
        comments_count: 0,
        facility_tag: facility
          ? {
              id: facility.id,
              name: facility.name,
              registry: facility.registry,
              actionCTA: facility.registry === "A" ? "Drop In" : "Book Court",
              price: facility.day_pass_price_php ?? facility.court_hourly_price_php ?? 0,
            }
          : null,
        stamp: stamp ?? null,
        created_at: new Date().toISOString(),
      };
      return { posts: [newPost, ...state.posts] };
    }),

  deletePost: (postId) => set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) })),

  addUserStory: (image, text) =>
    set({
      userStory: {
        image,
        text,
        createdAt: new Date().toISOString(),
      },
    }),

  loadDemoData: () =>
    set({
      passes: SEED_PASSES,
      purchases: SEED_PURCHASES,
      posts: [...SEED_POSTS],
      challenges: SEED_CHALLENGES,
    }),

  resetToEmpty: () =>
    set({
      passes: [],
      purchases: {},
      posts: [],
      challenges: [],
      activeWorkout: {
        title: "",
        durationSeconds: 0,
        isActive: false,
        restTimerSeconds: 0,
        isResting: false,
      },
    }),
}));
