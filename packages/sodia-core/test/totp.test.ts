import { describe, expect, it } from "vitest";
import { utf8ToBytes } from "../src/crypto";
import { generatePassTotp, hotpSha256, parsePassQrPayload } from "../src/totp";

// RFC 6238 Appendix B (SHA-256 seed), 8-digit codes truncated to 6 digits.
const RFC_SEED = utf8ToBytes("12345678901234567890123456789012");
const VECTORS: Array<[number, string]> = [
  [59, "119246"],
  [1111111109, "084774"],
  [1111111111, "062674"],
  [1234567890, "819424"],
  [2000000000, "698825"],
  [20000000000, "737706"],
];

describe("hotpSha256", () => {
  it.each(VECTORS)("matches RFC 6238 at T=%i", (t, expected) => {
    expect(hotpSha256(RFC_SEED, Math.floor(t / 30))).toBe(expected);
  });
});

describe("generatePassTotp", () => {
  const passId = "9a000000-0000-0000-0000-000000000001";
  const secretHex = "\\x" + "ab".repeat(32);

  it("uses 60-second windows and reports time remaining", () => {
    const t = Date.UTC(2026, 10, 6, 12, 0, 15);
    const a = generatePassTotp(passId, secretHex, t);
    const b = generatePassTotp(passId, secretHex, t + 44_000);
    const c = generatePassTotp(passId, secretHex, t + 45_000);
    expect(a.code).toMatch(/^\d{6}$/);
    expect(a.remainingSeconds).toBe(45);
    expect(b.code).toBe(a.code);
    expect(c.counter).toBe(a.counter + 1);
    expect(a.formattedCode).toBe(`${a.code.slice(0, 3)}-${a.code.slice(3)}`);
  });

  it("round-trips the QR payload", () => {
    const totp = generatePassTotp(passId, secretHex, 0);
    expect(parsePassQrPayload(totp.qrPayload)).toEqual({ passId, code: totp.code });
  });

  it("rejects foreign or legacy QR payloads", () => {
    expect(parsePassQrPayload("GP:fac_metro_core:pass:usr:123:abcd")).toBeNull();
    expect(parsePassQrPayload(`GP2:${passId}:12345`)).toBeNull();
  });
});
