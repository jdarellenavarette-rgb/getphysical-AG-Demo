import "server-only";
import { describeDeniedScan } from "sodia-core";
import { startOfSuiteDay } from "../format";
import { createServerSupabase } from "../supabase/server";

export interface ScanRow {
  id: string;
  memberName: string;
  granted: boolean;
  /** Plain-language reason when entry was denied. */
  detail: string | null;
  at: string | null;
}

export async function loadRecentScans(facilityId: string, limit = 50): Promise<ScanRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("access_scans")
    .select("id, member_name, status, reason, created_at")
    .eq("facility_id", facilityId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Could not load check-ins.", { cause: error });
  return data.map((scan) => ({
    id: scan.id,
    memberName: scan.member_name,
    granted: scan.status === "GRANTED",
    detail: scan.status === "GRANTED" ? null : describeDeniedScan(scan.reason),
    at: scan.created_at,
  }));
}

export interface AttendanceSummary {
  grantedToday: number;
  deniedToday: number;
  /** Entries in the last two hours: an estimate of who is inside, since exits are not recorded. */
  lastTwoHours: number;
  /** Oldest first, seven Manila calendar days ending today. */
  daily: { day: string; granted: number }[];
}

export async function loadAttendanceSummary(facilityId: string): Promise<AttendanceSummary> {
  const supabase = await createServerSupabase();
  const now = new Date();
  const count = async (status: "GRANTED" | "DENIED", from: Date, to: Date) => {
    const { count: rows, error } = await supabase
      .from("access_scans")
      .select("id", { count: "exact", head: true })
      .eq("facility_id", facilityId)
      .eq("status", status)
      .gte("created_at", from.toISOString())
      .lt("created_at", to.toISOString());
    if (error) throw new Error("Could not load attendance.", { cause: error });
    return rows ?? 0;
  };

  const dayStarts = [6, 5, 4, 3, 2, 1, 0].map((daysAgo) => startOfSuiteDay(daysAgo, now));
  const tomorrow = new Date(dayStarts[6]!.getTime() + 86_400_000);
  const [deniedToday, lastTwoHours, ...daily] = await Promise.all([
    count("DENIED", dayStarts[6]!, tomorrow),
    count("GRANTED", new Date(now.getTime() - 2 * 3_600_000), tomorrow),
    ...dayStarts.map((start) => count("GRANTED", start, new Date(start.getTime() + 86_400_000))),
  ]);

  return {
    grantedToday: daily[6] ?? 0,
    deniedToday,
    lastTwoHours,
    daily: dayStarts.map((start, i) => ({ day: start.toISOString(), granted: daily[i] ?? 0 })),
  };
}
