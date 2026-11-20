"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { describeDbError, type FormState } from "../../lib/form-state";
import { createServerSupabase } from "../../lib/supabase/server";

const optional = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null);

const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Enter their name").max(120, "That name is too long"),
  phone: optional(32, "That number is too long"),
  email: z.union([z.literal(""), z.string().trim().email("That email doesn't look right").max(254)]),
});

/**
 * Add someone who is not on the Sodia app yet: a walk-in, or a regular who books by phone.
 * If they later join with the same confirmed email, the record is matched to their account.
 */
export async function addDeskContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
  });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("facility_imported_members").insert({
    facility_id: active.id,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    source: "DESK",
  });
  if (error) {
    if (error.code === "23505") {
      return { status: "form_validation", message: `${parsed.data.fullName} is already on your list.` };
    }
    return { status: "error", message: describeDbError(error, {}, "We couldn't add that person. Please retry.") };
  }
  return {
    status: "success",
    message: `${parsed.data.fullName} is on your list. You can book and note things for them now.`,
  };
}
