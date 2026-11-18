import { z } from "zod";
import { myMembershipRowSchema, type MyMembershipRow, type PassRow } from "sodia-core";
import type { PassPurchase } from "../lib/passDisplay";
import { getSessionUserId, getSupabase } from "../lib/supabase";
import { failure, type ServiceResult } from "./serviceResult";

const SIGNED_OUT = { ok: false, reason: "signed_out", message: "Sign in to see this." } as const;

/** Columns the wallet shows (RLS: owners read their own passes). */
const PASS_COLUMNS = "id, owner_id, facility_id, sku_id, pass_type, status, valid_until, created_at";

const billingKindSchema = z.enum(["one_time_pass", "recurring_subscription"]);

export interface WalletData {
  passes: PassRow[];
  /** Venue name per facility id, for every venue a pass belongs to. */
  venueNames: Record<string, string>;
  /** What was paid per pass id. Passes given at the front desk have no entry. */
  purchases: Record<string, PassPurchase>;
}

/** The signed-in member's passes, newest first, with venue names and what was paid. */
export async function loadWallet(): Promise<ServiceResult<WalletData>> {
  const supabase = getSupabase();
  const userId = await getSessionUserId();
  if (!supabase || !userId) return SIGNED_OUT;

  const { data, error } = await supabase
    .from("passes")
    .select(PASS_COLUMNS)
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) return failure(error);
  const passes: PassRow[] = data.map((row) => ({ ...row, gifted_by_user_id: null, payment_order_id: null }));

  const venueNames: Record<string, string> = {};
  const purchases: Record<string, PassPurchase> = {};
  if (passes.length === 0) return { ok: true, data: { passes, venueNames, purchases } };

  const facilityIds = [...new Set(passes.map((p) => p.facility_id).filter((id): id is string => !!id))];
  const [venues, orders] = await Promise.all([
    supabase.from("facilities").select("id, name").in("id", facilityIds),
    supabase
      .from("payment_orders")
      .select("pass_id, base_amount_php, billing_kind")
      .eq("user_id", userId)
      .not("pass_id", "is", null),
  ]);
  if (venues.error) return failure(venues.error);
  for (const venue of venues.data) venueNames[venue.id] = venue.name;

  // Receipts are a detail: the wallet still opens if the orders can't be read.
  for (const order of orders.data ?? []) {
    const kind = billingKindSchema.safeParse(order.billing_kind);
    const pass = passes.find((p) => p.id === order.pass_id);
    if (!kind.success || !pass) continue;
    purchases[pass.id] = {
      baseAmountPhp: order.base_amount_php,
      billingKind: kind.data,
      facilityName: (pass.facility_id && venueNames[pass.facility_id]) || "Venue",
      isPreview: false,
    };
  }
  return { ok: true, data: { passes, venueNames, purchases } };
}

/** The member's venues with their standing at each (`my_memberships()`). */
export async function loadMyMemberships(): Promise<ServiceResult<MyMembershipRow[]>> {
  const supabase = getSupabase();
  if (!supabase || !(await getSessionUserId())) return SIGNED_OUT;
  const { data, error } = await supabase.rpc("my_memberships");
  if (error) return failure(error);
  const parsed = z.array(myMembershipRowSchema).safeParse(data ?? []);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, reason: "error", message: "We couldn't read your venues. Please retry." };
}

/** Stops or resumes a venue's broadcasts. Direct replies still arrive. */
export async function setVenueBroadcastsMuted(facilityId: string, muted: boolean): Promise<ServiceResult<null>> {
  const supabase = getSupabase();
  if (!supabase || !(await getSessionUserId())) return SIGNED_OUT;
  const { error } = await supabase.rpc("set_venue_broadcasts_muted", { p_facility_id: facilityId, p_muted: muted });
  return error ? failure(error) : { ok: true, data: null };
}

/** Leaves a venue. A paid pass stays valid until it ends. */
export async function leaveVenue(facilityId: string): Promise<ServiceResult<null>> {
  const supabase = getSupabase();
  if (!supabase || !(await getSessionUserId())) return SIGNED_OUT;
  const { error } = await supabase.rpc("leave_facility", { p_facility_id: facilityId });
  return error ? failure(error) : { ok: true, data: null };
}
