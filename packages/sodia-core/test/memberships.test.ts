import { describe, expect, it } from "vitest";
import {
  MEMBER_STANDINGS,
  checkoutRequestSchema,
  describeProductLength,
  productInputSchema,
  crmBroadcastInputSchema,
  describeStanding,
  memberDirectoryRowSchema,
  myMembershipRowSchema,
  standingAllowsEntry,
  toDbAudience,
} from "../src";

describe("member standing", () => {
  it("has venue and member wording for every standing", () => {
    for (const standing of MEMBER_STANDINGS) {
      const label = describeStanding(standing);
      expect(label.label.length).toBeGreaterThan(0);
      expect(label.forVenue.length).toBeGreaterThan(0);
      expect(label.forMember.length).toBeGreaterThan(0);
    }
  });

  it("only an active member of a commercial gym is waved through a door", () => {
    expect(standingAllowsEntry("ACTIVE", "COMMERCIAL")).toBe(true);
    expect(standingAllowsEntry("LAPSED", "COMMERCIAL")).toBe(false);
    expect(standingAllowsEntry("NO_PASS", "COMMERCIAL")).toBe(false);
    expect(standingAllowsEntry("ACTIVE", "COMMUNITY")).toBe(false);
  });

  it("parses a directory row and rejects an unknown standing", () => {
    const row = {
      user_id: "e1000000-0000-4000-8000-000000000001",
      name: "Paid Member",
      username: "paid",
      avatar_url: null,
      membership_status: "ACTIVE",
      source: "PURCHASE",
      joined_at: "2026-11-01T00:00:00Z",
      standing: "ACTIVE",
      pass_valid_until: "2026-12-01T00:00:00Z",
      last_pass_ended_at: null,
      last_visit_at: null,
      broadcasts_muted: false,
    };
    expect(memberDirectoryRowSchema.parse(row).standing).toBe("ACTIVE");
    expect(memberDirectoryRowSchema.safeParse({ ...row, standing: "VIP" }).success).toBe(false);
  });

  it("parses a member-side row", () => {
    const parsed = myMembershipRowSchema.parse({
      facility_id: "fac_a",
      facility_name: "Gym A",
      slug: "gym-a",
      logo_url: null,
      registry_type: "COMMERCIAL",
      standing: "LAPSED",
      pass_valid_until: null,
      broadcasts_muted: true,
      joined_at: null,
    });
    expect(parsed.broadcasts_muted).toBe(true);
  });
});

describe("broadcast audiences by standing", () => {
  it("maps ACTIVE and LAPSED straight through", () => {
    expect(toDbAudience("ACTIVE")).toEqual({ audience: "ACTIVE", segmentKey: null });
    expect(toDbAudience("LAPSED")).toEqual({ audience: "LAPSED", segmentKey: null });
  });

  it("accepts a win-back broadcast to lapsed members", () => {
    const result = crmBroadcastInputSchema.safeParse({
      facilityId: "fac_a",
      suiteMode: "GYMDASH",
      audience: "LAPSED",
      title: "Come back",
      body: "We miss you",
    });
    expect(result.success).toBe(true);
  });
});

describe("venue catalogue", () => {
  it("checkout accepts a catalogue product id as well as the original SKUs", () => {
    const base = { facilityId: "fac_a", idempotencyKey: "12345678" };
    expect(checkoutRequestSchema.safeParse({ ...base, sku: "d1000000-0000-4000-8000-000000000001" }).success).toBe(
      true,
    );
    expect(checkoutRequestSchema.safeParse({ ...base, sku: "DAY_PASS" }).success).toBe(true);
    expect(checkoutRequestSchema.safeParse({ ...base, sku: "weekly" }).success).toBe(false);
  });

  it("validates what a venue types for a product", () => {
    const ok = productInputSchema.safeParse({ name: "Weekly pass", kind: "PASS", pricePhp: "900", durationDays: "7" });
    expect(ok.success && ok.data.pricePhp === 900 && ok.data.durationDays === 7).toBe(true);
    expect(productInputSchema.safeParse({ name: "X", kind: "PASS", pricePhp: 0, durationDays: 0 }).success).toBe(false);
    expect(productInputSchema.safeParse({ name: "Year", kind: "GIFT", pricePhp: 1, durationDays: 1 }).success).toBe(
      false,
    );
  });

  it("describes lengths the same way everywhere", () => {
    expect([1, 7, 30, 365, 10].map(describeProductLength)).toEqual(["1 day", "1 week", "1 month", "1 year", "10 days"]);
  });
});
