"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { siteUrl } from "../../lib/env";
import { createServerSupabase } from "../../lib/supabase/server";

export interface AuthFormState {
  status: "idle" | "form_validation" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
}

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  next: z.string().startsWith("/").catch("/"),
});

const magicLinkSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

function safeNext(value: string): string {
  // Only same-origin relative paths; blocks open redirects like "//evil.com".
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function signInWithPassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? "/",
  });
  if (!parsed.success) {
    const fieldErrors: AuthFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "email" || key === "password") fieldErrors[key] = issue.message;
    }
    return { status: "form_validation", fieldErrors };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { status: "error", message: "Incorrect email or password." };
  redirect(safeNext(parsed.data.next));
}

export async function sendMagicLink(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "form_validation", fieldErrors: { email: parsed.error.issues[0]?.message } };
  }
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl()}/auth/confirm`, shouldCreateUser: false },
  });
  // Same response whether or not the account exists (no account enumeration).
  if (error && error.status !== 400 && error.status !== 422) {
    return { status: "error", message: "We couldn't send the link. Please retry." };
  }
  return { status: "success", message: "If that email has a Business Suite account, a sign-in link is on its way." };
}

/** Start Google / Apple sign-in; Supabase redirects back to /auth/callback. */
export async function signInWithProvider(provider: "google" | "apple", formData: FormData): Promise<void> {
  const nextRaw = formData.get("next");
  const next = typeof nextRaw === "string" ? safeNext(nextRaw) : "/";
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?error=oauth_failed");
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
