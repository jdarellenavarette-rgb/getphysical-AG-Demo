"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
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
    return { status: "success", message: `${displayName} was already on your list and is now active.` };
  }
  if (error) {
    if (error.message.includes("COMMUNITY_FREE_MEMBER_CAP_REACHED")) {
      return { status: "error", message: "The free plan allows 19 members. Upgrade the club to add more." };
    }
    if (error.code === "42501") return { status: "error", message: "You don't have permission to add members here." };
    return { status: "error", message: "We couldn't add that member. Please retry." };
  }
  return { status: "success", message: `${displayName} is now a member of ${active.name}.` };
}

const statusSchema = z.enum(["ACTIVE", "CANCELLED"]);

/** Cancel or reactivate a membership. */
export async function setMemberStatus(userId: string, status: "ACTIVE" | "CANCELLED"): Promise<void> {
  const parsedStatus = statusSchema.parse(status);
  const parsedUser = z.string().uuid().parse(userId);
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("facility_memberships")
    .update({ status: parsedStatus })
    .eq("facility_id", active.id)
    .eq("user_id", parsedUser);
  if (error) throw new Error("Could not update the membership.", { cause: error });
  revalidatePath("/members");
}
