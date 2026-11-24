"use server";

import { coachPlanDaysSchema } from "sodia-core";
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

const packSchema = z.object({
  clientId: z.string().uuid("Choose a client"),
  name: z.string().trim().min(1, "Give the pack a name").max(80, "That name is too long"),
  sessions: z.coerce.number().int("Sessions must be a whole number").min(1, "At least 1 session").max(500),
  price: z.union([z.literal(""), z.coerce.number().min(0, "The price can't be negative").max(1_000_000)]),
});

/** Sell a client a pack of sessions. Sessions are counted down as you log them. */
export async function createPack(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = packSchema.safeParse({
    clientId: formData.get("clientId") ?? "",
    name: formData.get("name") ?? "",
    sessions: formData.get("sessions") ?? "",
    price: formData.get("price") ?? "",
  });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("coach_packs").insert({
    client_id: parsed.data.clientId,
    facility_id: active.id,
    name: parsed.data.name,
    sessions_total: parsed.data.sessions,
    price_php: parsed.data.price === "" ? null : parsed.data.price,
  });
  if (error) {
    return {
      status: "error",
      message: describeDbError(
        error,
        { NOT_A_CLIENT: "That person is not on your client list." },
        "We couldn't create the pack. Please retry.",
      ),
    };
  }
  return { status: "success", message: `${parsed.data.name} created with ${parsed.data.sessions} sessions.` };
}

/** Count one session as held, now. Refused when the pack has none left. */
export async function logSession(packId: string): Promise<ActionResult> {
  const parsed = clientIdSchema.safeParse(packId);
  if (!parsed.success) return { ok: false, message: "That pack could not be found." };
  await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("coach_sessions").insert({ pack_id: parsed.data });
  if (error) {
    return {
      ok: false,
      message: describeDbError(
        error,
        { PACK_USED_UP: "That pack has no sessions left. Sell a new one." },
        "We couldn't log the session. Please retry.",
      ),
    };
  }
  return { ok: true, message: "Session logged." };
}

/** Take back the most recent session, for one logged by mistake. */
export async function undoSession(packId: string): Promise<ActionResult> {
  const parsed = clientIdSchema.safeParse(packId);
  if (!parsed.success) return { ok: false, message: "That pack could not be found." };
  await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data: last, error: findError } = await supabase
    .from("coach_sessions")
    .select("id")
    .eq("pack_id", parsed.data)
    .lte("held_at", new Date().toISOString())
    .order("held_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (findError) return { ok: false, message: "We couldn't find the last session. Please retry." };
  if (!last) return { ok: false, message: "No session has been logged on that pack." };
  const { error } = await supabase.from("coach_sessions").delete().eq("id", last.id);
  if (error) return { ok: false, message: describeDbError(error, {}, "We couldn't undo that. Please retry.") };
  return { ok: true, message: "Last session removed." };
}

const scheduleSchema = z
  .object({
    packId: z.string().uuid("Choose a pack"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time"),
    note: z.string().trim().max(300, "Keep the note under 300 characters"),
  })
  .transform((value, ctx) => {
    // Times are entered in Manila time, like every other time in the suite.
    const at = new Date(`${value.date}T${value.time}:00+08:00`);
    if (Number.isNaN(at.getTime())) ctx.addIssue({ code: "custom", message: "Choose a valid date and time" });
    else if (at.getTime() <= Date.now())
      ctx.addIssue({
        code: "custom",
        message: "Choose a time in the future. For a session already held, use Log session.",
      });
    return { ...value, at };
  });

/** Book a session for later. It takes one place in the pack straight away. */
export async function scheduleSession(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = scheduleSchema.safeParse({
    packId: formData.get("packId") ?? "",
    date: formData.get("date") ?? "",
    time: formData.get("time") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("coach_sessions")
    .insert({ pack_id: parsed.data.packId, held_at: parsed.data.at.toISOString(), note: parsed.data.note || null });
  if (error) {
    return {
      status: "error",
      message: describeDbError(
        error,
        { PACK_USED_UP: "That pack has no sessions left. Sell a new one." },
        "We couldn't book the session. Please retry.",
      ),
    };
  }
  return { status: "success", message: "Session booked." };
}

/** Cancel a session that has not happened yet. Its place goes back to the pack. */
export async function cancelSession(sessionId: string): Promise<ActionResult> {
  const parsed = clientIdSchema.safeParse(sessionId);
  if (!parsed.success) return { ok: false, message: "That session could not be found." };
  await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("coach_sessions")
    .delete()
    .eq("id", parsed.data)
    .gt("held_at", new Date().toISOString())
    .select("id");
  if (error) return { ok: false, message: describeDbError(error, {}, "We couldn't cancel that. Please retry.") };
  if (data.length === 0) return { ok: false, message: "That session has already happened or was cancelled." };
  return { ok: true, message: "Session cancelled. Its place is back in the pack." };
}

/**
 * Set a client's training week. A client has one current plan with each coach, so saving a new
 * one ends the old one; ended plans are kept.
 */
export async function savePlan(_prev: FormState, formData: FormData): Promise<FormState> {
  const client = clientIdSchema.safeParse(formData.get("clientId") ?? "");
  if (!client.success) return { status: "form_validation", message: "Choose a client" };
  const title = z
    .string()
    .trim()
    .min(1, "Give the plan a name")
    .max(80, "That name is too long")
    .safeParse(formData.get("title") ?? "");
  if (!title.success) return { status: "form_validation", message: title.error.issues[0]?.message };
  const days = coachPlanDaysSchema.safeParse(
    [0, 1, 2, 3, 4, 5, 6]
      .filter((weekday) => formData.get(`day${weekday}`) === "on")
      .map((weekday) => ({ weekday, focus: String(formData.get(`focus${weekday}`) ?? "") })),
  );
  if (!days.success) {
    return {
      status: "form_validation",
      message: "Tick at least one training day, and keep each focus under 80 characters.",
    };
  }
  const { userId } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error: endError } = await supabase
    .from("coach_plans")
    .update({ ended_at: new Date().toISOString() })
    .eq("coach_id", userId)
    .eq("client_id", client.data)
    .is("ended_at", null);
  if (endError) return { status: "error", message: "We couldn't replace the current plan. Please retry." };
  const { error } = await supabase
    .from("coach_plans")
    .insert({ client_id: client.data, title: title.data, days: days.data });
  if (error) {
    return {
      status: "error",
      message: describeDbError(
        error,
        { NOT_A_CLIENT: "That person is not on your client list." },
        "We couldn't save the plan. Please retry.",
      ),
    };
  }
  return { status: "success", message: `Plan saved: ${days.data.length} training days a week.` };
}

/** Stop following a plan. */
export async function endPlan(planId: string): Promise<ActionResult> {
  const parsed = clientIdSchema.safeParse(planId);
  if (!parsed.success) return { ok: false, message: "That plan could not be found." };
  const { userId } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("coach_plans")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", parsed.data)
    .eq("coach_id", userId);
  if (error) return { ok: false, message: describeDbError(error, {}, "We couldn't end the plan. Please retry.") };
  return { ok: true, message: "Plan ended." };
}
