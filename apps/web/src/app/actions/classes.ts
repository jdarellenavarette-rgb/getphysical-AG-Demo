"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { findPerson } from "../../lib/data/people";
import { describeDbError, type ActionResult, type FormState } from "../../lib/form-state";
import { createServerSupabase } from "../../lib/supabase/server";

const KNOWN = {
  CLASS_CLOSED: "That class has finished or been cancelled.",
  ALREADY_BOOKED: "That person already has a place in this class.",
  CLASS_NOT_FOUND: "That class could not be found.",
  FORBIDDEN: "You don't have permission to do this here.",
};

const classSchema = z
  .object({
    title: z.string().trim().min(2, "Give the class a name").max(80, "That name is too long"),
    instructor: z
      .string()
      .trim()
      .max(80)
      .transform((value) => value || null),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
    start: z.string().regex(/^\d{2}:\d{2}$/, "Choose a start time"),
    minutes: z.coerce.number().int().min(15).max(480),
    capacity: z.coerce.number().int("Places must be a whole number").min(1, "At least 1 place").max(1000),
    price: z.union([z.literal(""), z.coerce.number().min(0, "The price can't be negative").max(100000)]),
    weeks: z.coerce.number().int().min(1).max(12),
  })
  .transform((value, ctx) => {
    // Entered in Manila time, like every other time in the suite.
    const first = new Date(`${value.date}T${value.start}:00+08:00`);
    if (Number.isNaN(first.getTime())) ctx.addIssue({ code: "custom", message: "Choose a valid date and time" });
    else if (first.getTime() < Date.now())
      ctx.addIssue({ code: "custom", message: "The class must start in the future" });
    return { ...value, first };
  });

/** Put a class on the timetable, once or on the same day and time for several weeks. */
export async function createClasses(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = classSchema.safeParse({
    title: formData.get("title") ?? "",
    instructor: formData.get("instructor") ?? "",
    date: formData.get("date") ?? "",
    start: formData.get("start") ?? "",
    minutes: formData.get("minutes") ?? "",
    capacity: formData.get("capacity") ?? "",
    price: formData.get("price") ?? "",
    weeks: formData.get("weeks") ?? "1",
  });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const rows = Array.from({ length: parsed.data.weeks }, (_, week) => {
    const startsAt = new Date(parsed.data.first.getTime() + week * 7 * 86_400_000);
    return {
      facility_id: active.id,
      title: parsed.data.title,
      instructor: parsed.data.instructor,
      starts_at: startsAt.toISOString(),
      ends_at: new Date(startsAt.getTime() + parsed.data.minutes * 60_000).toISOString(),
      capacity: parsed.data.capacity,
      price_php: parsed.data.price === "" || parsed.data.price === 0 ? null : parsed.data.price,
    };
  });
  const { error } = await supabase.from("class_sessions").insert(rows);
  if (error)
    return { status: "error", message: describeDbError(error, KNOWN, "We couldn't add the class. Please retry.") };
  return {
    status: "success",
    message:
      parsed.data.weeks === 1
        ? `${parsed.data.title} is on the timetable.`
        : `${parsed.data.title} is on the timetable for ${parsed.data.weeks} weeks.`,
  };
}

const idSchema = z.string().uuid();

/** Call a class off. Bookings are kept so people can be told; no new ones are taken. */
export async function cancelClass(classId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(classId);
  if (!parsed.success) return { ok: false, message: "That class could not be found." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("class_sessions")
    .update({ status: "CANCELLED" })
    .eq("id", parsed.data)
    .eq("facility_id", active.id);
  if (error)
    return { ok: false, message: describeDbError(error, KNOWN, "We couldn't cancel the class. Please retry.") };
  return { ok: true, message: "Class cancelled." };
}

const placeSchema = z
  .object({
    person: z.union([z.literal(""), z.string().regex(/^[uc]:[0-9a-f-]{36}$/)]),
    name: z.string().trim().max(120, "That name is too long"),
  })
  .refine((value) => value.person || value.name, "Choose someone from your list, or type a name");

/** Give someone a place at the desk. When the class is full they join the waitlist. */
export async function addToClass(classId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const id = idSchema.safeParse(classId);
  if (!id.success) return { status: "error", message: "That class could not be found." };
  const parsed = placeSchema.safeParse({ person: formData.get("person") ?? "", name: formData.get("name") ?? "" });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const person = parsed.data.person ? await findPerson(active.id, parsed.data.person) : null;
  if (parsed.data.person && !person) {
    return { status: "form_validation", message: "That person is no longer on your list. Choose again." };
  }
  const name = person?.name ?? parsed.data.name;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("staff_book_class", {
    p_session_id: id.data,
    p_name: name,
    p_user_id: person?.userId ?? undefined,
    p_contact_id: person?.contactId ?? undefined,
  });
  if (error) {
    return {
      status: error.message.includes("ALREADY_BOOKED") ? "form_validation" : "error",
      message: describeDbError(error, KNOWN, "We couldn't book that place. Please retry."),
    };
  }
  return {
    status: "success",
    message: data === "WAITLIST" ? `The class is full. ${name} is on the waitlist.` : `${name} has a place.`,
  };
}

/** Give up a place. The first person waiting takes it. */
export async function cancelPlace(bookingId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(bookingId);
  if (!parsed.success) return { ok: false, message: "That booking could not be found." };
  await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("cancel_class_booking", { p_booking_id: parsed.data });
  if (error)
    return { ok: false, message: describeDbError(error, KNOWN, "We couldn't cancel that place. Please retry.") };
  return { ok: true, message: "Place cancelled." };
}

export async function setClassAttendance(bookingId: string, present: boolean): Promise<ActionResult> {
  const parsed = idSchema.safeParse(bookingId);
  if (!parsed.success) return { ok: false, message: "That booking could not be found." };
  await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("set_class_attendance", { p_booking_id: parsed.data, p_present: present });
  if (error) return { ok: false, message: describeDbError(error, KNOWN, "We couldn't save that. Please retry.") };
  return { ok: true, message: present ? "Marked as attended." : "Attendance undone." };
}
