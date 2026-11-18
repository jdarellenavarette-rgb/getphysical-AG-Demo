import { create } from "zustand";
import type { MyMembershipRow } from "sodia-core";
import { leaveVenue, loadMyMemberships, loadWallet, setVenueBroadcastsMuted } from "../services/memberService";
import { loadVenues } from "../services/venueService";
import { useEcosystemStore } from "./ecosystemStore";

/** idle: not asked yet · signed_out: needs an account · ready: loaded (the list may be empty). */
export type SyncState = "idle" | "loading" | "ready" | "error" | "signed_out";

export interface MemberState {
  /** Venue list shown in Discover (the venues themselves live in the ecosystem store). */
  venuesSync: SyncState;
  venuesError: string | null;
  refreshVenues: () => Promise<void>;

  /** The member's passes (the passes themselves live in the ecosystem store). */
  walletSync: SyncState;
  walletError: string | null;
  /** True between starting a payment and its pass arriving. */
  awaitingPass: boolean;
  setAwaitingPass: (awaiting: boolean) => void;
  /**
   * Reloads the wallet. Resolves true when a pass arrived that was not there before.
   * `quiet` skips the loading state, for checks made in the background.
   */
  refreshWallet: (options?: { quiet?: boolean }) => Promise<boolean>;

  /** The member's venues and standing at each. */
  memberships: readonly MyMembershipRow[];
  membershipsSync: SyncState;
  membershipsError: string | null;
  refreshMemberships: () => Promise<void>;
  /** Both resolve to null on success, or a message to show next to the venue. */
  setMuted: (facilityId: string, muted: boolean) => Promise<string | null>;
  leave: (facilityId: string) => Promise<string | null>;

  /** Forget everything that belonged to the previous account. */
  resetMember: () => void;
}

// Bumped on sign-out so a reply that was already in flight can't repopulate the next session.
let session = 0;

export const useMemberStore = create<MemberState>((set, get) => ({
  venuesSync: "idle",
  venuesError: null,
  refreshVenues: async () => {
    if (get().venuesSync === "loading") return;
    set({ venuesSync: "loading", venuesError: null });
    const result = await loadVenues();
    if (!result.ok) return set({ venuesSync: "error", venuesError: result.message });
    useEcosystemStore.getState().setLiveFacilities(result.data);
    set({ venuesSync: "ready" });
  },

  walletSync: "idle",
  walletError: null,
  awaitingPass: false,
  setAwaitingPass: (awaitingPass) => set({ awaitingPass }),
  refreshWallet: async (options) => {
    const startedIn = session;
    // Only a pass that turns up after the first load counts as new.
    const hadLoaded = get().walletSync === "ready" || get().walletSync === "error";
    if (!options?.quiet) set({ walletSync: "loading", walletError: null });
    const result = await loadWallet();
    if (startedIn !== session) return false;
    if (!result.ok) {
      // A background check that fails leaves what is on screen alone.
      if (options?.quiet && hadLoaded) return false;
      set(
        result.reason === "signed_out"
          ? { walletSync: "signed_out" }
          : { walletSync: "error", walletError: result.message },
      );
      return false;
    }
    const known = new Set(useEcosystemStore.getState().passes.map((p) => p.id));
    useEcosystemStore.getState().setWallet(result.data);
    set({ walletSync: "ready" });
    return hadLoaded && result.data.passes.some((p) => !known.has(p.id));
  },

  memberships: [],
  membershipsSync: "idle",
  membershipsError: null,
  refreshMemberships: async () => {
    const startedIn = session;
    set({ membershipsSync: "loading", membershipsError: null });
    const result = await loadMyMemberships();
    if (startedIn !== session) return;
    if (result.ok) return set({ memberships: result.data, membershipsSync: "ready" });
    set(
      result.reason === "signed_out"
        ? { memberships: [], membershipsSync: "signed_out" }
        : { membershipsSync: "error", membershipsError: result.message },
    );
  },

  setMuted: async (facilityId, muted) => {
    const apply = (value: boolean) =>
      set((state) => ({
        memberships: state.memberships.map((m) =>
          m.facility_id === facilityId ? { ...m, broadcasts_muted: value } : m,
        ),
      }));
    // The switch moves at once and moves back if the venue's setting couldn't be saved.
    apply(muted);
    const result = await setVenueBroadcastsMuted(facilityId, muted);
    if (result.ok) return null;
    apply(!muted);
    return result.message;
  },

  leave: async (facilityId) => {
    const result = await leaveVenue(facilityId);
    if (!result.ok) return result.message;
    set((state) => ({ memberships: state.memberships.filter((m) => m.facility_id !== facilityId) }));
    void get().refreshMemberships();
    return null;
  },

  resetMember: () => {
    session += 1;
    set({
      walletSync: "idle",
      walletError: null,
      awaitingPass: false,
      memberships: [],
      membershipsSync: "idle",
      membershipsError: null,
    });
  },
}));
