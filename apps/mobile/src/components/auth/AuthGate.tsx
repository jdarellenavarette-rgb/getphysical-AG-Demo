import React, { useEffect, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthGate } from "../../hooks/useAuthGate";
import { getSupabase } from "../../lib/supabase";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { ProfileSetupScreen } from "./ProfileSetupScreen";
import { SignInScreen } from "./SignInScreen";

/**
 * Wraps the app: sign-in → profile setup (age gate) → app.
 * Builds without Supabase config run the offline product preview.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { state, refresh } = useAuthGate();
  const setProfile = useEcosystemStore((store) => store.setProfile);

  // Load the real profile once signed in (the preview profile stays for unconfigured builds).
  useEffect(() => {
    const supabase = getSupabase();
    if (state !== "ready" || !supabase) return;
    void supabase.rpc("get_my_profile").then(({ data }) => {
      if (data) setProfile(data);
    });
  }, [state, setProfile]);

  if (state === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: "#09090B", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#E11D48" />
      </View>
    );
  }
  if (state === "signed_out") return <SignInScreen />;
  if (state === "needs_profile") return <ProfileSetupScreen onDone={() => void refresh()} />;
  return <>{children}</>;
}
