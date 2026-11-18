"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { describeDbError, type ActionResult, type FormState } from "../../lib/form-state";
import { createServerSupabase } from "../../lib/supabase/server";

const KNOWN = {
  SPACE_ALREADY_BOOKED: "That court is already booked for part of that time.",
  SPACE_LAYOUT_CONFLICT:
    "The court is in use in its other layout around that time. Allow 15 minutes to change between the whole court and its smaller courts.",
  SPACE_INACTIVE: "That court is switched off. Turn it back on under Courts first.",
  INVALID_PARENT_SPACE: "A court can only be divided once.",
  facility_spaces_facility_id_name_key: "You already have a court with that name.",
};

const spaceSchema = z.object({
  name: z.string().trim().min(1, "Give the court a name").max(60, "That name is too long"),
  sport: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value || null),
  parentId: z.union([z.literal(""), z.string().uuid()]).transform((value) => value || null),
});

/** Add a court, or a smaller court that shares the floor of an existing one. Owners and admins only. */
export async function createSpace(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = spaceSchema.safeParse({
    name: formData.get("name") ?? "",
    sport: formData.get("sport") ?? "",
    parentId: formData.get("parentId") ?? "",
  });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("facility_spaces").insert({
    facility_id: active.id,
    name: parsed.data.name,
    sport: parsed.data.sport,
    parent_id: parsed.data.parentId,
  });
  if (error) {
    return {
      status: error.code === "23505" ? "form_validation" : "error",
      message: describeDbError(error, KNOWN, "We couldn't add the court. Please retry."),
    };
  }
  return { status: "success", message: `${parsed.data.name} added.` };
}

const idSchema = z.string().uuid();

/** Take a court out of use (or bring it back). Existing bookings stay; new ones are refused while it is off. */
export async function setSpaceActive(spaceId: string, isActive: boolean): Promise<ActionResult> {
  const parsed = idSchema.safeParse(spaceId);
  if (!parsed.success) return { ok: false, message: "That court could not be found." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("facility_spaces")
    .update({ is_active: isActive })
    .eq("id", parsed.data)
    .eq("facility_id", active.id);
  if (error)
    return { ok: false, message: describeDbError(error, KNOWN, "We couldn't update the court. Please retry.") };
  return { ok: true, message: isActive ? "Court is back in use." : "Court switched off." };
}

const bookingSchema = z
  .object({
    spaceId: z.string().uuid("Choose a court"),
    bookedFor: z.string().trim().min(1, "Say who the booking is for").max(120, "That name is too long"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
    start: z.string().regex(/^\d{2}:\d{2}$/, "Choose a start time"),
    minutes: z.coerce.number().int().min(30).max(720),
    note: z
      .string()
      .trim()
      .max(300)
      .transform((value) => value || null),
  })
  .transform((value, ctx) => {
    // Entered in Manila time, like every other time in the suite.
    const startsAt = new Date(`${value.date}T${value.start}:00+08:00`);
    if (Number.isNaN(startsAt.getTime())) ctx.addIssue({ code: "custom", message: "Choose a valid date and time" });
    return { ...value, startsAt, endsAt: new Date(startsAt.getTime() + value.minutes * 60_000) };
  });

/** Book a court for someone at the desk. Double bookings and layout clashes are refused by the database. */
export async function createBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = bookingSchema.safeParse({
    spaceId: formData.get("spaceId") ?? "",
    bookedFor: formData.get("bookedFor") ?? "",
    date: formData.get("date") ?? "",
    start: formData.get("start") ?? "",
    minutes: formData.get("minutes") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("space_bookings").insert({
    facility_id: active.id,
    space_id: parsed.data.spaceId,
    booked_for: parsed.data.bookedFor,
    note: parsed.data.note,
    starts_at: parsed.data.startsAt.toISOString(),
    ends_at: parsed.data.endsAt.toISOString(),
  });
  if (error) {
    const clash = error.message.includes("SPACE_");
    return {
      status: clash ? "form_validation" : "error",
      message: describeDbError(error, KNOWN, "We couldn't save the booking. Please retry."),
    };
  }
  return { status: "success", message: `Booked for ${parsed.data.bookedFor}.` };
}

/** Cancel a booking and free the slot. The record is kept. */
export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(bookingId);
  if (!parsed.success) return { ok: false, message: "That booking could not be found." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("space_bookings")
    .update({ status: "CANCELLED" })
    .eq("id", parsed.data)
    .eq("facility_id", active.id);
  if (error)
    return { ok: false, message: describeDbError(error, KNOWN, "We couldn't cancel the booking. Please retry.") };
  return { ok: true, message: "Booking cancelled." };
}
