/**
 * Request/response schemas for the edge functions.
 * Mirrors packages/sodia-core/src/payments.ts (the apps' copy); the parity test
 * in supabase/functions/_shared/schemas.test.ts keeps the two in lockstep.
 */
import { z } from "zod";

export const PAYMENT_SKUS = ["DAY_PASS", "MONTHLY"] as const;

export const checkoutRequestSchema = z.object({
  facilityId: z.string().trim().min(1).max(64),
  sku: z.enum(PAYMENT_SKUS),
  idempotencyKey: z.string().trim().min(8).max(128),
});

export const nutritionParseRequestSchema = z.object({
  meal: z.string().trim().min(2, "Describe your meal").max(500, "Keep it under 500 characters"),
});

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
