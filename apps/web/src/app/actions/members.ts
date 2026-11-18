"use server";

import { endMembershipResultSchema, grantPassResultSchema } from "sodia-core";
import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { formatDate } from "../../lib/format";
import { createServerSupabase } from "../../lib/supabase/server";

export interface MemberFormState {
  status: "idle" | "form_validation" | "error" | "success";
  message?: string;
}

const usernameSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^@/, ""))
  .pipe(z.string().min(3, "Enter the member's Sodia username").max(30, "That username is too long"));

/** Add an existing Sodia user as a member of the active facility. Caps and permissions are enforced by the database. */
export async function addMember(_prev: MemberFormState, formData: FormData): Promise<MemberFormState> {
  const parsed = usernameSchema.safeParse(formData.get("username"));
  if (!parsed.success) return { status: "form_validation", message: parsed.error.issues[0]?.message };

  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("id, name, username")
    .eq("username", parsed.data)
    .maybeSingle();
  if (lookupError) return { status: "error", message: "We couldn't look that username up. Please retry." };
  if (!profile) {
    return {
      status: "form_validation",
      message: `No Sodia account has the username @${parsed.data}. Ask the member to check it in their app.`,
    };
  }

  const displayName = profile.name || `@${profile.username}`;
  const { error } = await supabase
    .from("facility_memberships")
    .insert({ facility_id: active.id, user_id: profile.id, source: "STAFF_ADDED", status: "ACTIVE" });
  if (error?.code === "23505") {
    // Already on the roster: reactivate instead of failing.
    const { error: updateError } = await supabase
      .from("facility_memberships")
      .update({ status: "ACTIVE" })
      .eq("facility_id", active.id)
      .eq("user_id", profile.id);
    if (updateError) return { status: "error", message: "We couldn't update that member. Please retry." };
    return { status: "success", message: `${displayName} was already on your list and is back on it.` };
  }
  if (error) {
    if (error.message.includes("COMMUNITY_FREE_MEMBER_CAP_REACHED")) {
      return { status: "error", message: "The free plan allows 19 members. Upgrade the club to add more." };
    }
    if (error.code === "42501") return { status: "error", message: "You don't have permission to add members here." };
    return { status: "error", message: "We couldn't add that member. Please retry." };
  }
  return {
    status: "success",
    message:
      active.registryType === "COMMUNITY"
        ? `${displayName} is now a member of ${active.name}.`
        : `${displayName} is on your list. They need a pass to check in: grant one below, or they can buy one in the app.`,
  };
}

const userIdSchema = z.string().uuid();

export type MemberActionResult = { ok: true; message: string } | { ok: false; message: string };

function describeFailure(error: { code?: string; message: string }, fallback: string): MemberActionResult {
  if (error.code === "42501") return { ok: false, message: "Only the owner or an admin can do this." };
  if (error.message.includes("COMMUNITY_FREE_MEMBER_CAP_REACHED")) {
    return { ok: false, message: "The free plan allows 19 members. Upgrade the club to add more." };
  }
  return { ok: false, message: fallback };
}

/** Give a member door access without an app purchase (guest, trial, or paid at the desk). Owners and admins only. */
export async function grantPass(userId: string, days: number): Promise<MemberActionResult> {
  const parsed = z.object({ userId: userIdSchema, days: z.number().int().min(1).max(366) }).safeParse({ userId, days });
  if (!parsed.success) return { ok: false, message: "Choose between 1 and 366 days." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("grant_complimentary_pass", {
    p_facility_id: active.id,
    p_user_id: parsed.data.userId,
    p_days: parsed.data.days,
  });
  if (error) return describeFailure(error, "We couldn't grant the pass. Please retry.");
  const result = grantPassResultSchema.safeParse(data);
  return {
    ok: true,
    message: result.success
      ? `Pass granted until ${formatDate(result.data.valid_until)}. It appears on the member's card in the Sodia app.`
      : "Pass granted.",
  };
}

/** End a membership and stop door access. Owners and admins only. */
export async function endMembership(userId: string): Promise<MemberActionResult> {
  const parsedUser = userIdSchema.safeParse(userId);
  if (!parsedUser.success) return { ok: false, message: "That member could not be found." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("end_membership", {
    p_facility_id: active.id,
    p_user_id: parsedUser.data,
  });
  if (error) return describeFailure(error, "We couldn't end the membership. Please retry.");
  const result = endMembershipResultSchema.safeParse(data);
  const revoked = result.success ? result.data.revoked_passes : 0;
  return {
    ok: true,
    message:
      revoked > 0
        ? `Membership ended and ${revoked} ${revoked === 1 ? "pass" : "passes"} revoked. This is not a refund.`
        : "Membership ended.",
  };
}

/** Bring a cancelled member back onto the list. Door access still needs a pass at a gym. */
export async function reactivateMembership(userId: string): Promise<MemberActionResult> {
  const parsedUser = userIdSchema.safeParse(userId);
  if (!parsedUser.success) return { ok: false, message: "That member could not be found." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("facility_memberships")
    .update({ status: "ACTIVE" })
    .eq("facility_id", active.id)
    .eq("user_id", parsedUser.data);
  if (error) return describeFailure(error, "We couldn't reactivate the membership. Please retry.");
  return { ok: true, message: "Membership reactivated." };
}
