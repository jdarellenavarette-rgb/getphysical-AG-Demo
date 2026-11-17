import { describe, expect, it } from "vitest";
import {
  hmacSha256Hex,
  verifyStripeSignature,
  verifyXenditCallbackToken,
} from "../../../supabase/functions/_shared/signatures";
import * as edge from "../../../supabase/functions/_shared/schemas";
import * as core from "../src/payments";

describe("verifyStripeSignature", () => {
  const secret = "whsec_test_secret";
  const body = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });
  const now = 1_762_400_000;

  it("accepts a valid v1 signature", async () => {
    const sig = await hmacSha256Hex(secret, `${now}.${body}`);
    expect(await verifyStripeSignature(body, `t=${now},v1=${sig}`, secret, now)).toBe(true);
  });
  it("accepts when any of several v1 signatures match (secret rotation)", async () => {
    const sig = await hmacSha256Hex(secret, `${now}.${body}`);
    expect(await verifyStripeSignature(body, `t=${now},v1=deadbeef,v1=${sig}`, secret, now)).toBe(true);
  });
  it("rejects a tampered body", async () => {
    const sig = await hmacSha256Hex(secret, `${now}.${body}`);
    expect(await verifyStripeSignature(body.replace("evt_1", "evt_2"), `t=${now},v1=${sig}`, secret, now)).toBe(false);
  });
  it("rejects replays outside the 5-minute tolerance", async () => {
    const sig = await hmacSha256Hex(secret, `${now}.${body}`);
    expect(await verifyStripeSignature(body, `t=${now},v1=${sig}`, secret, now + 301)).toBe(false);
  });
  it("rejects missing or malformed headers", async () => {
    expect(await verifyStripeSignature(body, null, secret, now)).toBe(false);
    expect(await verifyStripeSignature(body, "v1=abc", secret, now)).toBe(false);
  });
  it("matches Node's HMAC implementation", async () => {
    const { createHmac } = await import("node:crypto");
    expect(await hmacSha256Hex(secret, "payload")).toBe(createHmac("sha256", secret).update("payload").digest("hex"));
  });
});

describe("verifyXenditCallbackToken", () => {
  it("accepts the exact token only", () => {
    expect(verifyXenditCallbackToken("tok_123", "tok_123")).toBe(true);
    expect(verifyXenditCallbackToken("tok_124", "tok_123")).toBe(false);
    expect(verifyXenditCallbackToken("tok_12", "tok_123")).toBe(false);
    expect(verifyXenditCallbackToken(null, "tok_123")).toBe(false);
    expect(verifyXenditCallbackToken("", "")).toBe(false);
  });
});

describe("edge ⇄ app schema parity", () => {
  const checkoutCases: unknown[] = [
    { facilityId: "fac_a", sku: "DAY_PASS", idempotencyKey: "12345678" },
    { facilityId: "fac_a", sku: "MONTHLY", idempotencyKey: "x".repeat(128) },
    { facilityId: "fac_a", sku: "COURT_HOUR", idempotencyKey: "12345678" },
    { facilityId: "", sku: "DAY_PASS", idempotencyKey: "12345678" },
    { facilityId: "fac_a", sku: "DAY_PASS", idempotencyKey: "short" },
  ];
  it.each(checkoutCases)("checkout schemas agree on %j", (input) => {
    expect(edge.checkoutRequestSchema.safeParse(input).success).toBe(
      core.checkoutRequestSchema.safeParse(input).success,
    );
  });

  const nutritionResults: unknown[] = [
    { headline: "Eggs", items: [{ name: "Egg", portion: "1", cal: 72, p: 6, c: 0, f: 5 }], guruCommentary: "ok" },
    { headline: "Eggs", items: [], guruCommentary: "ok" },
    { headline: "Eggs", items: [{ name: "Egg", portion: "1", cal: -1, p: 6, c: 0, f: 5 }], guruCommentary: "ok" },
  ];
  it.each(nutritionResults)("nutrition result schemas agree on %j", (input) => {
    expect(edge.nutritionParseResultSchema.safeParse(input).success).toBe(
      core.nutritionParseResultSchema.safeParse(input).success,
    );
  });
});

describe("request body size limit", () => {
  it("accepts normal bodies and rejects oversized ones before parsing", async () => {
    const { readJson, MAX_BODY_BYTES } = await import("../../../supabase/functions/_shared/http");
    const ok = new Request("https://x/fn", { method: "POST", body: JSON.stringify({ meal: "2 eggs" }) });
    expect(await readJson(ok)).toEqual({ meal: "2 eggs" });

    const huge = new Request("https://x/fn", { method: "POST", body: "a".repeat(MAX_BODY_BYTES + 1) });
    await expect(readJson(huge)).rejects.toMatchObject({ status: 413, code: "PAYLOAD_TOO_LARGE" });

    const lying = new Request("https://x/fn", {
      method: "POST",
      body: "a".repeat(MAX_BODY_BYTES + 1),
      headers: { "content-length": "10" },
    });
    await expect(readJson(lying)).rejects.toMatchObject({ status: 413 });

    const bad = new Request("https://x/fn", { method: "POST", body: "{not json" });
    await expect(readJson(bad)).rejects.toMatchObject({ status: 400, code: "INVALID_JSON" });
  });
});
