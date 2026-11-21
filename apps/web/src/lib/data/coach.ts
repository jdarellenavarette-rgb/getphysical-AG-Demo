import "server-only";
import type { BusinessKind } from "sodia-core";
import { createServerSupabase } from "../supabase/server";

export interface CoachClient {
  id: string;
  name: string;
  username: string | null;
  status: "ACTIVE" | "PENDING" | "CANCELLED";
  /** Who has to act on a pending link. */
  awaiting: "CLIENT" | "COACH" | null;
  since: string | null;
  lastWorkoutAt: string | null;
  /** Whole days since the last logged workout; null when nothing is logged. */
  daysSinceWorkout: number | null;
  workouts7d: number;
  workouts28d: number;
  /** Active, and no workout logged for three days or more. */
  needsNudge: boolean;
  /** Coached by the signed-in person. Training is only visible for these. */
  isMine: boolean;
  coachName: string | null;
}

export interface CoachDesk {
  clients: CoachClient[];
  plan: "FREE" | "PRO";
  activeCount: number;
}

export const NUDGE_AFTER_DAYS = 3;
export const FREE_CLIENT_CAP = 3;

interface RosterRow {
  client_id: string;
  name: string;
  username: string | null;
  status: CoachClient["status"];
  awaiting: string | null;
  since: string | null;
  last_workout_at: string | null;
  workouts_7d: number | null;
  workouts_28d: number | null;
  is_mine?: boolean;
  coach_name?: string;
}

/**
 * The signed-in coach's clients and how recently each one trained. In a coaching business the list
 * also shows who the other coaches on the team look after, without those clients' training.
 */
export async function loadCoachDesk(userId: string, business?: { id: string; kind: BusinessKind }): Promise<CoachDesk> {
  const supabase = await createServerSupabase();
  const shared = business?.kind === "COACH";
  const [roster, { data: profile }] = await Promise.all([
    shared ? supabase.rpc("business_coach_roster", { p_facility_id: business.id }) : supabase.rpc("coach_roster"),
    supabase.from("profiles").select("coach_plan").eq("id", userId).maybeSingle(),
  ]);
  if (roster.error) throw new Error("Could not load your clients.", { cause: roster.error });

  const now = Date.now();
  const clients: CoachClient[] = ((roster.data ?? []) as RosterRow[]).map((row) => {
    const isMine = row.is_mine ?? true;
    const days = row.last_workout_at ? Math.floor((now - new Date(row.last_workout_at).getTime()) / 86_400_000) : null;
    return {
      id: row.client_id,
      name: row.name,
      username: row.username,
      status: row.status,
      awaiting: row.awaiting === "CLIENT" || row.awaiting === "COACH" ? row.awaiting : null,
      since: row.since,
      lastWorkoutAt: row.last_workout_at,
      daysSinceWorkout: days,
      workouts7d: row.workouts_7d ?? 0,
      workouts28d: row.workouts_28d ?? 0,
      needsNudge: isMine && row.status === "ACTIVE" && (days === null || days >= NUDGE_AFTER_DAYS),
      isMine,
      coachName: isMine ? null : (row.coach_name ?? null),
    };
  });
  return {
    clients,
    plan: profile?.coach_plan ?? "FREE",
    activeCount: clients.filter((c) => c.isMine && c.status === "ACTIVE").length,
  };
}
