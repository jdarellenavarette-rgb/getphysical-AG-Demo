import { useCallback, useEffect, useMemo } from "react";
import type { FacilityRow } from "sodia-core";
import { EXPANDED_FACILITIES } from "../data/discoverData";
import { getSupabase } from "../lib/supabase";
import { useEcosystemStore } from "../store/ecosystemStore";
import { useMemberStore } from "../store/memberStore";

export type DiscoverVenuesStatus = "loading" | "error" | "empty" | "ready";

/**
 * The venues Discover shows. With a backend these are the real venues from
 * `facilities` (signed in or not). Only a build without a backend, the offline
 * preview, shows the bundled sample venues.
 */
export function useDiscoverVenues() {
  const live = getSupabase() !== null;
  const facilities = useEcosystemStore((state) => state.facilities);
  const venuesLive = useEcosystemStore((state) => state.venuesLive);
  const venuesSync = useMemberStore((state) => state.venuesSync);
  const venuesError = useMemberStore((state) => state.venuesError);
  const refreshVenues = useMemberStore((state) => state.refreshVenues);

  // Venue details change on the web (names, hours, prices), so reload each time Discover opens.
  useEffect(() => {
    if (live) void refreshVenues();
  }, [live, refreshVenues]);

  const venues = useMemo<FacilityRow[]>(() => {
    if (live) return venuesLive ? [...facilities] : [];
    const byId = new Map<string, FacilityRow>();
    EXPANDED_FACILITIES.forEach((f) => byId.set(f.id, f));
    facilities.forEach((f) => byId.set(f.id, f));
    return Array.from(byId.values());
  }, [live, venuesLive, facilities]);

  const status: DiscoverVenuesStatus = !live
    ? "ready"
    : venues.length > 0
      ? "ready"
      : venuesSync === "error"
        ? "error"
        : venuesSync === "ready"
          ? "empty"
          : "loading";

  const retry = useCallback(() => void refreshVenues(), [refreshVenues]);

  return { live, venues, status, error: venuesError, retry };
}
