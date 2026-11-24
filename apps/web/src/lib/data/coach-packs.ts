import "server-only";
import { createServerSupabase } from "../supabase/server";

export interface CoachPack {
  id: string;
  clientId: string;
  name: string;
  total: number;
  used: number;
  left: number;
  price: number | null;
  lastSessionAt: string | null;
  createdAt: string;
}

/** The signed-in coach's session packs, the ones with sessions left first. */
export async function loadCoachPacks(coachId: string): Promise<CoachPack[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("coach_packs")
    .select("id, client_id, name, sessions_total, price_php, created_at, coach_sessions(held_at)")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("Could not load session packs.", { cause: error });
  return (data ?? [])
    .map((row) => {
      const held = row.coach_sessions.map((session) => session.held_at).sort();
      return {
        id: row.id,
        clientId: row.client_id,
        name: row.name,
        total: row.sessions_total,
        used: held.length,
        left: row.sessions_total - held.length,
        price: row.price_php === null ? null : Number(row.price_php),
        lastSessionAt: held.at(-1) ?? null,
        createdAt: row.created_at,
      };
    })
    .sort((a, b) => Number(b.left > 0) - Number(a.left > 0));
}
