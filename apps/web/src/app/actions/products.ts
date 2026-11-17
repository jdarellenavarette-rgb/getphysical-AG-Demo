"use server";

import { productInputSchema } from "sodia-core";
import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { createServerSupabase } from "../../lib/supabase/server";

export interface ProductFormState {
  status: "idle" | "form_validation" | "permission_denied" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "description" | "kind" | "pricePhp" | "durationDays" | "graceDays", string>>;
}

const DENIED: ProductFormState = {
  status: "permission_denied",
  message: "Only the owner or an admin can change plans and prices.",
};

function failure(error: { code?: string; message: string }): ProductFormState {
  if (error.code === "42501") return DENIED;
  if (error.code === "23514") return { status: "error", message: "The standard day pass always lasts 1 day." };
  return { status: "error", message: "We couldn't save that. Please retry." };
}

/** Create a product, or update one when `productId` is given. Prices are enforced again by the database. */
export async function saveProduct(
  productId: string | null,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = productInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: ProductFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ProductFormState["fieldErrors"]>;
      fieldErrors[key] ??= issue.message;
    }
    return { status: "form_validation", fieldErrors };
  }
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const values = {
    name: parsed.data.name,
    description: parsed.data.description,
    price_php: parsed.data.pricePhp,
    duration_days: parsed.data.durationDays,
  };

  if (productId) {
    const id = z.string().uuid().safeParse(productId);
    if (!id.success) return { status: "error", message: "That plan could not be found." };
    // Pass or membership is fixed once created: it decides the service fee on past and future sales.
    const { data, error } = await supabase
      .from("facility_products")
      .update(values)
      .eq("id", id.data)
      .eq("facility_id", active.id)
      .select("id");
    if (error) return failure(error);
    if (data.length === 0) return DENIED;
    return { status: "success", message: "Saved. New purchases use these details; past sales are unchanged." };
  }

  // The venue's first 1-day pass and first monthly membership become its "standard" ones: the two
  // products that app versions predating the catalogue can buy. Everything else is catalogue-only.
  const standardSku =
    parsed.data.kind === "PASS" && parsed.data.durationDays === 1
      ? "DAY_PASS"
      : parsed.data.kind === "MEMBERSHIP" && parsed.data.durationDays >= 28 && parsed.data.durationDays <= 31
        ? "MONTHLY"
        : null;
  if (standardSku) {
    const { data: existing, error: lookupError } = await supabase
      .from("facility_products")
      .select("id")
      .eq("facility_id", active.id)
      .eq("legacy_sku", standardSku)
      .maybeSingle();
    if (lookupError) return failure(lookupError);
    if (!existing) {
      const { data: created, error: createError } = await supabase.rpc("create_standard_product", {
        p_facility_id: active.id,
        p_legacy_sku: standardSku,
        p_price_php: parsed.data.pricePhp,
      });
      if (createError) return failure(createError);
      const { error: detailError } = await supabase.from("facility_products").update(values).eq("id", created.id);
      if (detailError) return failure(detailError);
      return { status: "success", message: `${parsed.data.name} is now on sale.` };
    }
  }

  const { error } = await supabase
    .from("facility_products")
    .insert({ ...values, facility_id: active.id, kind: parsed.data.kind });
  if (error) return failure(error);
  return { status: "success", message: `${parsed.data.name} is now on sale.` };
}

/** Switch a product on or off. Nothing is deleted, so past sales keep their record. */
export async function setProductActive(productId: string, isActive: boolean): Promise<ProductFormState> {
  const id = z.string().uuid().safeParse(productId);
  if (!id.success) return { status: "error", message: "That plan could not be found." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("facility_products")
    .update({ is_active: isActive })
    .eq("id", id.data)
    .eq("facility_id", active.id)
    .select("id");
  if (error) return failure(error);
  if (data.length === 0) return DENIED;
  return { status: "success", message: isActive ? "Switched on." : "Switched off. It can no longer be bought." };
}

const settingsSchema = z.object({
  sellsPasses: z.boolean(),
  sellsMemberships: z.boolean(),
  graceDays: z.coerce
    .number({ message: "Enter a number of days" })
    .int("Use whole days")
    .min(0, "Use 0 or more")
    .max(30, "The most is 30 days"),
});

/** Venue-wide switches: what the venue sells at all, and how long a member stays active after a pass ends. */
export async function updateSellingSettings(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const parsed = settingsSchema.safeParse({
    sellsPasses: formData.get("sellsPasses") === "on",
    sellsMemberships: formData.get("sellsMemberships") === "on",
    graceDays: formData.get("graceDays") ?? 0,
  });
  if (!parsed.success) {
    return { status: "form_validation", fieldErrors: { graceDays: parsed.error.issues[0]?.message } };
  }
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("facilities")
    .update({
      sells_passes: parsed.data.sellsPasses,
      sells_memberships: parsed.data.sellsMemberships,
      membership_grace_days: parsed.data.graceDays,
    })
    .eq("id", active.id)
    .select("id");
  if (error) return failure(error);
  if (data.length === 0) return DENIED;
  return { status: "success", message: "Saved." };
}
