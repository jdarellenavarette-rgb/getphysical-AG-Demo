"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { describeDbError, type ActionResult, type FormState } from "../../lib/form-state";
import { createServerSupabase } from "../../lib/supabase/server";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

const eventSchema = z
  .object({
    title: z.string().trim().min(2, "Give the event a name").max(120, "That name is too long"),
    sport: optionalText(40),
    description: optionalText(2000),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
    start: z.string().regex(/^\d{2}:\d{2}$/, "Choose a start time"),
    end: z.union([z.literal(""), z.string().regex(/^\d{2}:\d{2}$/)]),
    capacity: z.union([z.literal(""), z.coerce.number().int().min(1, "Places must be at least 1").max(100000)]),
    fee: z.union([z.literal(""), z.coerce.number().min(0, "The fee can't be negative").max(1_000_000)]),
    categories: z
      .string()
      .transform((value) => [
        ...new Set(
          value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ])
      .pipe(z.array(z.string().max(60, "Keep each category to 60 characters")).max(20, "List up to 20 categories")),
  })
  .transform((value, ctx) => {
    // Times are entered in Manila time, like every other time in the suite.
    const startsAt = new Date(`${value.date}T${value.start}:00+08:00`);
    const endsAt = value.end ? new Date(`${value.date}T${value.end}:00+08:00`) : null;
    if (Number.isNaN(startsAt.getTime())) ctx.addIssue({ code: "custom", message: "Choose a valid date and time" });
    else if (startsAt.getTime() < Date.now())
      ctx.addIssue({ code: "custom", message: "The event must start in the future" });
    if (endsAt && endsAt <= startsAt) ctx.addIssue({ code: "custom", message: "The end time must be after the start" });
    return {
      ...value,
      startsAt,
      endsAt,
      capacity: value.capacity === "" ? null : value.capacity,
      fee: value.fee === "" || value.fee === 0 ? null : value.fee,
    };
  });

function readEventForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title") ?? "",
    sport: formData.get("sport") ?? "",
    description: formData.get("description") ?? "",
    date: formData.get("date") ?? "",
    start: formData.get("start") ?? "",
    end: formData.get("end") ?? "",
    capacity: formData.get("capacity") ?? "",
    fee: formData.get("fee") ?? "",
    categories: formData.get("categories") ?? "",
  });
}

/** Publish a new event at the active venue. People sign up in the Sodia app; capacity is enforced by the database. */
export async function createEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = readEventForm(formData);
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };

  const session = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("events").insert({
    organizer_id: session.userId,
    facility_id: session.active.id,
    title: parsed.data.title,
    sport: parsed.data.sport,
    description: parsed.data.description,
    starts_at: parsed.data.startsAt.toISOString(),
    ends_at: parsed.data.endsAt?.toISOString() ?? null,
    capacity: parsed.data.capacity,
    entry_fee_php: parsed.data.fee,
    categories: parsed.data.categories,
    status: "PUBLISHED",
  });
  if (error)
    return { status: "error", message: describeDbError(error, {}, "We couldn't publish the event. Please retry.") };
  return { status: "success", message: `${parsed.data.title} is published. People can sign up in the Sodia app.` };
}

const idSchema = z.string().uuid();

/** Call an event off. Sign-ups are kept so people can be told; no new ones are accepted. */
export async function cancelEvent(eventId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(eventId);
  if (!parsed.success) return { ok: false, message: "That event could not be found." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("events")
    .update({ status: "CANCELLED" })
    .eq("id", parsed.data)
    .eq("facility_id", active.id);
  if (error) return { ok: false, message: describeDbError(error, {}, "We couldn't cancel the event. Please retry.") };
  return { ok: true, message: "Event cancelled." };
}

/** Mark someone as arrived on the day, or undo it. */
export async function setAttendance(eventId: string, userId: string, present: boolean): Promise<ActionResult> {
  const parsed = z.object({ eventId: idSchema, userId: idSchema }).safeParse({ eventId, userId });
  if (!parsed.success) return { ok: false, message: "That sign-up could not be found." };
  await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("set_event_attendance", {
    p_event_id: parsed.data.eventId,
    p_user_id: parsed.data.userId,
    p_present: present,
  });
  if (error) {
    return {
      ok: false,
      message: describeDbError(
        error,
        { REGISTRATION_NOT_FOUND: "That person is no longer signed up." },
        "We couldn't save that. Please retry.",
      ),
    };
  }
  return { ok: true, message: present ? "Marked as arrived." : "Arrival undone." };
}

/** Change an event's details. People already signed up keep their place and their category. */
export async function updateEvent(eventId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const id = idSchema.safeParse(eventId);
  if (!id.success) return { status: "error", message: "That event could not be found." };
  const parsed = readEventForm(formData);
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("events")
    .update({
      title: parsed.data.title,
      sport: parsed.data.sport,
      description: parsed.data.description,
      starts_at: parsed.data.startsAt.toISOString(),
      ends_at: parsed.data.endsAt?.toISOString() ?? null,
      capacity: parsed.data.capacity,
      entry_fee_php: parsed.data.fee,
      categories: parsed.data.categories,
    })
    .eq("id", id.data)
    .eq("facility_id", active.id)
    .select("id");
  if (error)
    return { status: "error", message: describeDbError(error, {}, "We couldn't save the event. Please retry.") };
  if ((data ?? []).length === 0) return { status: "error", message: "That event could not be found." };
  return { status: "success", message: "Event saved. Tell the people signed up if the time changed." };
}
