"use server";

import { describeDeniedScan, parseQrScan, passVerifyResultSchema } from "sodia-core";
import { formatDate } from "../../lib/format";
import { createServerSupabase } from "../../lib/supabase/server";

export interface ScanResultState {
  status: "idle" | "granted" | "denied" | "not_a_pass" | "session_expired" | "permission_denied" | "error";
  memberName?: string;
  message?: string;
  /** Changes on every submission so the screen can re-announce identical results. */
  at?: number;
}

/**
 * Verify a scanned membership card. The same database check the mobile staff
 * scanner uses: it validates the 60-second code, blocks replays and records the scan.
 */
export async function verifyScan(_prev: ScanResultState, formData: FormData): Promise<ScanResultState> {
  const raw = String(formData.get("code") ?? "");
  const at = Date.now();
  const parsed = parseQrScan(raw, []);
  if (parsed.type !== "pass") {
    return {
      status: "not_a_pass",
      at,
      message:
        parsed.type === "identity"
          ? "That is a profile code, not a membership card. Ask the member to open their card in the Sodia app."
          : "That isn't a GetPhysical membership card. Scan the code on the member's card in the Sodia app.",
    };
  }

  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { status: "session_expired", at, message: "Your session expired. Sign in again to scan." };

  const { data, error } = await supabase.rpc("verify_pass_code", { p_pass_id: parsed.passId, p_code: parsed.code });
  if (error) {
    if (error.code === "42501") {
      return { status: "permission_denied", at, message: "This card belongs to a different venue." };
    }
    return { status: "error", at, message: "We couldn't check that card. Please scan again." };
  }
  const result = passVerifyResultSchema.safeParse(data);
  if (!result.success) return { status: "error", at, message: "We couldn't check that card. Please scan again." };

  if (!result.data.granted) {
    return {
      status: "denied",
      at,
      memberName: result.data.member_name,
      message: describeDeniedScan(result.data.reason),
    };
  }
  return {
    status: "granted",
    at,
    memberName: result.data.member_name,
    message: result.data.valid_until ? `Pass valid until ${formatDate(result.data.valid_until)}.` : undefined,
  };
}
