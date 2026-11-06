import type { ProfileSetupInput } from "sodia-core";
import { getSupabase } from "../lib/supabase";

export type AuthResult = { ok: true } | { ok: false; message: string; field?: "email" | "code" | "username" };

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured for this build");
  return supabase;
}

/** Sends a one-time code to the email (creates the account on first use). */
export async function sendEmailCode(email: string): Promise<AuthResult> {
  const { error } = await client().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (!error) return { ok: true };
  if (error.status === 429) return { ok: false, message: "Too many codes requested. Wait a minute and try again." };
  return { ok: false, field: "email", message: "We couldn't send a code to that address." };
}

export async function verifyEmailCode(email: string, code: string): Promise<AuthResult> {
  const { error } = await client().auth.verifyOtp({ email, token: code, type: "email" });
  if (!error) return { ok: true };
  return { ok: false, field: "code", message: error.status === 429 ? "Too many attempts. Request a new code." : "That code is wrong or has expired." };
}

/** True when the signed-in user still needs to finish profile setup. */
export async function needsProfileSetup(): Promise<boolean> {
  const { data, error } = await client().rpc("get_my_profile");
  if (error || !data) return true;
  return !data.username || !data.dob || !data.first_name;
}

/** Names already known from the auth provider (Google / Apple) or the profile row. */
export async function getProfileDraft(): Promise<{ firstName: string; lastName: string }> {
  const supabase = client();
  const [{ data: profile }, { data: auth }] = await Promise.all([supabase.rpc("get_my_profile"), supabase.auth.getUser()]);
  const meta = (auth.user?.user_metadata ?? {}) as Record<string, unknown>;
  const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const fullName = text(meta.full_name) || text(meta.name);
  const [firstFromFull = "", ...rest] = fullName.split(/\s+/);
  return {
    firstName: profile?.first_name || text(meta.first_name) || text(meta.given_name) || firstFromFull,
    lastName: profile?.last_name || text(meta.last_name) || text(meta.family_name) || rest.join(" "),
  };
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data } = await client().from("profiles").select("id").eq("username", username).maybeSingle();
  return !data;
}

export async function completeProfile(input: ProfileSetupInput): Promise<AuthResult> {
  const supabase = client();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Your session expired. Sign in again." };
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      name: `${input.firstName} ${input.lastName}`,
      username: input.username,
      dob: input.dob,
    })
    .eq("id", auth.user.id);
  if (!error) return { ok: true };
  if (error.code === "23505") return { ok: false, field: "username", message: "That username was just taken." };
  if (error.message.includes("DOB_LOCKED")) return { ok: false, message: "Your date of birth is already set. Contact support to change it." };
  return { ok: false, message: "We couldn't save your profile. Please retry." };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
