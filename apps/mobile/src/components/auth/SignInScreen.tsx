import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { otpSchema, phoneSchema, SODIA_FIELD_LIMITS } from "sodia-core";
import { sendPhoneCode, toE164, verifyPhoneCode } from "../../services/authService";
import { authStyles as s } from "./auth.styles";
import { GoogleSignInButton } from "./SocialSignInButtons";

// People type numbers with spaces or dashes ("917 123 4567"); validate the digits only.
const phoneForm = z.object({
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(phoneSchema),
});
const codeForm = z.object({ code: otpSchema });

/** Seconds before another code can be requested. */
const RESEND_SECONDS = 60;

interface SignInScreenProps {
  onContinueAsGuest?: () => void;
}

/** Sign in or create an account with a mobile number + code, or Google. Guests can look around first. */
export function SignInScreen({ onContinueAsGuest }: SignInScreenProps) {
  const [phone, setPhone] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const phoneStep = useForm<z.input<typeof phoneForm>, unknown, z.output<typeof phoneForm>>({
    resolver: zodResolver(phoneForm),
    mode: "onChange",
    defaultValues: { phone: "" },
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
    let result: Awaited<ReturnType<typeof sendPhoneCode>>;
    try {
      result = await sendPhoneCode(value);
    } catch {
      // No backend in this build, or the request never left the phone.
      result = { ok: false, message: "We couldn't reach the server. Check your connection and try again." };
    }
    if (result.ok) {
      setResendIn(RESEND_SECONDS);
      return true;
    }
    if (result.field === "phone") phoneStep.setError("phone", { message: result.message });
    else setFormError(result.message);
    return false;
  };

  const submitPhone = phoneStep.handleSubmit(async ({ phone: value }) => {
    if (await requestCode(value)) setPhone(value);
  });

  const submitCode = codeStep.handleSubmit(async ({ code }) => {
    if (!phone) return;
    setFormError(null);
    const result = await verifyPhoneCode(phone, code);
    // On success the AuthGate picks up the session and replaces this screen.
    if (!result.ok) codeStep.setError("code", { message: result.message });
  });

  const busy = phoneStep.formState.isSubmitting || codeStep.formState.isSubmitting;

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.brand}>GETPHYSICAL</Text>
        <Text style={s.title}>{phone ? "Enter your code" : "Sign in or sign up"}</Text>
        <Text style={s.subtitle}>
          {phone
            ? `We texted a ${SODIA_FIELD_LIMITS.OTP_CODE_LENGTH}-digit code to ${toE164(phone)}.`
            : "Use your mobile number or Google. New here? We'll create your account."}
        </Text>

        {!phone ? (
          <Controller
            control={phoneStep.control}
            name="phone"
            render={({ field, fieldState }) => (
              <View style={s.field}>
                <Text style={s.label}>Mobile number</Text>
                <View style={s.phoneRow}>
                  <View style={s.phonePrefix}>
                    <Text style={s.phonePrefixText}>+63</Text>
                  </View>
                  <TextInput
                    value={field.value}
                    onChangeText={(v) => field.onChange(v.replace(/[^\d+ -]/g, ""))}
                    onBlur={field.onBlur}
                    onSubmitEditing={() => void submitPhone()}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    placeholder="917 123 4567"
                    placeholderTextColor="#52525B"
                    maxLength={16}
                    style={[s.input, s.phoneInput, fieldState.error && s.inputError]}
                    accessibilityLabel="Mobile number"
                  />
                </View>
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
                  onChangeText={(v) =>
                    field.onChange(v.replace(/\D/g, "").slice(0, SODIA_FIELD_LIMITS.OTP_CODE_LENGTH))
                  }
                  onSubmitEditing={() => void submitCode()}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  maxLength={SODIA_FIELD_LIMITS.OTP_CODE_LENGTH}
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
          onPress={() => void (phone ? submitCode() : submitPhone())}
          disabled={busy}
          style={[s.button, busy && s.buttonDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy, busy }}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={s.buttonText}>{phone ? "Verify" : "Text me a code"}</Text>
          )}
        </TouchableOpacity>

        {phone ? (
          <>
            <TouchableOpacity
              onPress={() => void requestCode(phone)}
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
                setPhone(null);
                setFormError(null);
                codeStep.reset();
              }}
              accessibilityRole="button"
            >
              <Text style={s.link}>Use a different number</Text>
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
