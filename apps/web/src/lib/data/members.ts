import "server-only";
import type { Database } from "sodia-core";
import { createServerSupabase } from "../supabase/server";

export type MembershipStatus = Database["public"]["Enums"]["membership_status"];

export interface MemberRow {
  userId: string;
  name: string;
  handle: string | null;
  status: MembershipStatus;
  source: string;
  joinedAt: string | null;
  lastVisitAt: string | null;
}

export interface MemberList {
  members: MemberRow[];
  /** Members of this facility before search and status filters. */
  total: number;
  activeCount: number;
}

const MAX_MEMBERS = 1000;

/** The facility's members with profile names and last granted check-in. RLS limits rows to staff of the facility. */
export async function loadMembers(
  facilityId: string,
  filters: { query?: string; status?: MembershipStatus | "ALL" },
): Promise<MemberList> {
  const supabase = await createServerSupabase();
  const { data: memberships, error } = await supabase
    .from("facility_memberships")
    .select("user_id, status, source, joined_at")
    .eq("facility_id", facilityId)
    .order("joined_at", { ascending: false })
    .limit(MAX_MEMBERS);
  if (error) throw new Error("Could not load members.", { cause: error });
  if (memberships.length === 0) return { members: [], total: 0, activeCount: 0 };

  const userIds = memberships.map((m) => m.user_id);
  const [profiles, scans] = await Promise.all([
    supabase.from("profiles").select("id, name, username").in("id", userIds),
    supabase
      .from("access_scans")
      .select("user_id, created_at")
      .eq("facility_id", facilityId)
      .eq("status", "GRANTED")
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);
  if (profiles.error ?? scans.error)
    throw new Error("Could not load members.", { cause: profiles.error ?? scans.error });

  const profileById = new Map(profiles.data.map((p) => [p.id, p]));
  const lastVisit = new Map<string, string>();
  for (const scan of scans.data) {
    if (scan.user_id && scan.created_at && !lastVisit.has(scan.user_id)) lastVisit.set(scan.user_id, scan.created_at);
  }

  const all: MemberRow[] = memberships.map((m) => {
    const profile = profileById.get(m.user_id);
    return {
      userId: m.user_id,
      name: profile?.name || profile?.username || "Member",
      handle: profile?.username ? `@${profile.username}` : null,
      status: m.status,
      source: m.source,
      joinedAt: m.joined_at,
      lastVisitAt: lastVisit.get(m.user_id) ?? null,
    };
  });

  const needle = filters.query?.trim().toLowerCase().replace(/^@/, "") ?? "";
  const members = all.filter(
    (m) =>
      (!filters.status || filters.status === "ALL" || m.status === filters.status) &&
      (!needle || m.name.toLowerCase().includes(needle) || (m.handle ?? "").toLowerCase().includes(needle)),
  );
  return { members, total: all.length, activeCount: all.filter((m) => m.status === "ACTIVE").length };
}
