"use server";

import { z } from "zod";
import { describeDbError, type ActionResult, type FormState } from "../../lib/form-state";
import { requireSuiteSession } from "../../lib/active-facility";
import { createServerSupabase } from "../../lib/supabase/server";

const usernameSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^@/, ""))
  .pipe(z.string().min(3, "Enter your client's Sodia username").max(30, "That username is too long"));

const KNOWN = {
  USER_NOT_FOUND: "No Sodia account has that username. Ask your client to check it in their app.",
  CANNOT_COACH_SELF: "That is your own account.",
  COACH_FREE_CLIENT_CAP_REACHED: "The free plan covers 3 clients. Upgrade to Pro to take on more.",
  COACH_LINK_NEEDS_CONSENT: "Your client has to accept before they join your list.",
};

/** Ask someone to become a client. Nothing about their training is visible until they accept in the app. */
export async function inviteClient(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = usernameSchema.safeParse(formData.get("username"));
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("invite_coach_client", { p_username: parsed.data });
  if (error) {
    const known = error.message.includes("USER_NOT_FOUND") || error.message.includes("CANNOT_COACH_SELF");
    return {
      status: known ? "form_validation" : "error",
      message: describeDbError(error, KNOWN, "We couldn't send the invitation. Please retry."),
    };
  }
  const result = z.object({ name: z.string(), status: z.string() }).safeParse(data);
  const name = result.success ? result.data.name : "Your client";
  if (result.success && result.data.status === "ACTIVE") {
    return { status: "success", message: `${name} is already your client.` };
  }
  return { status: "success", message: `Invitation sent to ${name}. They join your list when they accept in the app.` };
}

const clientIdSchema = z.string().uuid();

async function setLinkStatus(clientId: string, status: "ACTIVE" | "CANCELLED", done: string): Promise<ActionResult> {
  const parsed = clientIdSchema.safeParse(clientId);
  if (!parsed.success) return { ok: false, message: "That client could not be found." };
  const session = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("coach_clients")
    .update({ status })
    .eq("coach_id", session.userId)
    .eq("client_id", parsed.data);
  if (error)
    return { ok: false, message: describeDbError(error, KNOWN, "We couldn't update that client. Please retry.") };
  return { ok: true, message: done };
}

/** Accept someone who asked to be coached by scanning the coach's code. The free-plan cap is enforced by the database. */
export async function acceptClient(clientId: string): Promise<ActionResult> {
  return setLinkStatus(clientId, "ACTIVE", "Client accepted.");
}

/** Stop coaching someone, or withdraw an invitation. Their training logs stop being visible straight away. */
export async function endClientLink(clientId: string): Promise<ActionResult> {
  return setLinkStatus(clientId, "CANCELLED", "Removed from your clients.");
}
