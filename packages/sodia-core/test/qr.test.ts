import { describe, expect, it } from "vitest";
import { buildIdentityQrUrl, parseQrScan } from "../src/qr";

const HOSTS = ["getphysical.app"];
const TOKEN = "AbCdEfGhIjKlMnOpQrSt_-";

describe("identity QR codes", () => {
  it("builds and parses the canonical URL", () => {
    const url = buildIdentityQrUrl(TOKEN, "https://getphysical.app/");
    expect(url).toBe(`https://getphysical.app/q/${TOKEN}`);
    expect(parseQrScan(url, HOSTS)).toEqual({ type: "identity", token: TOKEN });
  });
  it("accepts the app scheme", () => {
    expect(parseQrScan(`sodia://q/${TOKEN}`, HOSTS)).toEqual({ type: "identity", token: TOKEN });
  });
  it("rejects look-alike hosts and plain http", () => {
    expect(parseQrScan(`https://getphysical.app.evil.com/q/${TOKEN}`, HOSTS).type).toBe("unknown");
    expect(parseQrScan(`http://getphysical.app/q/${TOKEN}`, HOSTS).type).toBe("unknown");
  });
  it("rejects malformed tokens", () => {
    expect(parseQrScan("https://getphysical.app/q/short", HOSTS).type).toBe("unknown");
    expect(() => buildIdentityQrUrl("bad token", "https://getphysical.app")).toThrow();
  });
  it("routes membership-card codes to the pass verifier", () => {
    expect(parseQrScan("GP2:9a000000-0000-0000-0000-000000000001:123456", HOSTS)).toEqual({
      type: "pass",
      passId: "9a000000-0000-0000-0000-000000000001",
      code: "123456",
    });
  });
});
