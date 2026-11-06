import "server-only";
import { cookies } from "next/headers";
import type { FacilityRole, RegistryType } from "sodia-core";
import { createServerSupabase } from "./supabase/server";

export const ACTIVE_FACILITY_COOKIE = "gp_active_facility";

export interface ActiveFacility {
  id: string;
  name: string;
  registryType: RegistryType;
  plan: "FREE" | "PRO";
  logoUrl: string | null;
  role: FacilityRole;
}

export interface SuiteSession {
  userId: string;
  email: string | null;
  displayName: string;
  facilities: ActiveFacility[];
  active: ActiveFacility | null;
}

/** Resolve the signed-in operator and the facility they are acting for. RLS scopes every row. */
export async function getSuiteSession(): Promise<SuiteSession | null> {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [{ data: staffRows }, { data: profile }] = await Promise.all([
    supabase
      .from("facility_staff")
      .select("role, facilities(id, name, registry_type, plan, logo_url)")
      .eq("user_id", auth.user.id),
    supabase.from("profiles").select("name, username").eq("id", auth.user.id).maybeSingle(),
  ]);

  const facilities: ActiveFacility[] = (staffRows ?? []).flatMap((row) =>
    row.facilities
      ? [{
          id: row.facilities.id,
          name: row.facilities.name,
          registryType: row.facilities.registry_type,
          plan: row.facilities.plan,
          logoUrl: row.facilities.logo_url,
          role: row.role,
        }]
      : []
  );

  const preferred = (await cookies()).get(ACTIVE_FACILITY_COOKIE)?.value;
  const active = facilities.find((f) => f.id === preferred) ?? facilities[0] ?? null;

  return {
    userId: auth.user.id,
    email: auth.user.email ?? null,
    displayName: profile?.name || profile?.username || auth.user.email || "Operator",
    facilities,
    active,
  };
}
