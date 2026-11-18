import {
  passVerifyResultSchema,
  qrRedeemResultSchema,
  qrResolveResultSchema,
  type PassVerifyResult,
  type QrKind,
  type QrRedeemResult,
  type QrResolveResult,
} from "sodia-core";
import { getSessionUserId, getSupabase } from "../lib/supabase";
import { failure, type ServiceResult } from "./serviceResult";

export type { ServiceResult } from "./serviceResult";

const SIGNED_OUT = { ok: false, reason: "signed_out", message: "Sign in to use QR codes." } as const;

/** The signed-in user's own code (USER = add-friend; COACH / ORGANIZER need the role). */
export async function getMyQrToken(
  kind: Extract<QrKind, "USER" | "COACH" | "ORGANIZER">,
  rotate = false,
): Promise<ServiceResult<string>> {
  const supabase = getSupabase();
  if (!supabase || !(await getSessionUserId())) return SIGNED_OUT;
  const { data, error } = await supabase.rpc(rotate ? "rotate_qr_code" : "get_qr_code", { p_kind: kind });
  if (error) return failure(error);
  const token = (data as { token?: unknown } | null)?.token;
  return typeof token === "string"
    ? { ok: true, data: token }
    : { ok: false, reason: "error", message: "No code returned." };
}

/** Public preview of a scanned identity code (works signed-out). */
export async function resolveQr(token: string): Promise<ServiceResult<QrResolveResult>> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "error", message: "Scanning is unavailable in this build." };
  const { data, error } = await supabase.rpc("resolve_qr_code", { p_token: token });
  if (error) return failure(error);
  const parsed = qrResolveResultSchema.safeParse(data);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, reason: "error", message: "Unrecognised code." };
}

/** Perform the code's action (follow / enrol / join / register). */
export async function redeemQr(token: string): Promise<ServiceResult<QrRedeemResult>> {
  const supabase = getSupabase();
  if (!supabase || !(await getSessionUserId())) return SIGNED_OUT;
  const { data, error } = await supabase.rpc("redeem_qr_code", { p_token: token });
  if (error) return failure(error);
  const parsed = qrRedeemResultSchema.safeParse(data);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, reason: "error", message: "Unexpected response." };
}

/** Staff check-in of a member's dynamic card code. Authorised server-side. */
export async function verifyPassScan(passId: string, code: string): Promise<ServiceResult<PassVerifyResult>> {
  const supabase = getSupabase();
  if (!supabase || !(await getSessionUserId())) return SIGNED_OUT;
  const { data, error } = await supabase.rpc("verify_pass_code", { p_pass_id: passId, p_code: code });
  if (error) return failure(error);
  const parsed = passVerifyResultSchema.safeParse(data);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, reason: "error", message: "Unexpected response." };
}
