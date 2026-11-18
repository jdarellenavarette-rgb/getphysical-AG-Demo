"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { describeDbError, type ActionResult, type FormState } from "../../lib/form-state";
import { createServerSupabase } from "../../lib/supabase/server";

const KNOWN = {
  USER_NOT_FOUND: "No Sodia account has that username. Ask them to check it in their app.",
  OWNER_ROLE_FIXED: "The owner's role can't be changed.",
  STAFF_NOT_FOUND: "That person is no longer on the team.",
  FORBIDDEN: "Only the owner or an admin can manage the team.",
};

const ROLE_WORDS = { ADMIN: "an admin", STAFF: "front-desk staff", COACH: "a coach" } as const;

const staffSchema = z.object({
  username: z
    .string()
    .trim()
    .transform((value) => value.replace(/^@/, ""))
    .pipe(z.string().min(3, "Enter their Sodia username").max(30, "That username is too long")),
  role: z.enum(["ADMIN", "STAFF", "COACH"], { message: "Choose a role" }),
});

/** Give someone access to this venue in the suite, or change the role of someone already on the team. */
export async function addTeamMember(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = staffSchema.safeParse({ username: formData.get("username") ?? "", role: formData.get("role") });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("add_facility_staff", {
    p_facility_id: active.id,
    p_username: parsed.data.username,
    p_role: parsed.data.role,
  });
  if (error) {
    return {
      status: error.message.includes("USER_NOT_FOUND") ? "form_validation" : "error",
      message: describeDbError(error, KNOWN, "We couldn't add that person. Please retry."),
    };
  }
  const result = z.object({ name: z.string() }).safeParse(data);
  const name = result.success ? result.data.name : "They";
  return { status: "success", message: `${name} can now sign in here as ${ROLE_WORDS[parsed.data.role]}.` };
}

/** Take away someone's access to this venue. */
export async function removeTeamMember(userId: string): Promise<ActionResult> {
  const parsed = z.string().uuid().safeParse(userId);
  if (!parsed.success) return { ok: false, message: "That person could not be found." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("remove_facility_staff", { p_facility_id: active.id, p_user_id: parsed.data });
  if (error)
    return { ok: false, message: describeDbError(error, KNOWN, "We couldn't remove that person. Please retry.") };
  return { ok: true, message: "Removed from the team." };
}
