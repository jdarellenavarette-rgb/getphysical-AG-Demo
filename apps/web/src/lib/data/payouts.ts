import "server-only";
import { createServerSupabase } from "../supabase/server";

export type PayoutState = "NOT_SET_UP" | "TEST_MODE" | "LIVE";

export interface PayoutStatus {
  state: PayoutState;
  provider: string | null;
  liveRequestedAt: string | null;
  /** Whether this platform allows venues to connect test payments themselves. */
  sandboxAvailable: boolean;
  /** Front-desk staff cannot see payout details; only whether selling is switched on is unknown to them. */
  visible: boolean;
}

/** Payout readiness for a venue. Owners and admins only (RLS hides the row from other staff). */
export async function loadPayoutStatus(facilityId: string, canManage: boolean): Promise<PayoutStatus> {
  const supabase = await createServerSupabase();
  const [account, mode] = await Promise.all([
    supabase
      .from("facility_payout_accounts")
      .select("charges_enabled, is_sandbox, preferred_provider, live_requested_at")
      .eq("facility_id", facilityId)
      .maybeSingle(),
    supabase.rpc("payments_mode"),
  ]);
  if (account.error ?? mode.error)
    throw new Error("Could not load payout status.", { cause: account.error ?? mode.error });
  const sandboxAvailable = mode.data === "sandbox";
  const row = account.data;
  // A test connection only sells while the platform is in test mode.
  const state: PayoutState = !row?.charges_enabled
    ? "NOT_SET_UP"
    : row.is_sandbox
      ? sandboxAvailable
        ? "TEST_MODE"
        : "NOT_SET_UP"
      : "LIVE";
  return {
    state,
    provider: row?.preferred_provider ?? null,
    liveRequestedAt: row?.live_requested_at ?? null,
    sandboxAvailable,
    visible: canManage,
  };
}
