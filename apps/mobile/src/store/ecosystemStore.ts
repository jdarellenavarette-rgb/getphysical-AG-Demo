import { create } from "zustand";
import {
  SEED_FACILITIES,
  SEED_PASSES,
  SEED_POSTS,
  SEED_CHALLENGES,
  type FacilityRow,
  type PassRow,
  type SodiaPostRow,
  type PRChallengeRow,
  type ProfileRow,
  type UserRole,
} from "sodia-core";

export interface MobileEcosystemState {
  currentRole: UserRole;
  profile: ProfileRow;
  facilities: readonly FacilityRow[];
  passes: readonly PassRow[];
  posts: readonly SodiaPostRow[];
  challenges: readonly PRChallengeRow[];
  userStory: { image: string; text?: string; createdAt: string } | null;
  isOffline: boolean;
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
  addUserStory: (image: string, text?: string) => void;
  provisionPass: (
    facilityName: string,
    kind: "one_time_pass" | "recurring_subscription",
    price: number,
    customTitle?: string,
    facilityId?: string
  ) => void;
  startWorkout: (title?: string) => void;
  finishWorkout: () => void;
  loadDemoData: () => void;
  resetToEmpty: () => void;
}

const INITIAL_PROFILE: ProfileRow = {
  id: "usr_athlete_01",
  username: "adam.arete",
  first_name: "Adam",
  last_name: "Arête",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  cover_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
  bio: "Functional weightlifter & Hyrox athlete.",
  dob: "1998-05-15",
  home_location: "Metro Manila",
  user_roles: ["individual", "staff", "coach", "organizer"],
  is_private: false,
  streak_goal_per_week: 3,
  default_launch_tab: "sodia",
  soft_deleted_at: null,
  created_at: "2026-10-31T00:00:00.000Z",
  updated_at: "2026-10-31T00:00:00.000Z",
  active_role: "individual",
  roles: ["individual", "staff", "coach", "organizer"],
  phone_hash: "hash_9171234567",
  streak_weeks: 0,
  streak_goal: 3,
  streak_freeze_available: true,
  weights: { weightlifting: 40, running: 30, pickleball: 20, general: 10 },
  metrics: { followers: 0, following: 0, activeChallenges: 0 },
  name: "Adam Arête",
};

export const useEcosystemStore = create<MobileEcosystemState>((set) => ({
  currentRole: "individual",
  profile: INITIAL_PROFILE,
  facilities: SEED_FACILITIES,
  // START IN EMPTY / DEFAULT CANONICAL STATE
  passes: [],
  posts: [],
  challenges: [],
  userStory: null,
  isOffline: false,
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
      const newPass: PassRow = {
        id: `pass_${Date.now()}`,
        owner_id: state.profile.id,
        facility_id: (facilityId as any) ?? "fac_metro_core",
        sku_id: kind === "recurring_subscription" ? "sku_vip_monthly" : "sku_day_pass",
        pass_type: customTitle ?? (kind === "recurring_subscription" ? "VIP Monthly All-Access" : "Day Pass"),
        status: "active",
        valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
        gifted_by_user_id: null,
        created_at: new Date().toISOString(),
      };
      return { passes: [newPass, ...state.passes] };
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
        media_url: mediaUrl === undefined ? "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80" : mediaUrl,
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

  addUserStory: (image, text) =>
    set({
      userStory: {
        image,
        text,
        createdAt: new Date().toISOString(),
      },
    }),

  // Helpers to test transitions between Empty and Seeded States
  loadDemoData: () =>
    set({
      passes: SEED_PASSES,
      posts: SEED_POSTS,
      challenges: SEED_CHALLENGES,
    }),

  resetToEmpty: () =>
    set({
      passes: [],
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
