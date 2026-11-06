"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ACTIVE_FACILITY_COOKIE } from "../../lib/active-facility";
import { createServerSupabase } from "../../lib/supabase/server";

export interface FacilityFormState {
  status: "idle" | "form_validation" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "registryType" | "address", string>>;
}

const createFacilitySchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120, "Name is too long"),
  registryType: z.enum(["COMMERCIAL", "COMMUNITY"], { message: "Choose a facility type" }),
  address: z.string().trim().max(200).default(""),
});

/** Register a new facility (tenant). The caller becomes its OWNER via a DB trigger. */
export async function createFacility(_prev: FacilityFormState, formData: FormData): Promise<FacilityFormState> {
  const parsed = createFacilitySchema.safeParse({
    name: formData.get("name"),
    registryType: formData.get("registryType"),
    address: formData.get("address") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: FacilityFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "name" || key === "registryType" || key === "address") fieldErrors[key] = issue.message;
    }
    return { status: "form_validation", fieldErrors };
  }

  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data, error } = await supabase
    .from("facilities")
    .insert({
      owner_id: auth.user.id,
      name: parsed.data.name,
      registry_type: parsed.data.registryType,
      address: parsed.data.address,
    })
    .select("id")
    .single();
  if (error) return { status: "error", message: "We couldn't create the facility. Please retry." };

  (await cookies()).set(ACTIVE_FACILITY_COOKIE, data.id, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  revalidatePath("/");
  redirect("/");
}

/** Switch which facility the suite operates on (must be one the user staffs). */
export async function selectFacility(facilityId: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("facility_staff").select("facility_id").eq("facility_id", facilityId).maybeSingle();
  if (data) {
    (await cookies()).set(ACTIVE_FACILITY_COOKIE, facilityId, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  }
  revalidatePath("/");
}
