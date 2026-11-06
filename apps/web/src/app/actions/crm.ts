"use server";

import {
  crmBroadcastInputSchema,
  crmReplyInputSchema,
  EXPLICIT_COLUMNS,
  toDbAudience,
  type CrmBroadcastInput,
  type CrmReplyInput,
} from "sodia-core";
import { createServerSupabase } from "../../lib/supabase/server";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; state: "form_validation"; fieldErrors: Record<string, string> }
  | { ok: false; state: "session_expired" | "permission_denied" | "error"; message: string; code?: string };

function fieldErrorsFrom(issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

function fromDbError(error: { message: string; code?: string }): ActionResult<never> {
  if (error.code === "42501" || error.message === "FORBIDDEN") {
    return { ok: false, state: "permission_denied", message: "You don't have access to this facility.", code: error.message };
  }
  return { ok: false, state: "error", message: "Something went wrong. Please retry.", code: error.code ?? error.message };
}

export interface BroadcastSummary {
  id: string;
  title: string;
  recipientCount: number;
  createdAt: string | null;
}

/** Send a CRM broadcast. Staff authorization + fan-out happen in the database. */
export async function sendCrmBroadcast(input: CrmBroadcastInput): Promise<ActionResult<BroadcastSummary>> {
  const parsed = crmBroadcastInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, state: "form_validation", fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, state: "session_expired", message: "Your session expired. Sign in again." };

  const { audience, segmentKey } = toDbAudience(parsed.data.audience);
  const { data, error } = await supabase.rpc("send_crm_broadcast", {
    p_facility_id: parsed.data.facilityId,
    p_suite_mode: parsed.data.suiteMode,
    p_audience: audience,
    p_title: parsed.data.title,
    p_body: parsed.data.body,
    p_promo_code: parsed.data.promoCode,
    p_segment_key: segmentKey ?? undefined,
    p_target_user_id: parsed.data.targetUserId,
    p_badge_text: parsed.data.badgeText,
  });
  if (error) {
    if (error.message === "SEGMENT_NOT_FOUND") {
      return { ok: false, state: "form_validation", fieldErrors: { audience: "This segment has no members configured yet." } };
    }
    return fromDbError(error);
  }
  return {
    ok: true,
    data: { id: data.id, title: data.title, recipientCount: data.recipient_count, createdAt: data.created_at },
  };
}

/** Reply to an athlete in a facility thread, as the facility. */
export async function sendCrmReply(input: CrmReplyInput): Promise<ActionResult<{ id: string; createdAt: string | null }>> {
  const parsed = crmReplyInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, state: "form_validation", fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, state: "session_expired", message: "Your session expired. Sign in again." };

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: parsed.data.conversationId, sender_kind: "FACILITY", body: parsed.data.body })
    .select("id, created_at")
    .single();
  if (error) return fromDbError(error);
  return { ok: true, data: { id: data.id, createdAt: data.created_at } };
}

export interface InboxThread {
  conversationId: string;
  athleteId: string;
  athleteName: string;
  athleteAvatar: string | null;
  athleteHandle: string | null;
  membershipStatus: string | null;
  lastVisitAt: string | null;
  lastMessageAt: string | null;
  messages: { id: string; fromFacility: boolean; body: string; createdAt: string | null; isBroadcast: boolean }[];
}

/** Load the facility's CRM inbox (threads + last 50 messages each). */
export async function loadFacilityInbox(facilityId: string): Promise<ActionResult<InboxThread[]>> {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, state: "session_expired", message: "Your session expired. Sign in again." };

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(EXPLICIT_COLUMNS.CONVERSATIONS)
    .eq("kind", "FACILITY")
    .eq("facility_id", facilityId)
    .order("last_message_at", { ascending: false })
    .limit(100);
  if (error) return fromDbError(error);
  if (conversations.length === 0) return { ok: true, data: [] };

  const athleteIds = conversations.map((c) => c.athlete_id).filter((id): id is string => Boolean(id));
  const conversationIds = conversations.map((c) => c.id);

  const [profiles, memberships, scans, messages] = await Promise.all([
    supabase.from("profiles").select("id, name, username, avatar_url, avatar").in("id", athleteIds),
    supabase.from("facility_memberships").select("user_id, status").eq("facility_id", facilityId).in("user_id", athleteIds),
    supabase
      .from("access_scans")
      .select("user_id, created_at")
      .eq("facility_id", facilityId)
      .eq("status", "GRANTED")
      .in("user_id", athleteIds)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("messages")
      .select(EXPLICIT_COLUMNS.MESSAGES)
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: true })
      .limit(50 * conversationIds.length),
  ]);
  const firstError = profiles.error ?? memberships.error ?? scans.error ?? messages.error;
  if (firstError) return fromDbError(firstError);
  const profileRows = profiles.data ?? [];
  const membershipRows = memberships.data ?? [];
  const scanRows = scans.data ?? [];
  const messageRows = messages.data ?? [];

  const threads: InboxThread[] = conversations.map((conversation) => {
    const profile = profileRows.find((p) => p.id === conversation.athlete_id);
    return {
      conversationId: conversation.id,
      athleteId: conversation.athlete_id ?? "",
      athleteName: profile?.name || profile?.username || "Member",
      athleteAvatar: profile?.avatar_url ?? profile?.avatar ?? null,
      athleteHandle: profile?.username ? `@${profile.username}` : null,
      membershipStatus: membershipRows.find((m) => m.user_id === conversation.athlete_id)?.status ?? null,
      lastVisitAt: scanRows.find((s) => s.user_id === conversation.athlete_id)?.created_at ?? null,
      lastMessageAt: conversation.last_message_at,
      messages: messageRows
        .filter((m) => m.conversation_id === conversation.id)
        .slice(-50)
        .map((m) => ({
          id: m.id,
          fromFacility: m.sender_kind === "FACILITY",
          body: m.body,
          createdAt: m.created_at,
          isBroadcast: m.broadcast_id !== null,
        })),
    };
  });
  return { ok: true, data: threads };
}
