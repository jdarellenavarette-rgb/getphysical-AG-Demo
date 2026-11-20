"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { createServerSupabase } from "../../lib/supabase/server";

export interface VenueFormState {
  status: "idle" | "form_validation" | "permission_denied" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<VenueField, string>>;
}

type VenueField = "name" | "address" | "hours" | "about" | "maxCapacity" | "courtHourlyPricePhp" | "amenities";

const optionalNumber = (max: number, label: string) =>
  z.preprocess(
    (value) => (value === "" || value == null ? null : Number(value)),
    z
      .number({ message: `${label} must be a number` })
      .min(0, `${label} can't be negative`)
      .max(max, `${label} is too high`)
      .nullable(),
  );

const venueSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120, "Name is too long"),
  address: z.string().trim().max(200, "Address is too long"),
  hours: z.string().trim().max(200, "Opening hours are too long"),
  about: z.string().trim().max(500, "Keep the description to 500 characters"),
  maxCapacity: optionalNumber(100_000, "Capacity").pipe(z.number().int("Capacity must be a whole number").nullable()),
  courtHourlyPricePhp: optionalNumber(1_000_000, "Court price"),
  amenities: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .pipe(
      z.array(z.string().max(40, "Each amenity must be 40 characters or fewer")).max(20, "List up to 20 amenities"),
    ),
});

/** Update the venue details members see in the Sodia app. Only owners and admins may; RLS enforces it. */
export async function updateVenueProfile(_prev: VenueFormState, formData: FormData): Promise<VenueFormState> {
  const parsed = venueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: VenueFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as VenueField;
      fieldErrors[key] ??= issue.message;
    }
    return { status: "form_validation", fieldErrors };
  }

  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("facilities")
    .update({
      name: parsed.data.name,
      address: parsed.data.address,
      hours: parsed.data.hours,
      about: parsed.data.about || null,
      max_capacity: parsed.data.maxCapacity,
      court_hourly_price_php: parsed.data.courtHourlyPricePhp,
      amenities: parsed.data.amenities,
    })
    .eq("id", active.id)
    .select("id");
  if (error) return { status: "error", message: "We couldn't save the venue details. Please retry." };
  // RLS filters the row out for non-admins, so nothing is updated and nothing is returned.
  if (data.length === 0) {
    return { status: "permission_denied", message: "Only the owner or an admin can change venue details." };
  }
  return { status: "success", message: "Venue details saved." };
}
