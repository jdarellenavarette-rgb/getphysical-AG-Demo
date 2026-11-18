import "server-only";
import { createServerSupabase } from "../supabase/server";

export interface VenueEvent {
  id: string;
  title: string;
  description: string | null;
  sport: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  registered: number;
  checkedIn: number;
  /** Already finished (or started, when no end time is set). */
  isPast: boolean;
}

export interface EventAttendee {
  userId: string;
  name: string;
  username: string | null;
  status: "REGISTERED" | "CANCELLED";
  registeredAt: string | null;
  checkedInAt: string | null;
}

/** Every event the venue runs, soonest upcoming first, then the most recent past ones. */
export async function loadEvents(facilityId: string): Promise<VenueEvent[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("facility_events", { p_facility_id: facilityId });
  if (error) throw new Error("Could not load events.", { cause: error });
  const now = Date.now();
  const events = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    sport: row.sport,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    capacity: row.capacity,
    status: row.status,
    registered: row.registered,
    checkedIn: row.checked_in,
    isPast: new Date(row.ends_at ?? row.starts_at).getTime() < now,
  }));
  const upcoming = events.filter((e) => !e.isPast).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return [...upcoming, ...events.filter((e) => e.isPast)];
}

export async function loadEventRoster(eventId: string): Promise<EventAttendee[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("event_roster", { p_event_id: eventId });
  if (error) throw new Error("Could not load the sign-up list.", { cause: error });
  return (data ?? []).map((row) => ({
    userId: row.user_id,
    name: row.name,
    username: row.username,
    status: row.status === "CANCELLED" ? "CANCELLED" : "REGISTERED",
    registeredAt: row.registered_at,
    checkedInAt: row.checked_in_at,
  }));
}
