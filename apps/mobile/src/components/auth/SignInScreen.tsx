import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { emailOtpSchema, emailSchema } from "sodia-core";
import { sendEmailCode, verifyEmailCode } from "../../services/authService";
import { authStyles as s } from "./auth.styles";
import { SocialSignInButtons } from "./SocialSignInButtons";

const emailForm = z.object({ email: emailSchema });
const codeForm = z.object({ code: emailOtpSchema });

interface SignInScreenProps {
  onContinueAsGuest?: () => void;
}

/** Passwordless sign-in / sign-up with Google, Apple, or email code. */
export function SignInScreen({ onContinueAsGuest }: SignInScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const emailStep = useForm<z.infer<typeof emailForm>>({ resolver: zodResolver(emailForm), mode: "onChange", defaultValues: { email: "" } });
  const codeStep = useForm<z.infer<typeof codeForm>>({ resolver: zodResolver(codeForm), mode: "onChange", defaultValues: { code: "" } });

  const submitEmail = emailStep.handleSubmit(async ({ email: value }) => {
    setFormError(null);
    const result = await sendEmailCode(value);
    if (result.ok) setEmail(value);
    else if (result.field === "email") emailStep.setError("email", { message: result.message });
    else setFormError(result.message);
  });

  const submitCode = codeStep.handleSubmit(async ({ code }) => {
    if (!email) return;
    setFormError(null);
    const result = await verifyEmailCode(email, code);
    if (!result.ok) codeStep.setError("code", { message: result.message });
  });

  const busy = emailStep.formState.isSubmitting || codeStep.formState.isSubmitting;

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.brand}>GETPHYSICAL · SODIA</Text>
        <Text style={s.title}>{email ? "Check your email" : mode === "signup" ? "Create your account" : "Welcome back"}</Text>
        <Text style={s.subtitle}>
          {email
            ? `We sent a code to ${email}. It expires in a few minutes.`
            : "Sign in or sign up with Google, Apple, or email to sync your training & passes."}
        </Text>

        {!email && (
          <View style={s.modeContainer}>
            <TouchableOpacity onPress={() => setMode("signin")} style={[s.modeTab, mode === "signin" && s.modeTabActive]}>
              <Text style={[s.modeTabText, mode === "signin" && s.modeTabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode("signup")} style={[s.modeTab, mode === "signup" && s.modeTabActive]}>
              <Text style={[s.modeTabText, mode === "signup" && s.modeTabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}

        {!email && <SocialSignInButtons mode={mode} onError={setFormError} />}

        {!email ? (
          <Controller
            control={emailStep.control}
            name="email"
            render={({ field, fieldState }) => (
              <View style={s.field}>
                <Text style={s.label}>Email Address</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  onSubmitEditing={() => void submitEmail()}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="you@example.com"
                  placeholderTextColor="#52525B"
                  style={[s.input, fieldState.error && s.inputError]}
                  accessibilityLabel="Email address"
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
                <Text style={s.label}>Verification Code</Text>
                <TextInput
                  value={field.value}
                  onChangeText={(v) => field.onChange(v.replace(/\D/g, "").slice(0, 8))}
                  onSubmitEditing={() => void submitCode()}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  maxLength={8}
                  autoFocus
                  style={[s.input, s.codeInput, fieldState.error && s.inputError]}
                  accessibilityLabel="One-time code"
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
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={s.buttonText}>{email ? "Verify Code" : mode === "signup" ? "Sign Up with Email" : "Sign In with Email"}</Text>
          )}
        </TouchableOpacity>

        {email ? (
          <>
            <TouchableOpacity onPress={() => void sendEmailCode(email)} disabled={busy}>
              <Text style={s.link}>Resend code</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEmail(null); codeStep.reset(); }}>
              <Text style={s.link}>Use a different email</Text>
            </TouchableOpacity>
          </>
        ) : onContinueAsGuest ? (
          <TouchableOpacity onPress={onContinueAsGuest} style={s.guestButton} accessibilityRole="button">
            <Text style={s.guestButtonTitle}>Explore as Guest</Text>
            <Text style={s.guestButtonSubtitle}>Preview Darelle Navarette&apos;s athlete demo &amp; all features</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={s.fine}>By continuing you agree to the GetPhysical Terms and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
