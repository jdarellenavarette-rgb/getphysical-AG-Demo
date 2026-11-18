"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { describeDbError, type ActionResult } from "../../lib/form-state";
import { createServerSupabase } from "../../lib/supabase/server";

const optional = (max: number) => z.string().trim().max(max).nullable();

const rowSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: optional(254),
  phone: optional(32),
  plan_name: optional(80),
  expires_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  notes: optional(500),
});

export type ImportRow = z.infer<typeof rowSchema>;

/** Save reviewed spreadsheet rows as imported records. People already on the list are skipped. Owners and admins only. */
export async function importMembers(rows: ImportRow[]): Promise<ActionResult> {
  const parsed = z.array(rowSchema).min(1).max(2000).safeParse(rows);
  if (!parsed.success)
    return { ok: false, message: "Those rows could not be read. Import up to 2,000 rows at a time." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("import_facility_members", {
    p_facility_id: active.id,
    p_rows: parsed.data,
  });
  if (error) {
    return {
      ok: false,
      message: describeDbError(
        error,
        { "row-level security": "Only the owner or an admin can import members." },
        "We couldn't import those rows. Nothing was saved. Please retry.",
      ),
    };
  }
  const added = data ?? 0;
  const skipped = parsed.data.length - added;
  return {
    ok: true,
    message:
      `${added} ${added === 1 ? "record" : "records"} imported.` +
      (skipped > 0 ? ` ${skipped} already on your list ${skipped === 1 ? "was" : "were"} skipped.` : ""),
  };
}

/** Remove one imported record. */
export async function removeImportedMember(id: string): Promise<ActionResult> {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { ok: false, message: "That record could not be found." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("facility_imported_members")
    .delete()
    .eq("id", parsed.data)
    .eq("facility_id", active.id);
  if (error) return { ok: false, message: describeDbError(error, {}, "We couldn't remove that record. Please retry.") };
  return { ok: true, message: "Record removed." };
}
