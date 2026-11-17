import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { signInWithGoogle } from "../../services/socialAuth";
import { authStyles as s } from "./auth.styles";

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
          <View style={s.googleGLogo}>
            <Text style={s.googleGText}>G</Text>
          </View>
          <Text style={s.socialGoogleText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
