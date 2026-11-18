import "server-only";
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
}

export interface CoachDesk {
  clients: CoachClient[];
  plan: "FREE" | "PRO";
  activeCount: number;
}

export const NUDGE_AFTER_DAYS = 3;
export const FREE_CLIENT_CAP = 3;

/** The signed-in coach's clients and how recently each one trained. */
export async function loadCoachDesk(userId: string): Promise<CoachDesk> {
  const supabase = await createServerSupabase();
  const [{ data: roster, error }, { data: profile }] = await Promise.all([
    supabase.rpc("coach_roster"),
    supabase.from("profiles").select("coach_plan").eq("id", userId).maybeSingle(),
  ]);
  if (error) throw new Error("Could not load your clients.", { cause: error });

  const now = Date.now();
  const clients: CoachClient[] = (roster ?? []).map((row) => {
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
      needsNudge: row.status === "ACTIVE" && (days === null || days >= NUDGE_AFTER_DAYS),
    };
  });
  return {
    clients,
    plan: profile?.coach_plan ?? "FREE",
    activeCount: clients.filter((c) => c.status === "ACTIVE").length,
  };
}
