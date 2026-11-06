import { describe, expect, it } from "vitest";
import { encodeQr, type QrEcc } from "../src/qrEncode";
import reference from "./fixtures/qr-reference.json";

// Matrices produced by the reference `qrcode` (Python) library for fixed version/ECC/mask.
// The encoder was additionally checked against it for all versions 1–10 × L/M/Q/H × masks 0–7.
describe("encodeQr matches the reference implementation", () => {
  it.each(reference)("v$version-$ecc mask $mask: $text", (fixture) => {
    const qr = encodeQr(fixture.text, { version: fixture.version, ecc: fixture.ecc as QrEcc, mask: fixture.mask });
    expect(qr.modules.map((row) => row.map((v) => (v ? "1" : "0")).join(""))).toEqual(fixture.matrix);
  });
});

describe("encodeQr", () => {
  it("picks the smallest version that fits", () => {
    expect(encodeQr("GetPhysical").version).toBe(1);
    expect(encodeQr("https://getphysical.app/q/AbCdEfGhIjKlMnOpQrSt_-").version).toBe(4);
  });
  it("always draws the three finder patterns", () => {
    const { modules, size } = encodeQr("GP2:9a000000-0000-0000-0000-000000000001:123456");
    for (const [r, c] of [[0, 0], [0, size - 7], [size - 7, 0]] as const) {
      expect(modules[r]!.slice(c, c + 7).every(Boolean)).toBe(true);
      expect(modules[r + 2]![c + 1]).toBe(false);
      expect(modules[r + 3]![c + 3]).toBe(true);
    }
  });
  it("rejects payloads beyond version 10", () => {
    expect(() => encodeQr("x".repeat(300), { ecc: "H" })).toThrow(/too long/);
  });
});
