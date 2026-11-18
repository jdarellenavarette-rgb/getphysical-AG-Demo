import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
  /** Account roles from the profile (e.g. "coach", "organizer"). Not client-writable. */
  profileRoles: string[];
  facilities: ActiveFacility[];
  active: ActiveFacility | null;
}

/** Resolve the signed-in operator and the facility they are acting for. RLS scopes every row. */
export const getSuiteSession = cache(async (): Promise<SuiteSession | null> => {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [{ data: staffRows, error: staffError }, { data: profile, error: profileError }] = await Promise.all([
    supabase
      .from("facility_staff")
      .select("role, facilities(id, name, registry_type, plan, logo_url)")
      .eq("user_id", auth.user.id),
    supabase.from("profiles").select("name, username, roles").eq("id", auth.user.id).maybeSingle(),
  ]);
  // A failed lookup must not look like "this person has no facility".
  if (staffError ?? profileError) {
    throw new Error("Could not load your facilities.", { cause: staffError ?? profileError });
  }

  const facilities: ActiveFacility[] = (staffRows ?? []).flatMap((row) =>
    row.facilities
      ? [
          {
            id: row.facilities.id,
            name: row.facilities.name,
            registryType: row.facilities.registry_type,
            plan: row.facilities.plan,
            logoUrl: row.facilities.logo_url,
            role: row.role,
          },
        ]
      : [],
  );

  const preferred = (await cookies()).get(ACTIVE_FACILITY_COOKIE)?.value;
  const active = facilities.find((f) => f.id === preferred) ?? facilities[0] ?? null;

  return {
    userId: auth.user.id,
    email: auth.user.email ?? null,
    displayName: profile?.name || profile?.username || auth.user.email || "Operator",
    profileRoles: profile?.roles ?? [],
    facilities,
    active,
  };
});

export type ActiveSuiteSession = SuiteSession & { active: ActiveFacility };

/** For pages inside the suite: the operator must be signed in and acting for a facility. */
export async function requireSuiteSession(): Promise<ActiveSuiteSession> {
  const session = await getSuiteSession();
  if (!session) redirect("/login");
  if (!session.active) redirect("/welcome");
  return { ...session, active: session.active };
}

/** Owners and admins manage the venue; staff and coaches operate it. */
export function canManageFacility(role: FacilityRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}
