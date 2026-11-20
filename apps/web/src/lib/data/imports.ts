import "server-only";
import { createServerSupabase } from "../supabase/server";

export interface ImportedMember {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  planName: string | null;
  expiresOn: string | null;
  /** Matched to a Sodia account. */
  onApp: boolean;
  source: string;
}

export const IMPORT_LIST_LIMIT = 200;

/** Records brought over from a spreadsheet: the newest first, and how many there are in all. */
export async function loadImportedMembers(facilityId: string): Promise<{ rows: ImportedMember[]; total: number }> {
  const supabase = await createServerSupabase();
  const { data, count, error } = await supabase
    .from("facility_imported_members")
    .select("id, full_name, email, phone, plan_name, expires_on, user_id, source", { count: "exact" })
    .eq("facility_id", facilityId)
    .order("created_at", { ascending: false })
    .order("full_name")
    .limit(IMPORT_LIST_LIMIT);
  if (error) throw new Error("Could not load imported records.", { cause: error });
  return {
    total: count ?? 0,
    rows: (data ?? []).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      planName: row.plan_name,
      expiresOn: row.expires_on,
      onApp: row.user_id !== null,
      source: row.source,
    })),
  };
}
