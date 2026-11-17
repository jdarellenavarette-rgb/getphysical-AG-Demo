import React, { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthGate } from "../../hooks/useAuthGate";
import { getSupabase } from "../../lib/supabase";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { OpeningLoadingScreen } from "../common/OpeningLoadingScreen";
import { ProfileSetupScreen } from "./ProfileSetupScreen";
import { SignInScreen } from "./SignInScreen";

/**
 * Entry Gate:
 * 1. Shows Opening / Splash screen first on app launch.
 * 2. Seamlessly transitions to Google Sign-In / Sign-Up if signed out.
 * 3. Supports guest demo preview or authenticated profile.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [splashFinished, setSplashFinished] = useState(false);
  const { state, refresh } = useAuthGate();
  const { isGuest, setIsGuest, setProfile } = useEcosystemStore();

  // Load the real profile once signed in (the preview profile stays for guest/preview).
  useEffect(() => {
    const supabase = getSupabase();
    if (state !== "ready" || !supabase) return;
    void supabase.rpc("get_my_profile").then(({ data }) => {
      if (data) setProfile(data);
    });
  }, [state, setProfile]);

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

  // 4. Signed out or offline: prompt Google sign-in / sign-up or guest demo
  if ((state === "signed_out" || state === "unconfigured") && !isGuest) {
    return <SignInScreen onContinueAsGuest={() => setIsGuest(true)} />;
  }

  return <>{children}</>;
}
