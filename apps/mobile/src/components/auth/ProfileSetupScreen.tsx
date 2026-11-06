import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSetupSchema, type ProfileSetupInput } from "sodia-core";
import { completeProfile, getProfileDraft, isUsernameAvailable, signOut } from "../../services/authService";
import { authStyles as s } from "./auth.styles";

function suggestions(base: string): string[] {
  const clean = base.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 18) || "athlete";
  const n = () => Math.floor(10 + Math.random() * 990);
  return [`${clean}${n()}`, `${clean}.fit`, `${clean}_${n()}`];
}

/** One-time profile setup: name, unique username, date of birth (13+ age gate). */
export function ProfileSetupScreen({ onDone }: { onDone: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const form = useForm<ProfileSetupInput>({
    resolver: zodResolver(profileSetupSchema),
    mode: "onChange",
    defaultValues: { firstName: "", lastName: "", username: "", dob: "" },
  });

  // Prefill names that Google / Apple already gave us.
  useEffect(() => {
    void getProfileDraft().then((draft) => {
      if (draft.firstName) form.setValue("firstName", draft.firstName, { shouldValidate: true });
      if (draft.lastName) form.setValue("lastName", draft.lastName, { shouldValidate: true });
    });
  }, [form]);

  const checkUsername = async (username: string) => {
    if (!username || form.getFieldState("username").invalid) return;
    if (!(await isUsernameAvailable(username))) {
      form.setError("username", { message: "That username is taken." });
      setAlternatives(suggestions(username));
    } else {
      setAlternatives([]);
    }
  };

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    const result = await completeProfile(values);
    if (result.ok) return onDone();
    if (result.field === "username") {
      form.setError("username", { message: result.message });
      setAlternatives(suggestions(values.username));
    } else setFormError(result.message);
  });

  const field = (name: FieldPath<ProfileSetupInput>, label: string, props: Partial<React.ComponentProps<typeof TextInput>> = {}) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field: f, fieldState }) => (
        <View style={s.field}>
          <Text style={s.label}>{label}</Text>
          <TextInput
            value={f.value}
            onChangeText={f.onChange}
            onBlur={() => { f.onBlur(); if (name === "username") void checkUsername(f.value); }}
            placeholderTextColor="#52525B"
            style={[s.input, fieldState.error && s.inputError]}
            accessibilityLabel={label}
            {...props}
          />
          {fieldState.error && <Text style={s.error}>{fieldState.error.message}</Text>}
        </View>
      )}
    />
  );

  const busy = form.formState.isSubmitting;
  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.brand}>ALMOST THERE</Text>
        <Text style={s.title}>Set up your profile</Text>
        <Text style={s.subtitle}>Your date of birth is private and can't be changed later. You must be 13 or older.</Text>
        <View style={s.row}>
          <View style={s.half}>{field("firstName", "First name", { autoComplete: "given-name" })}</View>
          <View style={s.half}>{field("lastName", "Last name", { autoComplete: "family-name" })}</View>
        </View>
        {field("username", "Username", { autoCapitalize: "none", autoCorrect: false, placeholder: "e.g. darelle.lifts" })}
        {alternatives.length > 0 && (
          <View style={s.chips}>
            {alternatives.map((alt) => (
              <TouchableOpacity key={alt} style={s.chip} onPress={() => { form.setValue("username", alt, { shouldValidate: true }); setAlternatives([]); }}>
                <Text style={s.chipText}>@{alt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {field("dob", "Date of birth", { placeholder: "YYYY-MM-DD", keyboardType: "numbers-and-punctuation", maxLength: 10 })}
        {formError && <Text style={s.formError}>{formError}</Text>}
        <TouchableOpacity onPress={() => void submit()} disabled={busy} style={[s.button, busy && s.buttonDisabled]} accessibilityRole="button">
          {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.buttonText}>Continue</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => void signOut()}><Text style={s.link}>Sign out</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
