import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { getSupabase } from "../lib/supabase";
import { useMemberStore } from "../store/memberStore";

const POLL_MS = 4000;
/** About three minutes: long enough for a payment provider's confirmation to arrive. */
const MAX_POLLS = 45;

/**
 * Keeps a signed-in member's wallet and venues in step with the backend:
 * loads them when the app opens, reloads when the app returns to the
 * foreground (for example from the payment page), and after a checkout keeps
 * checking until the paid pass has been issued.
 */
export function useMemberSync(signedIn: boolean) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopWaiting = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    useMemberStore.getState().setAwaitingPass(false);
  }, []);

  /** Call once a checkout page has been opened. The pass is issued only when the payment is confirmed. */
  const expectNewPass = useCallback(() => {
    stopWaiting();
    useMemberStore.getState().setAwaitingPass(true);
    let polls = 0;
    timer.current = setInterval(() => {
      polls += 1;
      void useMemberStore
        .getState()
        .refreshWallet({ quiet: true })
        .then((arrived) => {
          if (!arrived && polls < MAX_POLLS) return;
          stopWaiting();
          if (arrived) void useMemberStore.getState().refreshMemberships();
        });
    }, POLL_MS);
  }, [stopWaiting]);

  // Venues are public, so they load for guests too whenever the build has a backend.
  useEffect(() => {
    if (getSupabase()) void useMemberStore.getState().refreshVenues();
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    const { refreshWallet, refreshMemberships } = useMemberStore.getState();
    void refreshWallet();
    void refreshMemberships();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      void useMemberStore
        .getState()
        .refreshWallet({ quiet: true })
        .then((arrived) => {
          if (arrived) stopWaiting();
        });
      void useMemberStore.getState().refreshMemberships();
    });
    return () => {
      subscription.remove();
      stopWaiting();
    };
  }, [signedIn, stopWaiting]);

  return { expectNewPass };
}
