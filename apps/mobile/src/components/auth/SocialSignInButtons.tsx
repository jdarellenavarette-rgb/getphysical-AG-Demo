import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { isNativeAppleSignInAvailable, signInWithApple, signInWithGoogle, type SocialResult } from "../../services/socialAuth";
import { authStyles as s } from "./auth.styles";

interface SocialSignInButtonsProps {
  onError: (message: string | null) => void;
  mode?: "signin" | "signup";
}

/**
 * "Continue with Google / Apple". On iOS the Apple button is Apple's own
 * component (required by Apple's design rules). Success is picked up by the
 * AuthGate through Supabase's SIGNED_IN event.
 */
export function SocialSignInButtons({ onError, mode = "signin" }: SocialSignInButtonsProps) {
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

  const googleLabel = mode === "signup" ? "Sign up with Google" : "Sign in with Google";
  const appleLabel = mode === "signup" ? "Sign up with Apple" : "Sign in with Apple";

  return (
    <View style={{ marginTop: 18, gap: 12 }}>
      {/* GOOGLE SIGN IN / SIGN UP (HERO CTA) */}
      <TouchableOpacity
        onPress={() => void run("google", signInWithGoogle)}
        disabled={busy !== null}
        style={[s.socialButton, s.socialGoogle]}
        accessibilityRole="button"
        accessibilityLabel={googleLabel}
      >
        {busy === "google" ? (
          <ActivityIndicator color="#1F1F1F" />
        ) : (
          <>
            <View style={s.googleGLogo}>
              <Text style={s.googleGText}>G</Text>
            </View>
            <Text style={s.socialGoogleText}>{googleLabel}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* APPLE SIGN IN / SIGN UP */}
      {nativeApple ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            mode === "signup"
              ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
              : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
          }
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
          accessibilityLabel={appleLabel}
        >
          {busy === "apple" ? <ActivityIndicator color="#000000" /> : <Text style={s.socialAppleText}>{appleLabel}</Text>}
        </TouchableOpacity>
      )}

      <View style={s.dividerRow}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or continue with email</Text>
        <View style={s.dividerLine} />
      </View>
    </View>
  );
}
