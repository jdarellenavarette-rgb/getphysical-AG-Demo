import "server-only";
import type { BusinessKind } from "sodia-core";
import { createServerSupabase } from "../supabase/server";

export interface SetupStep {
  id: string;
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

function summarise(steps: SetupStep[]): SetupProgress {
  const doneCount = steps.filter((s) => s.done).length;
  return { steps, doneCount, complete: doneCount === steps.length };
}

const HEAD = { count: "exact", head: true } as const;

/** What a new gym or studio still has to do before it is really operating. */
async function gymSetup(facilityId: string): Promise<SetupProgress> {
  const supabase = await createServerSupabase();
  const [venue, plans, payout, mode, members, scans] = await Promise.all([
    supabase.from("facilities").select("address, hours").eq("id", facilityId).single(),
    supabase.from("facility_products").select("id", HEAD).eq("facility_id", facilityId).eq("is_active", true),
    supabase
      .from("facility_payout_accounts")
      .select("charges_enabled, is_sandbox")
      .eq("facility_id", facilityId)
      .maybeSingle(),
    supabase.rpc("payments_mode"),
    supabase.from("facility_memberships").select("user_id", HEAD).eq("facility_id", facilityId),
    supabase.from("access_scans").select("id", HEAD).eq("facility_id", facilityId).eq("status", "GRANTED"),
  ]);
  const error = venue.error ?? plans.error ?? payout.error ?? mode.error ?? members.error ?? scans.error;
  if (error) throw new Error("Could not load your setup progress.", { cause: error });

  const payoutsReady = Boolean(payout.data?.charges_enabled) && (!payout.data?.is_sandbox || mode.data === "sandbox");
  return summarise([
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
  ]);
}

/** A club is ready once it has courts, players and a booking on the calendar. */
async function clubSetup(facilityId: string): Promise<SetupProgress> {
  const supabase = await createServerSupabase();
  const [venue, courts, players, bookings] = await Promise.all([
    supabase.from("facilities").select("address, hours").eq("id", facilityId).single(),
    supabase.from("facility_spaces").select("id", HEAD).eq("facility_id", facilityId),
    supabase.from("facility_memberships").select("user_id", HEAD).eq("facility_id", facilityId),
    supabase.from("space_bookings").select("id", HEAD).eq("facility_id", facilityId),
  ]);
  const error = venue.error ?? courts.error ?? players.error ?? bookings.error;
  if (error) throw new Error("Could not load your setup progress.", { cause: error });
  return summarise([
    {
      id: "details",
      title: "Add your address and opening hours",
      description: "So players can find you and know when you're open.",
      href: "/settings",
      action: "Add details",
      done: Boolean(venue.data?.address?.trim()) && Boolean(venue.data?.hours?.trim()),
    },
    {
      id: "courts",
      title: "Add your courts",
      description: "Including any court that divides into smaller ones.",
      href: "/schedule",
      action: "Add courts",
      done: (courts.count ?? 0) > 0,
    },
    {
      id: "player",
      title: "Bring in your first player",
      description: "Add someone by username, or show your join code for them to scan.",
      href: "/members",
      action: "Add a player",
      done: (players.count ?? 0) > 0,
    },
    {
      id: "booking",
      title: "Take your first booking",
      description: "Book a court for someone at the desk.",
      href: "/schedule",
      action: "Open the calendar",
      done: (bookings.count ?? 0) > 0,
    },
  ]);
}

/** A coach is ready once someone has accepted their invitation. */
async function coachSetup(userId: string): Promise<SetupProgress> {
  const supabase = await createServerSupabase();
  const links = () => supabase.from("coach_clients").select("client_id", HEAD).eq("coach_id", userId);
  const [invited, accepted] = await Promise.all([links(), links().eq("status", "ACTIVE")]);
  const error = invited.error ?? accepted.error;
  if (error) throw new Error("Could not load your setup progress.", { cause: error });
  return summarise([
    {
      id: "invite",
      title: "Invite your first client",
      description: "By their Sodia username, or have them scan your coach code.",
      href: "/clients",
      action: "Invite a client",
      done: (invited.count ?? 0) > 0,
    },
    {
      id: "accepted",
      title: "Have a client accept",
      description: "Their training shows up here once they agree to be coached by you.",
      href: "/clients",
      action: "See invitations",
      done: (accepted.count ?? 0) > 0,
    },
  ]);
}

/** An organizer is ready once an event is published, has sign-ups, and someone has been checked in. */
async function organizerSetup(facilityId: string): Promise<SetupProgress> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("facility_events", { p_facility_id: facilityId });
  if (error) throw new Error("Could not load your setup progress.", { cause: error });
  const events = data ?? [];
  return summarise([
    {
      id: "event",
      title: "Publish your first event",
      description: "A tournament, a race or an open-play day.",
      href: "/events",
      action: "Publish an event",
      done: events.length > 0,
    },
    {
      id: "signup",
      title: "Get your first sign-up",
      description: "Share the event code; people sign up by scanning it in the Sodia app.",
      href: "/events",
      action: "Get the event code",
      done: events.some((event) => event.registered > 0),
    },
    {
      id: "arrival",
      title: "Check someone in on the day",
      description: "Open the event and mark people as they arrive.",
      href: "/events",
      action: "Open events",
      done: events.some((event) => event.checked_in > 0),
    },
  ]);
}

/** What a new business still has to do before it is really operating: different for each kind. */
export function loadSetupProgress(facilityId: string, kind: BusinessKind, userId: string): Promise<SetupProgress> {
  if (kind === "CLUB") return clubSetup(facilityId);
  if (kind === "COACH") return coachSetup(userId);
  if (kind === "ORGANIZER") return organizerSetup(facilityId);
  return gymSetup(facilityId);
}
