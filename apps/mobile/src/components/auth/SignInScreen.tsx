import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { emailOtpSchema, emailSchema } from "sodia-core";
import { sendEmailCode, verifyEmailCode } from "../../services/authService";
import { authStyles as s } from "./auth.styles";
import { GoogleSignInButton } from "./SocialSignInButtons";

const emailForm = z.object({ email: emailSchema });
const codeForm = z.object({ code: emailOtpSchema });

/** Longest code the server may send (set per project, 6 to 8 digits). */
const MAX_CODE_LENGTH = 8;

/** Seconds before another code can be requested. */
const RESEND_SECONDS = 60;

interface SignInScreenProps {
  onContinueAsGuest?: () => void;
}

/** Sign in or create an account with an emailed code, or Google. Guests can look around first. */
export function SignInScreen({ onContinueAsGuest }: SignInScreenProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const emailStep = useForm<z.infer<typeof emailForm>>({
    resolver: zodResolver(emailForm),
    mode: "onChange",
    defaultValues: { email: "" },
  });
  const codeStep = useForm<z.infer<typeof codeForm>>({
    resolver: zodResolver(codeForm),
    mode: "onSubmit",
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const requestCode = async (value: string): Promise<boolean> => {
    setFormError(null);
    let result: Awaited<ReturnType<typeof sendEmailCode>>;
    try {
      result = await sendEmailCode(value);
    } catch {
      // No backend in this build, or the request never left the phone.
      result = { ok: false, message: "We couldn't reach the server. Check your connection and try again." };
    }
    if (result.ok) {
      setResendIn(RESEND_SECONDS);
      return true;
    }
    if (result.field === "email") emailStep.setError("email", { message: result.message });
    else setFormError(result.message);
    return false;
  };

  const submitEmail = emailStep.handleSubmit(async ({ email: value }) => {
    if (await requestCode(value)) setEmail(value);
  });

  const submitCode = codeStep.handleSubmit(async ({ code }) => {
    if (!email) return;
    setFormError(null);
    const result = await verifyEmailCode(email, code);
    // On success the AuthGate picks up the session and replaces this screen.
    if (!result.ok) codeStep.setError("code", { message: result.message });
  });

  const busy = emailStep.formState.isSubmitting || codeStep.formState.isSubmitting;

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Image
          source={require("../../../assets/brand/gp_wordmark.png")}
          style={s.logo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="GetPhysical"
        />
        <Text style={[s.title, s.centered]}>{email ? "Check your email" : "Sign in or sign up"}</Text>
        <Text style={[s.subtitle, s.centered]}>
          {email
            ? `We sent a code to ${email}. It expires in a few minutes.`
            : "Use your email or Google. New here? We'll create your account."}
        </Text>

        {!email ? (
          <Controller
            control={emailStep.control}
            name="email"
            render={({ field, fieldState }) => (
              <View style={s.field}>
                <Text style={s.label}>Email</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  onSubmitEditing={() => void submitEmail()}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="send"
                  placeholder="you@example.com"
                  placeholderTextColor="#52525B"
                  style={[s.input, fieldState.error && s.inputError]}
                  accessibilityLabel="Email"
                />
                {fieldState.error && <Text style={s.error}>{fieldState.error.message}</Text>}
              </View>
            )}
          />
        ) : (
          <Controller
            control={codeStep.control}
            name="code"
            render={({ field, fieldState }) => (
              <View style={s.field}>
                <Text style={s.label}>Verification code</Text>
                <TextInput
                  value={field.value}
                  onChangeText={(v) => field.onChange(v.replace(/\D/g, "").slice(0, MAX_CODE_LENGTH))}
                  onSubmitEditing={() => void submitCode()}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  maxLength={MAX_CODE_LENGTH}
                  autoFocus
                  style={[s.input, s.codeInput, fieldState.error && s.inputError]}
                  accessibilityLabel="Verification code"
                />
                {fieldState.error && <Text style={s.error}>{fieldState.error.message}</Text>}
              </View>
            )}
          />
        )}

        {formError && <Text style={s.formError}>{formError}</Text>}

        <TouchableOpacity
          onPress={() => void (email ? submitCode() : submitEmail())}
          disabled={busy}
          style={[s.button, busy && s.buttonDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy, busy }}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={s.buttonText}>{email ? "Verify" : "Email me a code"}</Text>
          )}
        </TouchableOpacity>

        {email ? (
          <>
            <TouchableOpacity
              onPress={() => void requestCode(email)}
              disabled={busy || resendIn > 0}
              accessibilityRole="button"
              accessibilityState={{ disabled: busy || resendIn > 0 }}
            >
              <Text style={[s.link, resendIn > 0 && s.linkDisabled]}>
                {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEmail(null);
                setFormError(null);
                codeStep.reset();
              }}
              accessibilityRole="button"
            >
              <Text style={s.link}>Use a different email</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>
            <GoogleSignInButton onError={setFormError} />
            {onContinueAsGuest ? (
              <TouchableOpacity onPress={onContinueAsGuest} style={s.guestButton} accessibilityRole="button">
                <Text style={s.guestButtonTitle}>Continue as guest</Text>
                <Text style={s.guestButtonSubtitle}>Look around first. Sign in any time to save your activity.</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}

        <Text style={s.fine}>By continuing you agree to the GetPhysical Terms and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
