"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { findPerson } from "../../lib/data/people";
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
    bookingId: z.union([z.literal(""), z.string().uuid()]),
    spaceId: z.string().uuid("Choose a court"),
    person: z.union([z.literal(""), z.string().regex(/^[uc]:[0-9a-f-]{36}$/)]),
    bookedFor: z.string().trim().max(120, "That name is too long"),
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
    if (!value.bookingId && !value.person && !value.bookedFor) {
      ctx.addIssue({ code: "custom", message: "Choose who the booking is for, or type a name" });
    }
    return { ...value, startsAt, endsAt: new Date(startsAt.getTime() + value.minutes * 60_000) };
  });

/** Book a court for someone at the desk. Double bookings and layout clashes are refused by the database. */
export async function createBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = bookingSchema.safeParse({
    bookingId: formData.get("bookingId") ?? "",
    spaceId: formData.get("spaceId") ?? "",
    person: formData.get("person") ?? "",
    bookedFor: formData.get("bookedFor") ?? "",
    date: formData.get("date") ?? "",
    start: formData.get("start") ?? "",
    minutes: formData.get("minutes") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };
  const { active } = await requireSuiteSession();
  // A booking for someone on the list is tied to their record, so it shows up next to them.
  const person = parsed.data.person ? await findPerson(active.id, parsed.data.person) : null;
  if (parsed.data.person && !person) {
    return { status: "form_validation", message: "That person is no longer on your list. Choose again." };
  }
  const bookedFor = parsed.data.bookedFor || person?.name || "Booking";
  const supabase = await createServerSupabase();
  const when = { starts_at: parsed.data.startsAt.toISOString(), ends_at: parsed.data.endsAt.toISOString() };
  // Moving a booking keeps who it is for and what was paid; the price is worked out again.
  const { error } = parsed.data.bookingId
    ? await supabase
        .from("space_bookings")
        .update({ space_id: parsed.data.spaceId, note: parsed.data.note, ...when })
        .eq("id", parsed.data.bookingId)
        .eq("facility_id", active.id)
    : await supabase.from("space_bookings").insert({
        facility_id: active.id,
        space_id: parsed.data.spaceId,
        booked_for: bookedFor,
        user_id: person?.userId ?? null,
        contact_id: person?.contactId ?? null,
        note: parsed.data.note,
        ...when,
      });
  if (error) {
    const clash = error.message.includes("SPACE_");
    return {
      status: clash ? "form_validation" : "error",
      message: describeDbError(error, KNOWN, "We couldn't save the booking. Please retry."),
    };
  }
  return { status: "success", message: parsed.data.bookingId ? "Booking moved." : `Booked for ${bookedFor}.` };
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

const money = z.union([z.literal(""), z.coerce.number().min(0, "Prices can't be negative").max(100000)]);
const hour = z.union([z.literal(""), z.coerce.number().int().min(0).max(24)]);

/**
 * Set what each court costs per hour, and the hours when the peak rate applies. Owners and admins
 * only. Bookings made from now on are priced from these; existing bookings keep their price.
 */
export async function updateCourtPrices(_prev: FormState, formData: FormData): Promise<FormState> {
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const peak = z.object({ start: hour, end: hour }).safeParse({
    start: formData.get("peakStart") ?? "",
    end: formData.get("peakEnd") ?? "",
  });
  if (!peak.success) return { status: "form_validation", message: "Choose valid peak hours." };
  const { start, end } = peak.data;
  if ((start === "") !== (end === "")) {
    return { status: "form_validation", message: "Choose both a start and an end for peak hours, or neither." };
  }
  if (start !== "" && end !== "" && end <= start) {
    return { status: "form_validation", message: "Peak hours must end after they start." };
  }

  const { data: spaces, error: loadError } = await supabase
    .from("facility_spaces")
    .select("id, name")
    .eq("facility_id", active.id);
  if (loadError) return { status: "error", message: "We couldn't load your courts. Please retry." };

  for (const space of spaces ?? []) {
    const rates = z.object({ rate: money, peakRate: money }).safeParse({
      rate: formData.get(`rate_${space.id}`) ?? "",
      peakRate: formData.get(`peak_${space.id}`) ?? "",
    });
    if (!rates.success) {
      return { status: "form_validation", message: `${space.name}: ${rates.error.issues[0]?.message}` };
    }
    const { error } = await supabase
      .from("facility_spaces")
      .update({
        rate_php: rates.data.rate === "" ? null : rates.data.rate,
        peak_rate_php: rates.data.peakRate === "" ? null : rates.data.peakRate,
      })
      .eq("id", space.id)
      .eq("facility_id", active.id);
    if (error)
      return { status: "error", message: describeDbError(error, KNOWN, "We couldn't save the prices. Please retry.") };
  }
  const { data: saved, error } = await supabase
    .from("facilities")
    .update({ peak_start_hour: start === "" ? null : start, peak_end_hour: end === "" ? null : end })
    .eq("id", active.id)
    .select("id");
  if (error) return { status: "error", message: "We couldn't save the peak hours. Please retry." };
  if ((saved ?? []).length === 0) {
    return { status: "error", message: "Only the owner or an admin can change prices." };
  }
  return { status: "success", message: "Prices saved. New bookings use them." };
}
