import { useCallback, useEffect, useState } from "react";
import { describeProductLength, type FacilityProduct, type FacilityRow } from "sodia-core";
import { getSupabase } from "../lib/supabase";
import { loadVenueCatalogue } from "../services/venueService";

/** One thing the venue sheet offers. `productId` is set when it is a plan from the venue's catalogue. */
export interface FacilityPassOption {
  id: string;
  /** The `facility_products` id sent to checkout as the SKU. Absent in the offline preview. */
  productId?: string;
  title: string;
  subtitle: string;
  pricePhp: number;
  billingKind: "one_time_pass" | "recurring_subscription";
  splitNote?: string;
}

export type VenuePlansState =
  /** Offline preview build: sample plans, nothing can be bought. */
  | { status: "preview"; options: FacilityPassOption[] }
  | { status: "loading" }
  | { status: "error"; message: string }
  /** The venue's own plans. An empty list means the venue sells nothing in the app right now. */
  | { status: "ready"; options: FacilityPassOption[] };

function toOption(product: FacilityProduct): FacilityPassOption {
  const length = describeProductLength(product.duration_days);
  return {
    id: product.id,
    productId: product.id,
    title: product.name,
    subtitle: product.description ? `${length} • ${product.description}` : length,
    pricePhp: product.price_php,
    billingKind: product.kind === "MEMBERSHIP" ? "recurring_subscription" : "one_time_pass",
  };
}

/** Sample plans for the offline preview, where there is no backend to read a catalogue from. */
function previewOptions(facility: FacilityRow): FacilityPassOption[] {
  if (facility.registry === "A") {
    return [
      {
        id: "pass_day",
        title: "All-Access Day Pass",
        subtitle: "Entry for one day",
        pricePhp: facility.day_pass_price_php ?? 250,
        billingKind: "one_time_pass",
      },
      {
        id: "pass_pack10",
        title: "10-Session Punch Pack",
        subtitle: "Valid for 60 days • Save ₱300 vs daily drop-ins",
        pricePhp: 2200,
        billingKind: "one_time_pass",
      },
      {
        id: "pass_vip_monthly",
        title: "VIP Monthly All-Access",
        subtitle: "Unlimited 24/7 entry • 2 guest passes/month",
        pricePhp: facility.monthly_sub_price_php ?? 1500,
        billingKind: "recurring_subscription",
      },
    ];
  }
  return [
    {
      id: "court_1hr",
      title: "1-Hour Court Reservation",
      subtitle: "Pickleball / Multi-court • Free loaner paddles",
      pricePhp: facility.court_hourly_price_php ?? 200,
      billingKind: "one_time_pass",
      splitNote: "Includes court maintenance fee",
    },
    {
      id: "court_ladder",
      title: "Open Play Ladder Entry",
      subtitle: "2 hours rotating King-of-the-court • DUPR rated",
      pricePhp: 150,
      billingKind: "one_time_pass",
    },
    {
      id: "court_tournament",
      title: "Sunset Open Tournament Pass",
      subtitle: "Official bracket roster entry • Prize pool eligible",
      pricePhp: 500,
      billingKind: "one_time_pass",
      splitNote: "Direct bracket prize pool escrow",
    },
  ];
}

/**
 * What a venue sells. With a backend this is the venue's catalogue
 * (`facility_products`, active rows in the venue's order, minus the kinds the
 * venue has switched off). Without one it is the preview's sample plans.
 */
export function useVenuePlans(facility: FacilityRow | null, enabled: boolean) {
  const live = getSupabase() !== null;
  const facilityId = facility?.id ?? null;
  // Remembers which venue the plans belong to, so one venue's plans never show under another.
  const [loaded, setLoaded] = useState<{ facilityId: string; plans: VenuePlansState } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || !facilityId || !live) return;
    let cancelled = false;
    setLoaded(null);
    void loadVenueCatalogue(facilityId).then((result) => {
      if (cancelled) return;
      setLoaded({
        facilityId,
        plans: result.ok
          ? { status: "ready", options: result.data.products.map(toOption) }
          : { status: "error", message: result.message },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, facilityId, live, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const plans: VenuePlansState =
    !live && facility
      ? { status: "preview", options: previewOptions(facility) }
      : loaded && loaded.facilityId === facilityId
        ? loaded.plans
        : { status: "loading" };
  return { plans, live, retry };
}
