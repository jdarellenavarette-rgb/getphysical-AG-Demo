import { ClubHome } from "../../components/home/ClubHome";
import { CoachHome } from "../../components/home/CoachHome";
import { GymHome } from "../../components/home/GymHome";
import { OrganizerHome } from "../../components/home/OrganizerHome";
import { after } from "next/server";
import { requireSuiteSession } from "../../lib/active-facility";
import { createServerSupabase } from "../../lib/supabase/server";

export const metadata = { title: "Home" };

/**
 * Each kind of business has its own home, because each one's day is about something different:
 * the door and the till for a gym, the courts for a club, individual people for a coach, and one
 * event at a time for an organizer.
 */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await requireSuiteSession();
  // Date-based automated messages (pass ending, reminders) are checked once the page has been
  // sent, so opening Home never waits on them. The database never sends the same one twice.
  const supabase = await createServerSupabase();
  after(async () => {
    const { error } = await supabase.rpc("run_automations", { p_facility_id: session.active.id });
    if (error) console.error("Automated messages could not be checked.", error.message);
  });
  switch (session.active.kind) {
    case "CLUB":
      return <ClubHome session={session} />;
    case "COACH":
      return <CoachHome session={session} />;
    case "ORGANIZER":
      return <OrganizerHome session={session} />;
    default:
      return <GymHome session={session} range={(await searchParams).range} />;
  }
}
