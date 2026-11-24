import "server-only";
import { coachPlanDaysSchema, type CoachPlanDay } from "sodia-core";
import { createServerSupabase } from "../supabase/server";

export interface CoachPlan {
  id: string;
  clientId: string;
  title: string;
  days: CoachPlanDay[];
  createdAt: string;
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** The plans the signed-in coach's clients are following now. */
export async function loadCoachPlans(coachId: string): Promise<CoachPlan[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("coach_plans")
    .select("id, client_id, title, days, created_at")
    .eq("coach_id", coachId)
    .is("ended_at", null)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("Could not load training plans.", { cause: error });
  return (data ?? []).flatMap((row) => {
    const days = coachPlanDaysSchema.safeParse(row.days);
    if (!days.success) return [];
    return [
      {
        id: row.id,
        clientId: row.client_id,
        title: row.title,
        days: [...days.data].sort((a, b) => ((a.weekday + 6) % 7) - ((b.weekday + 6) % 7)),
        createdAt: row.created_at,
      },
    ];
  });
}
