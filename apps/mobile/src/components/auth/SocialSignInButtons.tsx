import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { isNativeAppleSignInAvailable, signInWithApple, signInWithGoogle, type SocialResult } from "../../services/socialAuth";
import { authStyles as s } from "./auth.styles";

/**
 * "Continue with Apple / Google". On iOS the Apple button is Apple's own
 * component (required by Apple's design rules). Success is picked up by the
 * AuthGate through Supabase's SIGNED_IN event.
 */
export function SocialSignInButtons({ onError }: { onError: (message: string | null) => void }) {
  const [nativeApple, setNativeApple] = useState(false);
  const [busy, setBusy] = useState<"apple" | "google" | null>(null);

  useEffect(() => {
    void isNativeAppleSignInAvailable().then(setNativeApple);
  }, []);

  const run = async (provider: "apple" | "google", action: () => Promise<SocialResult>) => {
    if (busy) return;
    onError(null);
    setBusy(provider);
    const result = await action();
    setBusy(null);
    if (!result.ok && !result.cancelled) onError(result.message);
  };

  return (
    <View style={{ marginTop: 24, gap: 12 }}>
      {nativeApple ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={14}
          style={{ height: 50, opacity: busy ? 0.6 : 1 }}
          onPress={() => void run("apple", signInWithApple)}
        />
      ) : (
        <TouchableOpacity
          onPress={() => void run("apple", signInWithApple)}
          disabled={busy !== null}
          style={[s.socialButton, s.socialApple]}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
        >
          {busy === "apple" ? <ActivityIndicator color="#000000" /> : <Text style={s.socialAppleText}>Continue with Apple</Text>}
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={() => void run("google", signInWithGoogle)}
        disabled={busy !== null}
        style={[s.socialButton, s.socialGoogle]}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        {busy === "google" ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.socialGoogleText}>Continue with Google</Text>}
      </TouchableOpacity>
      <View style={s.dividerRow}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or use email</Text>
        <View style={s.dividerLine} />
      </View>
    </View>
  );
}
