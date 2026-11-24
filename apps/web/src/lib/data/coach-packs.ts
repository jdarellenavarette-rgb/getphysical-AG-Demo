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

export interface UpcomingSession {
  id: string;
  packId: string;
  packName: string;
  clientId: string;
  at: string;
  note: string | null;
}

/** Sessions booked for the future, soonest first. Each already holds one place in its pack. */
export async function loadUpcomingSessions(coachId: string): Promise<UpcomingSession[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("coach_sessions")
    .select("id, held_at, note, coach_packs!inner(id, name, client_id, coach_id)")
    .eq("coach_packs.coach_id", coachId)
    .gt("held_at", new Date().toISOString())
    .order("held_at")
    .limit(100);
  if (error) throw new Error("Could not load upcoming sessions.", { cause: error });
  return (data ?? []).map((row) => ({
    id: row.id,
    packId: row.coach_packs.id,
    packName: row.coach_packs.name,
    clientId: row.coach_packs.client_id,
    at: row.held_at,
    note: row.note,
  }));
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
      // A session booked for later already takes a place in the pack.
      const held = row.coach_sessions.map((session) => session.held_at).sort();
      const now = new Date().toISOString();
      return {
        id: row.id,
        clientId: row.client_id,
        name: row.name,
        total: row.sessions_total,
        used: held.length,
        left: row.sessions_total - held.length,
        price: row.price_php === null ? null : Number(row.price_php),
        lastSessionAt: held.filter((at) => at <= now).at(-1) ?? null,
        createdAt: row.created_at,
      };
    })
    .sort((a, b) => Number(b.left > 0) - Number(a.left > 0));
}
