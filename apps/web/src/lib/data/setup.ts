import "server-only";
import { createServerSupabase } from "../supabase/server";

export interface SetupStep {
  id: "details" | "plan" | "payouts" | "member" | "checkin";
  title: string;
  description: string;
  href: string;
  action: string;
  done: boolean;
}

export interface SetupProgress {
  steps: SetupStep[];
  doneCount: number;
  complete: boolean;
}

/** What a new venue still has to do before it is really operating. Owners and admins only. */
export async function loadSetupProgress(facilityId: string): Promise<SetupProgress> {
  const supabase = await createServerSupabase();
  const head = { count: "exact", head: true } as const;
  const [venue, plans, payout, mode, members, scans] = await Promise.all([
    supabase.from("facilities").select("address, hours").eq("id", facilityId).single(),
    supabase.from("facility_products").select("id", head).eq("facility_id", facilityId).eq("is_active", true),
    supabase
      .from("facility_payout_accounts")
      .select("charges_enabled, is_sandbox")
      .eq("facility_id", facilityId)
      .maybeSingle(),
    supabase.rpc("payments_mode"),
    supabase.from("facility_memberships").select("user_id", head).eq("facility_id", facilityId),
    supabase.from("access_scans").select("id", head).eq("facility_id", facilityId).eq("status", "GRANTED"),
  ]);
  const error = venue.error ?? plans.error ?? payout.error ?? mode.error ?? members.error ?? scans.error;
  if (error) throw new Error("Could not load your setup progress.", { cause: error });

  const payoutsReady = Boolean(payout.data?.charges_enabled) && (!payout.data?.is_sandbox || mode.data === "sandbox");
  const steps: SetupStep[] = [
    {
      id: "details",
      title: "Add your address and opening hours",
      description: "So members can find you and know when you're open.",
      href: "/settings",
      action: "Add details",
      done: Boolean(venue.data?.address?.trim()) && Boolean(venue.data?.hours?.trim()),
    },
    {
      id: "plan",
      title: "Create your first plan",
      description: "A day pass, a membership, or anything else you sell.",
      href: "/plans",
      action: "Create a plan",
      done: (plans.count ?? 0) > 0,
    },
    {
      id: "payouts",
      title: "Set up payouts",
      description: "Members can only buy once you can be paid.",
      href: "/payouts",
      action: "Set up payouts",
      done: payoutsReady,
    },
    {
      id: "member",
      title: "Add your first member",
      description: "Add someone by username, or show your venue code for them to scan.",
      href: "/members",
      action: "Add a member",
      done: (members.count ?? 0) > 0,
    },
    {
      id: "checkin",
      title: "Check a member in",
      description: "Scan a membership card at the front desk.",
      href: "/check-in",
      action: "Open check-in",
      done: (scans.count ?? 0) > 0,
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  return { steps, doneCount, complete: doneCount === steps.length };
}
