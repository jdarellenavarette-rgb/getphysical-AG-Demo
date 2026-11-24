"use server";

import { z } from "zod";
import { canManageFacility, requireSuiteSession } from "../../lib/active-facility";
import { AUTOMATION_KINDS, AUTOMATIONS, automationsFor } from "../../lib/automations";
import { describeDbError, type ActionResult, type FormState } from "../../lib/form-state";
import { createServerSupabase } from "../../lib/supabase/server";

const ruleSchema = z.object({
  kind: z.enum(AUTOMATION_KINDS),
  enabled: z.boolean(),
  body: z.string().trim().min(1, "Write the message first").max(1000, "Keep the message under 1,000 characters"),
});

/** Turn an automated message on or off, or change its wording. Owners and admins only. */
export async function saveAutomation(kind: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = ruleSchema.safeParse({
    kind,
    enabled: formData.get("enabled") === "on",
    body: formData.get("body") ?? "",
  });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  if (!canManageFacility(active.role)) {
    return { status: "error", message: "Only an owner or admin can change automated messages." };
  }
  if (!automationsFor(active.kind, active.role).includes(parsed.data.kind)) {
    return { status: "error", message: "That automation is not part of this workspace." };
  }
  const supabase = await createServerSupabase();
  const values = { enabled: parsed.data.enabled, body: parsed.data.body };
  const updated = await supabase
    .from("facility_automations")
    .update(values)
    .eq("facility_id", active.id)
    .eq("kind", parsed.data.kind)
    .select("kind");
  const failure =
    updated.error ??
    (updated.data.length === 0
      ? (
          await supabase
            .from("facility_automations")
            .insert({ facility_id: active.id, kind: parsed.data.kind, ...values })
        ).error
      : null);
  if (failure) {
    return { status: "error", message: describeDbError(failure, {}, "We couldn't save that. Please retry.") };
  }
  const title = AUTOMATIONS[parsed.data.kind].title;
  return { status: "success", message: parsed.data.enabled ? `“${title}” is on.` : `“${title}” is off.` };
}

/** Send everything that is due now. Nothing is ever sent twice for the same reason. */
export async function runAutomationsNow(): Promise<ActionResult> {
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("run_automations", { p_facility_id: active.id });
  if (error) return { ok: false, message: describeDbError(error, {}, "We couldn't run the check. Please retry.") };
  const sent = Number(data ?? 0);
  return {
    ok: true,
    message: sent === 0 ? "Nothing is due right now." : `Sent ${sent} ${sent === 1 ? "message" : "messages"}.`,
  };
}
