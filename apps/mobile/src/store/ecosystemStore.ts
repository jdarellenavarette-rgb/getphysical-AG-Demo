import { create } from "zustand";
import {
  SEED_FACILITIES,
  SEED_PASSES,
  SEED_CHALLENGES,
  type FacilityRow,
  type PassRow,
  type SodiaPostRow,
  type PRChallengeRow,
  type ProfileRow,
  type UserRole,
} from "sodia-core";
import { DARELLE_AVATAR, DARELLE_PHYSIQUE, DARELLE_TENNIS_JUMP } from "../constants/darelleAssets";
import { INITIAL_DARELLE_POSTS } from "../data/darelleSeedPosts";
import { passExpiry, type PassPurchase } from "../lib/passDisplay";

export interface MobileEcosystemState {
  currentRole: UserRole;
  profile: ProfileRow;
  /** Replace the preview profile with the signed-in user's real profile. */
  setProfile: (profile: ProfileRow) => void;
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
  provisionPass: (
    facilityName: string,
    kind: "one_time_pass" | "recurring_subscription",
    price: number,
    customTitle?: string,
    facilityId?: string,
  ) => void;
  startWorkout: (title?: string) => void;
  finishWorkout: () => void;
  loadDemoData: () => void;
  resetToEmpty: () => void;
}

const INITIAL_PROFILE: ProfileRow = {
  id: "usr_athlete_01",
  username: "darellenavarette",
  first_name: "Darelle",
  last_name: "Navarette",
  avatar: DARELLE_AVATAR,
  avatar_url: DARELLE_AVATAR,
  cover_url: DARELLE_TENNIS_JUMP,
  bio: "IFBB Certified Personal Fitness Trainer | Strength & Hypertrophy • Racket Sports • Combat Conditioning.",
  dob: "1998-05-15",
  home_location: "Metro Manila",
  user_roles: ["individual", "staff", "coach", "organizer"],
  is_private: false,
  streak_goal_per_week: 4,
  default_launch_tab: "sodia",
  soft_deleted_at: null,
  created_at: "2026-10-31T00:00:00.000Z",
  updated_at: "2026-10-31T00:00:00.000Z",
  active_role: "coach",
  roles: ["individual", "staff", "coach", "organizer"],
  phone_hash: "hash_9171234567",
  streak_weeks: 14,
  streak_goal: 4,
  streak_freeze_available: true,
  weights: { weightlifting: 45, running: 20, pickleball: 25, general: 10 },
  metrics: { followers: 3820, following: 215, activeChallenges: 4 },
  name: "Darelle Navarette",
  coach_plan: "FREE",
};

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
  profile: INITIAL_PROFILE,
  setProfile: (profile) => set({ profile }),
  facilities: SEED_FACILITIES,
  passes: [],
  purchases: {},
  posts: INITIAL_DARELLE_POSTS,
  challenges: [],
  userStory: {
    image: DARELLE_PHYSIQUE,
    text: "IFBB CPFT • Training Day",
    createdAt: new Date().toISOString(),
  },
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

  provisionPass: (facilityName, kind, price, customTitle, facilityId) =>
    set((state) => {
      const passId = `pass_${Date.now()}`;
      const newPass: PassRow = {
        id: passId,
        owner_id: state.profile.id,
        facility_id: facilityId ?? "fac_metro_core",
        sku_id: kind === "recurring_subscription" ? "sku_vip_monthly" : "sku_day_pass",
        pass_type: customTitle ?? (kind === "recurring_subscription" ? "VIP Monthly All-Access" : "Day Pass"),
        status: "ACTIVE",
        valid_until: passExpiry(kind),
        gifted_by_user_id: null,
        payment_order_id: null,
        created_at: new Date().toISOString(),
      };
      return {
        passes: [newPass, ...state.passes],
        purchases: {
          ...state.purchases,
          [passId]: { baseAmountPhp: price, billingKind: kind, facilityName, isPreview: true },
        },
      };
    }),

  addPost: (content, facilityId, stamp, mediaUrl) =>
    set((state) => {
      const facility = state.facilities.find((f) => f.id === facilityId);
      const newPost: SodiaPostRow = {
        id: `post_${Date.now()}`,
        user_id: state.profile.id,
        author_name: `${state.profile.first_name} ${state.profile.last_name}`,
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
      posts: INITIAL_DARELLE_POSTS,
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
