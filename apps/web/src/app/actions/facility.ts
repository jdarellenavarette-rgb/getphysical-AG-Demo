"use server";

import { BUSINESS_KINDS, WORKSPACES, type BusinessKind } from "sodia-core";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ACTIVE_FACILITY_COOKIE } from "../../lib/active-facility";
import { createServerSupabase } from "../../lib/supabase/server";

export interface FacilityFormState {
  status: "idle" | "form_validation" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "kind" | "address", string>>;
}

const createFacilitySchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120, "Name is too long"),
  kind: z.enum(BUSINESS_KINDS as [BusinessKind, ...BusinessKind[]], { message: "Choose what you are opening" }),
  address: z.string().trim().max(200).default(""),
});

// Secure cookies are dropped on plain-http localhost by some browsers, so only require HTTPS in production.
const activeFacilityCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

/** Register a new facility (tenant). The caller becomes its OWNER via a DB trigger. */
export async function createFacility(_prev: FacilityFormState, formData: FormData): Promise<FacilityFormState> {
  const parsed = createFacilitySchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    address: formData.get("address") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: FacilityFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "name" || key === "kind" || key === "address") fieldErrors[key] = issue.message;
    }
    return { status: "form_validation", fieldErrors };
  }

  const workspace = WORKSPACES[parsed.data.kind];
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data, error } = await supabase
    .from("facilities")
    .insert({
      owner_id: auth.user.id,
      name: parsed.data.name,
      // The workspace decides the registry and the label the app shows; neither is typed in by hand.
      business_kind: parsed.data.kind,
      registry_type: workspace.registryType,
      address: parsed.data.address,
      category: workspace.category,
    })
    .select("id")
    .single();
  if (error) return { status: "error", message: "We couldn't create the business. Please retry." };

  (await cookies()).set(ACTIVE_FACILITY_COOKIE, data.id, activeFacilityCookieOptions);
  revalidatePath("/");
  redirect("/");
}

/** Switch which facility the suite operates on (must be one the user staffs). */
export async function selectFacility(facilityId: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  // Staff can read their co-workers' rows too, so match on the caller as well.
  const { data } = await supabase
    .from("facility_staff")
    .select("facility_id")
    .eq("facility_id", facilityId)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (data) {
    (await cookies()).set(ACTIVE_FACILITY_COOKIE, facilityId, activeFacilityCookieOptions);
  }
}

/** Test mode only: give the signed-in person a ready-made demo venue and switch to it. */
export async function openDemoVenue(_prev: FacilityFormState, _formData: FormData): Promise<FacilityFormState> {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data, error } = await supabase.rpc("create_demo_venue");
  if (error || !data) {
    return {
      status: "error",
      message: error?.message.includes("DEMO_DISABLED")
        ? "Demo venues aren't available here."
        : "We couldn't set up the demo venue. Please retry.",
    };
  }
  (await cookies()).set(ACTIVE_FACILITY_COOKIE, data, activeFacilityCookieOptions);
  revalidatePath("/", "layout");
  redirect("/");
}
