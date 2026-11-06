import { create } from "zustand";
import type { FacilityRow } from "sodia-core";
import type { CheckoutRequest } from "../components/discover/DiscoverView";
import type { AthleteProfileData } from "../components/profile/AthleteProfileModal";
import type { DMThread } from "../components/sodia/InboxView";
import type { ChallengeSummary } from "../components/sodia/feed/PostCallouts";

/**
 * Every app-wide overlay (sheet / modal) addressable from any tab.
 * Overlays carry their payload so the host can render them without extra state.
 */
export type OverlayEntry =
  | { readonly kind: "storyViewer"; readonly startIndex: number }
  | { readonly kind: "storyCamera" }
  | { readonly kind: "comments"; readonly postId: string | null }
  | { readonly kind: "inbox"; readonly thread: DMThread | null }
  | { readonly kind: "activity" }
  | { readonly kind: "createPost" }
  | { readonly kind: "menu" }
  | { readonly kind: "settings" }
  | { readonly kind: "staffDash" }
  | { readonly kind: "coachDash" }
  | { readonly kind: "organizer" }
  | { readonly kind: "challenge"; readonly challenge: ChallengeSummary }
  | { readonly kind: "facility"; readonly facility: FacilityRow }
  | { readonly kind: "athlete"; readonly athlete: AthleteProfileData }
  | { readonly kind: "checkout"; readonly item: CheckoutRequest };

export type OverlayKind = OverlayEntry["kind"];
export type OverlayOf<K extends OverlayKind> = Extract<OverlayEntry, { kind: K }>;

interface OverlayState {
  /** Ordered bottom → top. Android back / Escape pops the last entry. */
  stack: readonly OverlayEntry[];
  open: (entry: OverlayEntry) => void;
  close: (kind: OverlayKind) => void;
  closeTop: () => boolean;
  closeAll: () => void;
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  stack: [],
  // Re-opening a kind replaces its payload and brings it to the top.
  open: (entry) => set((s) => ({ stack: [...s.stack.filter((e) => e.kind !== entry.kind), entry] })),
  close: (kind) => set((s) => ({ stack: s.stack.filter((e) => e.kind !== kind) })),
  closeTop: () => {
    const { stack } = get();
    if (stack.length === 0) return false;
    set({ stack: stack.slice(0, -1) });
    return true;
  },
  closeAll: () => set({ stack: [] }),
}));

/** Subscribe to one overlay kind; returns its entry (payload) or null when closed. */
export function useOverlay<K extends OverlayKind>(kind: K): OverlayOf<K> | null {
  return useOverlayStore((s) => {
    const found = s.stack.find((e) => e.kind === kind);
    return found ? (found as OverlayOf<K>) : null;
  });
}

/** Stable imperative helpers for event handlers. */
export const overlays = {
  open: (entry: OverlayEntry) => useOverlayStore.getState().open(entry),
  close: (kind: OverlayKind) => useOverlayStore.getState().close(kind),
};
