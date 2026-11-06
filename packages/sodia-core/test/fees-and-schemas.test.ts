import { describe, expect, it } from "vitest";
import { calculateHybridServiceFee } from "../src/constants";
import { crmBroadcastInputSchema, toDbAudience } from "../src/crm.types";
import { checkoutRequestSchema } from "../src/payments";
import { assertClientSupabaseConfig, SupabaseConfigError } from "../src/client";

// Must stay in lockstep with public.calculate_service_fee (supabase/tests/50_payments_ledger.test.sql).
describe("calculateHybridServiceFee", () => {
  it("charges a fixed ₱15 on one-time passes", () => {
    expect(calculateHybridServiceFee(250, "one_time_pass")).toEqual({
      baseAmountPhp: 250,
      serviceFeePhp: 15,
      totalChargePhp: 265,
    });
  });
  it("charges nothing on free items", () => {
    expect(calculateHybridServiceFee(0, "one_time_pass").serviceFeePhp).toBe(0);
  });
  it("charges 5% on subscriptions, rounded to centavos", () => {
    expect(calculateHybridServiceFee(1500, "recurring_subscription").serviceFeePhp).toBe(75);
    expect(calculateHybridServiceFee(999.99, "recurring_subscription").serviceFeePhp).toBe(50);
  });
});

describe("crmBroadcastInputSchema", () => {
  const base = { facilityId: "fac_a", suiteMode: "GYMDASH", audience: "ALL", title: "Open house", body: "Saturday" } as const;
  it("normalises promo codes", () => {
    expect(crmBroadcastInputSchema.parse({ ...base, promoCode: " metro2026 " }).promoCode).toBe("METRO2026");
  });
  it("treats an empty promo code as absent", () => {
    expect(crmBroadcastInputSchema.parse({ ...base, promoCode: "" }).promoCode).toBeUndefined();
  });
  it("rejects oversize titles and direct sends without a target", () => {
    expect(crmBroadcastInputSchema.safeParse({ ...base, title: "x".repeat(121) }).success).toBe(false);
    expect(crmBroadcastInputSchema.safeParse({ ...base, audience: "USER" }).success).toBe(false);
  });
  it("maps UI segments to database audiences", () => {
    expect(toDbAudience("SEGMENT_2")).toEqual({ audience: "SEGMENT", segmentKey: "SEGMENT_2" });
    expect(toDbAudience("ALL")).toEqual({ audience: "ALL", segmentKey: null });
  });
});

describe("checkoutRequestSchema", () => {
  it("only allows sellable SKUs", () => {
    expect(checkoutRequestSchema.safeParse({ facilityId: "fac_a", sku: "COURT_HOUR", idempotencyKey: "12345678" }).success).toBe(false);
    expect(checkoutRequestSchema.safeParse({ facilityId: "fac_a", sku: "DAY_PASS", idempotencyKey: "12345678" }).success).toBe(true);
  });
});

describe("assertClientSupabaseConfig", () => {
  const url = "https://example.supabase.co";
  const fakeJwt = (role: string) => `x.${btoa(JSON.stringify({ role })).replace(/=+$/, "")}.y`;

  it("requires both values", () => {
    expect(() => assertClientSupabaseConfig({ supabaseUrl: url })).toThrow(SupabaseConfigError);
  });
  it("refuses service_role keys in client apps", () => {
    expect(() => assertClientSupabaseConfig({ supabaseUrl: url, supabaseAnonKey: fakeJwt("service_role") })).toThrow(/service_role/);
    expect(() => assertClientSupabaseConfig({ supabaseUrl: url, supabaseAnonKey: "sb_secret_abc" })).toThrow(/service_role/);
  });
  it("refuses plain http outside localhost", () => {
    expect(() => assertClientSupabaseConfig({ supabaseUrl: "http://192.168.1.3:54321", supabaseAnonKey: fakeJwt("anon") })).toThrow(/https/);
    expect(assertClientSupabaseConfig({ supabaseUrl: "http://127.0.0.1:54321", supabaseAnonKey: fakeJwt("anon") }).supabaseUrl).toBe("http://127.0.0.1:54321");
  });
});
