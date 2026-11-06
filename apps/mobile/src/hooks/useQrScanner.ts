import { useCallback, useRef, useState } from "react";
import {
  describeDeniedScan,
  describeRedeemResult,
  parseQrScan,
  type QrResolveResult,
} from "sodia-core";
import { APP_HOSTS } from "../lib/appLinks";
import { redeemQr, resolveQr, verifyPassScan } from "../services/qrService";

export type ScanState =
  | { phase: "scanning" }
  | { phase: "working"; label: string }
  | { phase: "preview"; token: string; preview: Extract<QrResolveResult, { status: "ACTIVE" }> }
  | { phase: "result"; tone: "success" | "info" | "error"; title: string; message: string; facilitySlug?: string };

/**
 * Scan pipeline shared by the athlete scanner and staff check-in:
 *  identity code → public preview → user confirms → redeem
 *  membership-card code → verify_pass_code (server rejects non-staff)
 */
export function useQrScanner() {
  const [state, setState] = useState<ScanState>({ phase: "scanning" });
  const busy = useRef(false);

  const reset = useCallback(() => {
    busy.current = false;
    setState({ phase: "scanning" });
  }, []);

  const onScan = useCallback(async (raw: string) => {
    if (busy.current) return;
    busy.current = true;
    const parsed = parseQrScan(raw, APP_HOSTS);

    if (parsed.type === "unknown") {
      setState({ phase: "result", tone: "error", title: "Not a GetPhysical code", message: "This QR code isn't from GetPhysical." });
      return;
    }

    if (parsed.type === "pass") {
      setState({ phase: "working", label: "Checking pass…" });
      const result = await verifyPassScan(parsed.passId, parsed.code);
      if (!result.ok) {
        setState({
          phase: "result",
          tone: "error",
          title: result.reason === "forbidden" ? "Staff only" : "Couldn't check pass",
          message: result.reason === "forbidden" ? "Membership cards are checked in by facility staff." : result.message,
        });
        return;
      }
      setState(
        result.data.granted
          ? { phase: "result", tone: "success", title: "Entry granted", message: result.data.member_name ?? "Member" }
          : { phase: "result", tone: "error", title: "Entry denied", message: describeDeniedScan(result.data.reason) }
      );
      return;
    }

    setState({ phase: "working", label: "Looking up code…" });
    const resolved = await resolveQr(parsed.token);
    if (!resolved.ok) {
      setState({ phase: "result", tone: "error", title: "Couldn't read code", message: resolved.message });
    } else if (resolved.data.status !== "ACTIVE") {
      setState({
        phase: "result",
        tone: "error",
        title: resolved.data.status === "REVOKED" ? "Code replaced" : "Code not found",
        message: resolved.data.status === "REVOKED" ? "Its owner issued a new code. Ask them for the latest one." : "This code doesn't exist.",
      });
    } else {
      setState({ phase: "preview", token: parsed.token, preview: resolved.data });
    }
  }, []);

  const confirm = useCallback(async () => {
    if (state.phase !== "preview") return;
    setState({ phase: "working", label: "Just a moment…" });
    const result = await redeemQr(state.token);
    if (!result.ok) {
      setState({ phase: "result", tone: "error", title: result.reason === "signed_out" ? "Sign in first" : "Couldn't complete", message: result.message });
      return;
    }
    const good = ["ACCEPTED", "PENDING", "JOINED", "REGISTERED", "ALREADY_MEMBER", "ACTIVE"].includes(result.data.status);
    setState({
      phase: "result",
      tone: good ? "success" : result.data.status === "PURCHASE_REQUIRED" ? "info" : "error",
      title: good ? "Done" : "Heads up",
      message: describeRedeemResult(result.data),
      facilitySlug: result.data.slug ?? undefined,
    });
  }, [state]);

  return { state, onScan, confirm, reset };
}
