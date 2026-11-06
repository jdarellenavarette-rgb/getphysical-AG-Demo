import type { GetPhysicalClient } from "./client";
import { EXPLICIT_COLUMNS, type FacilityRow, type PassRow, type ProfileRow, type LedgerTransactionRow } from "./db";

/**
 * Typed read helpers shared by web and mobile. Writes to money/access tables
 * are not exposed here: they happen only through database RPCs and webhooks.
 */
export const SodiaQueries = {
  async getFacilities(client: GetPhysicalClient) {
    const { data, error } = await client
      .from("facilities")
      .select(EXPLICIT_COLUMNS.FACILITIES)
      .order("rating", { ascending: false });
    if (error) throw new Error(`[SodiaQueries.getFacilities] ${error.message}`);
    return data satisfies ReadonlyArray<Partial<FacilityRow>>;
  },

  async getMyProfile(client: GetPhysicalClient): Promise<ProfileRow | null> {
    const { data, error } = await client.rpc("get_my_profile");
    if (error) throw new Error(`[SodiaQueries.getMyProfile] ${error.message}`);
    return data ?? null;
  },

  async getMyPasses(client: GetPhysicalClient, ownerId: string) {
    const { data, error } = await client
      .from("passes")
      .select(EXPLICIT_COLUMNS.PASSES)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`[SodiaQueries.getMyPasses] ${error.message}`);
    return data satisfies ReadonlyArray<Partial<PassRow>>;
  },

  async getPassSecret(client: GetPhysicalClient, passId: string): Promise<string | null> {
    const { data, error } = await client
      .from("pass_credentials")
      .select(EXPLICIT_COLUMNS.PASS_CREDENTIALS)
      .eq("pass_id", passId)
      .maybeSingle();
    if (error) throw new Error(`[SodiaQueries.getPassSecret] ${error.message}`);
    return data?.secret ?? null;
  },

  async getFacilityLedger(client: GetPhysicalClient, facilityId: string) {
    const { data, error } = await client
      .from("ledger_transactions")
      .select(EXPLICIT_COLUMNS.LEDGER_TRANSACTIONS)
      .eq("facility_id", facilityId)
      .order("timestamp", { ascending: false });
    if (error) throw new Error(`[SodiaQueries.getFacilityLedger] ${error.message}`);
    return data satisfies ReadonlyArray<Partial<LedgerTransactionRow>>;
  },
} as const;
