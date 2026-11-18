import { z } from "zod";

/**
 * The two original SKUs. Venues now define their own products (`facility_products`); these map to each
 * venue's standard day pass and standard monthly membership and keep older app versions working.
 */
export const PAYMENT_SKUS = ["DAY_PASS", "MONTHLY"] as const;
export type PaymentSku = (typeof PAYMENT_SKUS)[number];

/** Request body for the `payments-checkout` edge function. */
export const checkoutRequestSchema = z.object({
  facilityId: z.string().trim().min(1).max(64),
  /** One of the original SKUs, or the id of a product from the venue's catalogue (`facility_products`). */
  sku: z.union([z.enum(PAYMENT_SKUS), z.string().uuid()]),
  /** Client-generated, stable across retries of the same purchase attempt. */
  idempotencyKey: z.string().trim().min(8).max(128),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

/** What a venue sells: a one-off PASS (fixed ₱15 service fee) or a MEMBERSHIP (5% service fee). */
export const PRODUCT_KINDS = ["PASS", "MEMBERSHIP"] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

/** A row of `facility_products` as both apps read it. */
export const facilityProductSchema = z.object({
  id: z.string().uuid(),
  facility_id: z.string(),
  name: z.string(),
  description: z.string(),
  kind: z.enum(PRODUCT_KINDS),
  price_php: z.number().positive(),
  duration_days: z.number().int().min(1).max(366),
  is_active: z.boolean(),
  sort_order: z.number().int(),
  legacy_sku: z.enum(PAYMENT_SKUS).nullable(),
});
export type FacilityProduct = z.infer<typeof facilityProductSchema>;

/** Venue-defined values for a product, validated the same way wherever it is edited. */
export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80, "Name is too long"),
  description: z.string().trim().max(200, "Keep the description under 200 characters").default(""),
  kind: z.enum(PRODUCT_KINDS, { message: "Choose pass or membership" }),
  pricePhp: z.coerce
    .number({ message: "Enter a price" })
    .positive("Price must be more than ₱0")
    .max(1_000_000, "Price is too high"),
  durationDays: z.coerce
    .number({ message: "Enter how many days it lasts" })
    .int("Use whole days")
    .min(1, "It must last at least 1 day")
    .max(366, "It can last at most 366 days"),
});
export type ProductInput = z.infer<typeof productInputSchema>;

/** "1 day", "7 days", "1 month", "1 year": the same wording in both apps. */
export function describeProductLength(durationDays: number): string {
  if (durationDays === 1) return "1 day";
  if (durationDays === 7) return "1 week";
  if (durationDays === 30 || durationDays === 31) return "1 month";
  if (durationDays === 365 || durationDays === 366) return "1 year";
  return `${durationDays} days`;
}

export interface CheckoutResponse {
  orderId: string;
  checkoutUrl: string;
  totalPhp: number;
  serviceFeePhp: number;
  provider: "XENDIT" | "STRIPE" | "MAYA";
}

/** Request body for the `nutrition-parse` edge function. */
export const nutritionParseRequestSchema = z.object({
  meal: z.string().trim().min(2, "Describe your meal").max(500, "Keep it under 500 characters"),
});
export type NutritionParseRequest = z.infer<typeof nutritionParseRequestSchema>;

export const nutritionItemSchema = z.object({
  name: z.string().min(1).max(80),
  portion: z.string().max(80),
  cal: z.number().min(0).max(5000),
  p: z.number().min(0).max(500),
  c: z.number().min(0).max(1000),
  f: z.number().min(0).max(500),
});

export const nutritionParseResultSchema = z.object({
  headline: z.string().min(1).max(80),
  items: z.array(nutritionItemSchema).min(1).max(20),
  guruCommentary: z.string().max(400),
});
export type NutritionParseResult = z.infer<typeof nutritionParseResultSchema>;
