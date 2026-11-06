import { parsePassQrPayload } from "./totp";

/**
 * QR codes in GetPhysical come in two families:
 *
 *  1. Identity codes (static, shareable, printable) — "scan to add a friend",
 *     "scan to join this club / enrol with this coach / register for this event".
 *     Payload: https://<app-domain>/q/<token> (also sodia://q/<token>).
 *     Tokens are 128-bit random, unique (primary key), revocable and rotatable
 *     server-side (public.get_qr_code / rotate_qr_code / resolve_qr_code / redeem_qr_code).
 *
 *  2. Membership-card entry codes (dynamic, never printable) — rotate every 60 s
 *     with RFC 6238 TOTP. Payload: GP2:<pass_id>:<6 digits>. See totp.ts.
 */
export type QrKind = "USER" | "COACH" | "ORGANIZER" | "FACILITY" | "EVENT";

const TOKEN = /^[A-Za-z0-9_-]{22}$/;

export function buildIdentityQrUrl(token: string, appBaseUrl: string): string {
  if (!TOKEN.test(token)) throw new Error("buildIdentityQrUrl: invalid token");
  return `${appBaseUrl.replace(/\/+$/, "")}/q/${token}`;
}

export type ParsedQrScan =
  | { type: "identity"; token: string }
  | { type: "pass"; passId: string; code: string }
  | { type: "unknown" };

/**
 * Classifies a scanned string. Identity URLs are accepted only from the
 * allowed app hosts (or the sodia:// scheme) so a look-alike domain in a
 * printed poster cannot be passed off as a GetPhysical code.
 */
export function parseQrScan(raw: string, allowedHosts: readonly string[]): ParsedQrScan {
  const text = raw.trim();
  const pass = parsePassQrPayload(text);
  if (pass) return { type: "pass", ...pass };

  const scheme = /^sodia:\/\/q\/([A-Za-z0-9_-]{22})\/?$/.exec(text);
  if (scheme) return { type: "identity", token: scheme[1]! };

  try {
    const url = new URL(text);
    const match = /^\/q\/([A-Za-z0-9_-]{22})\/?$/.exec(url.pathname);
    if (url.protocol === "https:" && match && allowedHosts.includes(url.hostname.toLowerCase())) {
      return { type: "identity", token: match[1]! };
    }
  } catch {
    // not a URL
  }
  return { type: "unknown" };
}
