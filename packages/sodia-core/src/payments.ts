import { z } from "zod";

/** SKUs sellable through checkout. Court bookings need slot inventory and are not sold here yet. */
export const PAYMENT_SKUS = ["DAY_PASS", "MONTHLY"] as const;
export type PaymentSku = (typeof PAYMENT_SKUS)[number];

/** Request body for the `payments-checkout` edge function. */
export const checkoutRequestSchema = z.object({
  facilityId: z.string().trim().min(1).max(64),
  sku: z.enum(PAYMENT_SKUS),
  /** Client-generated, stable across retries of the same purchase attempt. */
  idempotencyKey: z.string().trim().min(8).max(128),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export interface CheckoutResponse {
  orderId: string;
  checkoutUrl: string;
  totalPhp: number;
  serviceFeePhp: number;
  provider: "XENDIT" | "STRIPE";
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
