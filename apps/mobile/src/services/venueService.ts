import { facilityProductSchema, type FacilityProduct, type FacilityRow } from "sodia-core";
import { getSupabase } from "../lib/supabase";
import { failure, type ServiceResult } from "./serviceResult";

/** Columns the venue list and the venue sheet show (AGENTS.md §4: never `select('*')`). */
const VENUE_COLUMNS =
  "id, slug, name, registry, registry_type, business_kind, plan, category, logo, logo_url, cover_image, cover_url, address, lat, lng, hours, amenities, inside_now_count, max_capacity, is_open, day_pass_price_php, monthly_sub_price_php, court_hourly_price_php, free_member_count, rating, review_count, has_active_challenge, challenge_title, sells_passes, sells_memberships, membership_grace_days, created_at";

const PRODUCT_COLUMNS =
  "id, facility_id, name, description, kind, price_php, duration_days, is_active, sort_order, legacy_sku";

const NOT_CONFIGURED = { ok: false, reason: "error", message: "Venues are unavailable in this build." } as const;

/** Kinds of business that are places to visit. Coaches and organizers are not listed as venues. */
const VENUE_KINDS = ["GYM", "STUDIO", "CLUB"] as const;

/** Every venue on GetPhysical, best rated first. Readable signed in or out. */
export async function loadVenues(): Promise<ServiceResult<FacilityRow[]>> {
  const supabase = getSupabase();
  if (!supabase) return NOT_CONFIGURED;
  const { data, error } = await supabase
    .from("facilities")
    .select(VENUE_COLUMNS)
    .in("business_kind", VENUE_KINDS)
    .order("rating", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true })
    .limit(200);
  if (error) return failure(error);
  return {
    ok: true,
    // Columns the app never reads are left empty rather than fetched.
    data: data.map((row) => ({
      ...row,
      coords: {},
      live_capacity: {},
      court_hourly_price: null,
      day_pass_price: null,
      monthly_sub_price: null,
      distance: null,
      location: null,
      owner_id: null,
      spatial_assets: null,
      updated_at: null,
    })),
  };
}

/** What a venue has on sale right now. */
export interface VenueCatalogue {
  products: FacilityProduct[];
  sellsPasses: boolean;
  sellsMemberships: boolean;
}

/**
 * The venue's active plans in the venue's own order, without the kinds the
 * venue has switched off (`sells_passes` / `sells_memberships`).
 */
export async function loadVenueCatalogue(facilityId: string): Promise<ServiceResult<VenueCatalogue>> {
  const supabase = getSupabase();
  if (!supabase) return NOT_CONFIGURED;
  const [venue, products] = await Promise.all([
    supabase.from("facilities").select("id, sells_passes, sells_memberships").eq("id", facilityId).maybeSingle(),
    supabase
      .from("facility_products")
      .select(PRODUCT_COLUMNS)
      .eq("facility_id", facilityId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);
  if (venue.error) return failure(venue.error);
  if (products.error) return failure(products.error);
  if (!venue.data) return { ok: false, reason: "error", message: "This venue is no longer listed." };

  const sellsPasses = venue.data.sells_passes;
  const sellsMemberships = venue.data.sells_memberships;
  const valid: FacilityProduct[] = [];
  for (const row of products.data) {
    const parsed = facilityProductSchema.safeParse(row);
    if (!parsed.success) continue;
    if (parsed.data.kind === "PASS" ? sellsPasses : sellsMemberships) valid.push(parsed.data);
  }
  return { ok: true, data: { products: valid, sellsPasses, sellsMemberships } };
}
