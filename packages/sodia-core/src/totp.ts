/**
 * Pass TOTP — RFC 6238 with HMAC-SHA256, 60-second step, 6 digits.
 *
 * The secret is a random 32-byte value provisioned per pass by the database
 * (public.pass_credentials) and readable only by the pass owner, so the phone
 * can render codes fully offline. Verification happens server-side in
 * public.verify_pass_code(), which implements the identical algorithm,
 * accepts ±1 step of clock drift, rejects replays and throttles guessing.
 */
import { hexToBytes, hmacSha256 } from "./crypto";

export const PASS_TOTP_STEP_SECONDS = 60;
export const PASS_TOTP_DIGITS = 6;
const QR_PREFIX = "GP2";

export interface PassTotp {
  readonly code: string; // "482911"
  readonly formattedCode: string; // "482-911"
  readonly qrPayload: string; // "GP2:<pass_id>:482911"
  readonly remainingSeconds: number; // 1..60
  readonly counter: number;
}

function counterBytes(counter: number): Uint8Array {
  const bytes = new Uint8Array(8);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter >>> 0, false);
  return bytes;
}

/** RFC 4226 HOTP over HMAC-SHA256. */
export function hotpSha256(secret: Uint8Array, counter: number, digits = PASS_TOTP_DIGITS): string {
  const mac = hmacSha256(secret, counterBytes(counter));
  const offset = mac[mac.length - 1]! & 0x0f;
  const binary =
    ((mac[offset]! & 0x7f) << 24) |
    (mac[offset + 1]! << 16) |
    (mac[offset + 2]! << 8) |
    mac[offset + 3]!;
  return (binary % 10 ** digits).toString().padStart(digits, "0");
}

export function buildPassQrPayload(passId: string, code: string): string {
  return `${QR_PREFIX}:${passId}:${code}`;
}

export function parsePassQrPayload(payload: string): { passId: string; code: string } | null {
  const match = /^GP2:([0-9a-f-]{36}):(\d{6})$/i.exec(payload.trim());
  if (!match) return null;
  return { passId: match[1]!.toLowerCase(), code: match[2]! };
}

/**
 * Generate the current code for a pass.
 * @param secret pass_credentials.secret as returned by PostgREST ("\\x…" hex) or raw bytes
 */
export function generatePassTotp(
  passId: string,
  secret: string | Uint8Array,
  nowMs: number = Date.now()
): PassTotp {
  const key = typeof secret === "string" ? hexToBytes(secret) : secret;
  const seconds = Math.floor(nowMs / 1000);
  const counter = Math.floor(seconds / PASS_TOTP_STEP_SECONDS);
  const code = hotpSha256(key, counter);
  return {
    code,
    formattedCode: `${code.slice(0, 3)}-${code.slice(3)}`,
    qrPayload: buildPassQrPayload(passId, code),
    remainingSeconds: PASS_TOTP_STEP_SECONDS - (seconds % PASS_TOTP_STEP_SECONDS),
    counter,
  };
}
