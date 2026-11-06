import { describe, expect, it } from "vitest";
import { emailOtpSchema, emailSchema, profileSetupSchema } from "../src/validation";

const yearsAgo = (years: number, extraDays = 0) => {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - years);
  d.setUTCDate(d.getUTCDate() + extraDays);
  return d.toISOString().slice(0, 10);
};
const base = { firstName: "Darelle", lastName: "Navarette", username: "darelle.lifts" };

describe("sign-in validation", () => {
  it("normalises emails", () => {
    expect(emailSchema.parse("  Coach@Example.COM ")).toBe("coach@example.com");
  });
  it("accepts 6–8 digit codes only", () => {
    expect(emailOtpSchema.safeParse("123456").success).toBe(true);
    expect(emailOtpSchema.safeParse("12345678").success).toBe(true);
    expect(emailOtpSchema.safeParse("12345").success).toBe(false);
    expect(emailOtpSchema.safeParse("12ab56").success).toBe(false);
  });
});

describe("profile setup age gate", () => {
  it("allows 13-year-olds", () => {
    expect(profileSetupSchema.safeParse({ ...base, dob: yearsAgo(13, -1) }).success).toBe(true);
  });
  it("hard-blocks under-13s", () => {
    const result = profileSetupSchema.safeParse({ ...base, dob: yearsAgo(13, 2) });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toMatch(/13 or older/);
  });
  it("rejects impossible or future dates and bad usernames", () => {
    expect(profileSetupSchema.safeParse({ ...base, dob: "2099-01-01" }).success).toBe(false);
    expect(profileSetupSchema.safeParse({ ...base, dob: "1990-13-45" }).success).toBe(false);
    expect(profileSetupSchema.safeParse({ ...base, username: "no spaces!", dob: "1990-01-01" }).success).toBe(false);
  });
});
