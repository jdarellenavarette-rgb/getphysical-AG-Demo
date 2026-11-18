import { ClubHome } from "../../components/home/ClubHome";
import { CoachHome } from "../../components/home/CoachHome";
import { GymHome } from "../../components/home/GymHome";
import { OrganizerHome } from "../../components/home/OrganizerHome";
import { requireSuiteSession } from "../../lib/active-facility";

export const metadata = { title: "Home" };

/**
 * Each kind of business has its own home, because each one's day is about something different:
 * the door and the till for a gym, the courts for a club, individual people for a coach, and one
 * event at a time for an organizer.
 */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await requireSuiteSession();
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
