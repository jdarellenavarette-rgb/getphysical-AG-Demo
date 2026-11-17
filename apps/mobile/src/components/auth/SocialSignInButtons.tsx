import React, { useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity } from "react-native";
import { signInWithGoogle } from "../../services/socialAuth";
import { authStyles as s } from "./auth.styles";

// Google's "G" mark, as required by its sign-in branding guidelines.
const GOOGLE_MARK = require("../../../assets/brand/google_g.png");

interface GoogleSignInButtonProps {
  onError: (message: string | null) => void;
}

/** "Continue with Google". Success is picked up by the AuthGate through Supabase's SIGNED_IN event. */
export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    if (busy) return;
    onError(null);
    setBusy(true);
    const result = await signInWithGoogle();
    setBusy(false);
    if (!result.ok && !result.cancelled) onError(result.message);
  };

  return (
    <TouchableOpacity
      onPress={() => void signIn()}
      disabled={busy}
      style={[s.socialButton, s.socialGoogle, { marginTop: 16 }]}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      accessibilityState={{ disabled: busy, busy }}
    >
      {busy ? (
        <ActivityIndicator color="#1F1F1F" />
      ) : (
        <>
          <Image source={GOOGLE_MARK} style={s.googleMark} accessibilityIgnoresInvertColors />
          <Text style={s.socialGoogleText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
