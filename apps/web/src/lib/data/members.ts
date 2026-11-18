import "server-only";
import { memberDirectoryRowSchema, type MemberStanding } from "sodia-core";
import { z } from "zod";
import { createServerSupabase } from "../supabase/server";

export interface MemberRow {
  userId: string;
  name: string;
  handle: string | null;
  standing: MemberStanding;
  source: string;
  joinedAt: string | null;
  passValidUntil: string | null;
  lastPassEndedAt: string | null;
  lastVisitAt: string | null;
  broadcastsMuted: boolean;
}

export type StandingCounts = Record<MemberStanding, number>;

export interface MemberList {
  members: MemberRow[];
  /** Everyone on the venue's list, before search and filters. */
  total: number;
  counts: StandingCounts;
  /** Members a broadcast can reach, by audience (muted members excluded). */
  reach: { all: number; active: number; lapsed: number };
}

/**
 * The venue's member directory. Standing is decided once, in the database
 * (`facility_member_directory`), so this screen, the door and the mobile app agree.
 */
export async function loadMemberDirectory(facilityId: string): Promise<MemberRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("facility_member_directory", { p_facility_id: facilityId });
  if (error) throw new Error("Could not load members.", { cause: error });
  return z
    .array(memberDirectoryRowSchema)
    .parse(data)
    .map((row) => ({
      userId: row.user_id,
      name: row.name,
      handle: row.username ? `@${row.username}` : null,
      standing: row.standing,
      source: row.source,
      joinedAt: row.joined_at,
      passValidUntil: row.pass_valid_until,
      lastPassEndedAt: row.last_pass_ended_at,
      lastVisitAt: row.last_visit_at,
      broadcastsMuted: row.broadcasts_muted,
    }));
}

export function summarizeMembers(all: MemberRow[]): Pick<MemberList, "total" | "counts" | "reach"> {
  const counts: StandingCounts = { ACTIVE: 0, LAPSED: 0, NO_PASS: 0, PENDING: 0, CANCELLED: 0 };
  for (const member of all) counts[member.standing] += 1;
  const reachable = all.filter((m) => !m.broadcastsMuted);
  return {
    total: all.length,
    counts,
    reach: {
      all: reachable.filter((m) => m.standing !== "CANCELLED" && m.standing !== "PENDING").length,
      active: reachable.filter((m) => m.standing === "ACTIVE").length,
      lapsed: reachable.filter((m) => m.standing === "LAPSED").length,
    },
  };
}

export async function loadMembers(
  facilityId: string,
  filters: { query?: string; standing?: MemberStanding | "ALL" },
): Promise<MemberList> {
  const all = await loadMemberDirectory(facilityId);
  const needle = filters.query?.trim().toLowerCase().replace(/^@/, "") ?? "";
  const members = all.filter(
    (m) =>
      (!filters.standing || filters.standing === "ALL" || m.standing === filters.standing) &&
      (!needle || m.name.toLowerCase().includes(needle) || (m.handle ?? "").toLowerCase().includes(needle)),
  );
  return { members, ...summarizeMembers(all) };
}
