import { useEffect, useState } from "react";
import { generatePassTotp, type PassTotp } from "sodia-core";
import { loadPassSecret } from "../services/passCredentialService";

export type PassTotpState =
  | { status: "loading" }
  | { status: "ready"; totp: PassTotp; offline: boolean }
  | { status: "signed_out" }
  | { status: "unavailable" };

/**
 * Rolling 60-second gate code for a pass, computed on-device (RFC 6238,
 * HMAC-SHA256) from the pass secret — no server round-trip per refresh.
 */
export function usePassTotp(passId: string | null, enabled = true): PassTotpState {
  const [secret, setSecret] = useState<{ value: string; offline: boolean } | null>(null);
  const [state, setState] = useState<PassTotpState>({ status: "loading" });

  useEffect(() => {
    if (!passId || !enabled) return;
    let cancelled = false;
    setState({ status: "loading" });
    void loadPassSecret(passId).then((result) => {
      if (cancelled) return;
      if (result.status === "ready") setSecret({ value: result.secret, offline: result.source === "cache" });
      else setState({ status: result.status });
    });
    return () => {
      cancelled = true;
    };
  }, [passId, enabled]);

  useEffect(() => {
    if (!passId || !secret || !enabled) return;
    const tick = () => setState({ status: "ready", totp: generatePassTotp(passId, secret.value), offline: secret.offline });
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [passId, secret, enabled]);

  return state;
}
