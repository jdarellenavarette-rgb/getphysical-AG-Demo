import React, { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthGate } from "../../hooks/useAuthGate";
import { getSupabase } from "../../lib/supabase";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useFeedStore } from "../../store/feedStore";
import { useTrackingStore } from "../../store/trackingStore";
import { OpeningLoadingScreen } from "../common/OpeningLoadingScreen";
import { ProfileSetupScreen } from "./ProfileSetupScreen";
import { SignInScreen } from "./SignInScreen";

/**
 * Entry Gate:
 * 1. Shows Opening / Splash screen first on app launch.
 * 2. Shows sign-in (mobile number, Google) or guest mode when signed out.
 * 3. Guests see the same empty app as a new account, with no sample data.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [splashFinished, setSplashFinished] = useState(false);
  const { state, refresh } = useAuthGate();
  const { isGuest, setIsGuest, setProfile, resetSession } = useEcosystemStore();
  const resetFeed = useFeedStore((state) => state.resetFeed);
  const resetTracking = useTrackingStore((state) => state.resetTracking);

  // Signed in: load the real profile and leave guest mode.
  useEffect(() => {
    const supabase = getSupabase();
    if (state !== "ready" || !supabase) return;
    setIsGuest(false);
    void supabase.rpc("get_my_profile").then(({ data }) => {
      if (data) setProfile(data);
    });
  }, [state, setProfile, setIsGuest]);

  // Signed out: nothing from the previous account may stay on screen.
  useEffect(() => {
    if (state !== "signed_out") return;
    resetSession();
    resetFeed();
    resetTracking();
  }, [state, resetSession, resetFeed, resetTracking]);

  // 1. Landing / Splash screen always runs first on app mount
  if (!splashFinished) {
    return <OpeningLoadingScreen onFinish={() => setSplashFinished(true)} />;
  }

  // 2. Loading existing session from SecureStore
  if (state === "loading" && !isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: "#09090B", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#E11D48" />
      </View>
    );
  }

  // 3. Authenticated user needs profile setup (first-time OAuth / email sign-in)
  if (state === "needs_profile" && !isGuest) {
    return <ProfileSetupScreen onDone={() => void refresh()} />;
  }

  // 4. Signed out, or a build without a backend: sign in or continue as guest
  if ((state === "signed_out" || state === "unconfigured") && !isGuest) {
    return <SignInScreen onContinueAsGuest={() => setIsGuest(true)} />;
  }

  return <>{children}</>;
}
