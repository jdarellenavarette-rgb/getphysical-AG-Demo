import "server-only";
import type { FacilityRole } from "sodia-core";
import { createServerSupabase } from "../supabase/server";

export interface TeamMember {
  userId: string;
  name: string;
  username: string | null;
  role: FacilityRole;
  addedAt: string | null;
}

/** Everyone who can sign in to the suite for this venue. */
export async function loadTeam(facilityId: string): Promise<TeamMember[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("facility_team", { p_facility_id: facilityId });
  if (error) throw new Error("Could not load the team.", { cause: error });
  return (data ?? []).map((row) => ({
    userId: row.user_id,
    name: row.name,
    username: row.username,
    role: row.role,
    addedAt: row.added_at,
  }));
}
