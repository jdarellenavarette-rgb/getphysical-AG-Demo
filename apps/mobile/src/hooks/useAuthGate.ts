import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../lib/supabase";
import { needsProfileSetup } from "../services/authService";

/**
 * unconfigured  → build has no Supabase env: run the offline product preview
 * loading       → restoring the session from secure storage
 * signed_out    → show sign-in
 * needs_profile → signed in, but name / username / DOB (age gate) missing
 * ready         → full app
 */
export type AuthGateState = "unconfigured" | "loading" | "signed_out" | "needs_profile" | "ready";

export function useAuthGate() {
  const [state, setState] = useState<AuthGateState>(() => (getSupabase() ? "loading" : "unconfigured"));

  const evaluate = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return setState("unconfigured");
    const { data } = await supabase.auth.getSession();
    if (!data.session) return setState("signed_out");
    setState((await needsProfileSetup()) ? "needs_profile" : "ready");
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    void evaluate();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      // Token refresh failures surface as SIGNED_OUT; drafts live in local stores and survive.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void evaluate();
    });
    return () => data.subscription.unsubscribe();
  }, [evaluate]);

  return { state, refresh: evaluate };
}
