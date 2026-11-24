import "server-only";
import { parseDay, shiftDay } from "./schedule";
import { createServerSupabase } from "../supabase/server";

export interface ClassSession {
  id: string;
  title: string;
  instructor: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  price: number | null;
  status: "SCHEDULED" | "CANCELLED";
  booked: number;
  waitlist: number;
  attended: number;
  isPast: boolean;
}

export interface ClassBooking {
  id: string;
  userId: string | null;
  name: string;
  status: "BOOKED" | "WAITLIST" | "CANCELLED";
  attendedAt: string | null;
  createdAt: string;
}

/** The Monday of the week containing `day` (a YYYY-MM-DD Philippine date), or of today. */
export function weekStart(day: string | undefined): string {
  const date = parseDay(day);
  // Noon avoids any edge at midnight; getUTCDay on a +08:00 noon is the Philippine weekday.
  const weekday = new Date(`${date}T12:00:00+08:00`).getUTCDay();
  return shiftDay(date, -((weekday + 6) % 7));
}

function toSession(row: {
  id: string;
  title: string;
  instructor: string | null;
  starts_at: string;
  ends_at: string;
  capacity: number;
  price_php: number | null;
  status: string;
  booked: number;
  waitlist: number;
  attended: number;
}): ClassSession {
  return {
    id: row.id,
    title: row.title,
    instructor: row.instructor,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    capacity: row.capacity,
    price: row.price_php === null ? null : Number(row.price_php),
    status: row.status === "CANCELLED" ? "CANCELLED" : "SCHEDULED",
    booked: row.booked,
    waitlist: row.waitlist,
    attended: row.attended,
    isPast: new Date(row.ends_at).getTime() < Date.now(),
  };
}

/** Seven days of classes from a Monday, each with how full it is. */
export async function loadWeekClasses(facilityId: string, monday: string): Promise<ClassSession[]> {
  const supabase = await createServerSupabase();
  const from = new Date(`${monday}T00:00:00+08:00`);
  const { data, error } = await supabase.rpc("facility_classes", {
    p_facility_id: facilityId,
    p_from: from.toISOString(),
    p_to: new Date(from.getTime() + 7 * 86_400_000).toISOString(),
  });
  if (error) throw new Error("Could not load classes.", { cause: error });
  return (data ?? []).map(toSession);
}

/** One class and everyone booked or waiting, in the order they asked. Null when it is not this venue's. */
export async function loadClass(
  facilityId: string,
  classId: string,
): Promise<{ session: ClassSession; bookings: ClassBooking[] } | null> {
  const supabase = await createServerSupabase();
  const [found, bookings] = await Promise.all([
    supabase
      .from("class_sessions")
      .select("id, title, instructor, starts_at, ends_at, capacity, price_php, status")
      .eq("id", classId)
      .eq("facility_id", facilityId)
      .maybeSingle(),
    supabase
      .from("class_bookings")
      .select("id, user_id, booked_name, status, attended_at, created_at")
      .eq("session_id", classId)
      .eq("facility_id", facilityId)
      .order("created_at"),
  ]);
  if (found.error ?? bookings.error)
    throw new Error("Could not load the class.", { cause: found.error ?? bookings.error });
  if (!found.data) return null;
  const rows = (bookings.data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.booked_name,
    status: row.status as ClassBooking["status"],
    attendedAt: row.attended_at,
    createdAt: row.created_at,
  }));
  return {
    session: toSession({
      ...found.data,
      booked: rows.filter((row) => row.status === "BOOKED").length,
      waitlist: rows.filter((row) => row.status === "WAITLIST").length,
      attended: rows.filter((row) => row.status === "BOOKED" && row.attendedAt).length,
    }),
    bookings: rows,
  };
}
