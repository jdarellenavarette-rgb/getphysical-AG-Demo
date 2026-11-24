"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { describeDbError, type FormState } from "../../lib/form-state";
import { createServerSupabase } from "../../lib/supabase/server";

const recipientsSchema = z.array(z.string().uuid()).min(1).max(500);
const bodySchema = z
  .string()
  .trim()
  .min(1, "Write a message first")
  .max(2000, "Keep the message under 2,000 characters");

/**
 * Write to the people on a list (an event's sign-ups, a class, quiet clients). Each gets the
 * message in their own thread with the business. The database checks each one has a tie with the
 * business and skips anyone who muted its group messages.
 */
export async function messagePeople(userIds: string[], _prev: FormState, formData: FormData): Promise<FormState> {
  const recipients = recipientsSchema.safeParse(userIds);
  if (!recipients.success) return { status: "error", message: "There is nobody on this list to message." };
  const body = bodySchema.safeParse(formData.get("body") ?? "");
  if (!body.success) return { status: "form_validation", message: body.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("message_people", {
    p_facility_id: active.id,
    p_user_ids: recipients.data,
    p_body: body.data,
  });
  if (error) {
    return { status: "error", message: describeDbError(error, {}, "We couldn't send the message. Please retry.") };
  }
  const sent = Number(data ?? 0);
  if (sent === 0) {
    return { status: "error", message: "Nobody could be messaged: they have muted messages or left the list." };
  }
  const skipped = recipients.data.length - sent;
  return {
    status: "success",
    message:
      `Sent to ${sent} ${sent === 1 ? "person" : "people"}.` +
      (skipped > 0 ? ` ${skipped} skipped because they muted group messages.` : ""),
  };
}
