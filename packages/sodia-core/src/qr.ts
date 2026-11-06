import { z } from "zod";
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

// -----------------------------------------------------------------------------
// RPC response schemas (resolve_qr_code / redeem_qr_code / verify_pass_code)
// -----------------------------------------------------------------------------

export const qrSubjectSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  title: z.string().optional(),
  username: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  registry_type: z.enum(["COMMERCIAL", "COMMUNITY"]).optional(),
  address: z.string().nullable().optional(),
  is_private: z.boolean().optional(),
  starts_at: z.string().optional(),
  facility_name: z.string().nullable().optional(),
  spots_left: z.number().nullable().optional(),
});

export const qrResolveResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ACTIVE"),
    kind: z.enum(["USER", "COACH", "ORGANIZER", "FACILITY", "EVENT"]),
    subject: qrSubjectSchema,
  }),
  z.object({ status: z.literal("REVOKED") }),
  z.object({ status: z.literal("NOT_FOUND") }),
]);
export type QrResolveResult = z.infer<typeof qrResolveResultSchema>;

export const qrRedeemResultSchema = z.object({
  action: z.enum(["FOLLOW", "ENROLL_COACH", "JOIN_FACILITY", "REGISTER_EVENT", "NONE"]),
  status: z.string(),
  facility_id: z.string().optional(),
  slug: z.string().nullable().optional(),
});
export type QrRedeemResult = z.infer<typeof qrRedeemResultSchema>;

export const passVerifyResultSchema = z.object({
  granted: z.boolean(),
  reason: z.string().nullable(),
  member_name: z.string().optional(),
  valid_until: z.string().optional(),
});
export type PassVerifyResult = z.infer<typeof passVerifyResultSchema>;

/** Human copy for redeem outcomes. */
export function describeRedeemResult(result: QrRedeemResult): string {
  switch (`${result.action}:${result.status}`) {
    case "FOLLOW:ACCEPTED": return "You're now following them.";
    case "FOLLOW:PENDING": return "Follow request sent — they'll need to approve it.";
    case "ENROLL_COACH:PENDING": return "Enrolment request sent to the coach.";
    case "ENROLL_COACH:ACTIVE": return "You're already enrolled with this coach.";
    case "JOIN_FACILITY:JOINED": return "Welcome! You've joined the club.";
    case "JOIN_FACILITY:ALREADY_MEMBER": return "You're already a member here.";
    case "JOIN_FACILITY:PURCHASE_REQUIRED": return "This gym requires a pass — choose one to get in.";
    case "JOIN_FACILITY:CAPACITY_REACHED": return "This club is full right now.";
    case "REGISTER_EVENT:REGISTERED": return "You're registered for the event.";
    case "REGISTER_EVENT:EVENT_FULL": return "This event is full.";
    case "REGISTER_EVENT:EVENT_CLOSED": return "Registration for this event is closed.";
    case "NONE:SELF": return "That's your own code.";
    case "NONE:REVOKED": return "This code was replaced by its owner. Ask for the new one.";
    default: return "This code isn't valid.";
  }
}

export function describeDeniedScan(reason: string | null): string {
  switch (reason) {
    case "INVALID_CODE": return "Code doesn't match. Ask the member to refresh their card.";
    case "CODE_ALREADY_USED": return "This code was already used. Wait for the next code.";
    case "PASS_EXPIRED": return "Pass has expired.";
    case "PASS_REVOKED": return "Pass was revoked.";
    case "RATE_LIMITED": return "Too many failed attempts. Try again in 5 minutes.";
    case "PASS_NOT_FOUND": return "Pass not found.";
    default: return "Entry denied.";
  }
}
