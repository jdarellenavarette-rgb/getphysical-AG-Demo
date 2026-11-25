import "server-only";
import { SUITE_TIME_ZONE } from "../format";
import { createServerSupabase } from "../supabase/server";

export interface Space {
  id: string;
  name: string;
  sport: string | null;
  parentId: string | null;
  isActive: boolean;
  /** Price per hour; null when the court has no price. */
  rate: number | null;
  peakRate: number | null;
}

export interface Booking {
  id: string;
  spaceId: string;
  bookedFor: string;
  note: string | null;
  startsAt: string;
  endsAt: string;
  /** Worked out by the database from the court's rate; null when the court has no price. */
  price: number | null;
}

export interface DaySchedule {
  /** Manila calendar day, YYYY-MM-DD. */
  day: string;
  /** Whole courts first, each followed by the courts it divides into. */
  spaces: Space[];
  bookings: Booking[];
  /** Hours (Philippine time) when the peak rate applies; null when there is no peak. */
  peak: { start: number; end: number } | null;
  /** The club takes court bookings from the Sodia app. */
  appBooking: boolean;
}

export const OPEN_HOUR = 6;
export const CLOSE_HOUR = 22;

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: SUITE_TIME_ZONE });

export function todayKey(now: Date = new Date()): string {
  return dayKey.format(now);
}

/** A valid YYYY-MM-DD day, or today when the value is missing or malformed. */
export function parseDay(value: string | undefined): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00+08:00`).getTime())) {
    return value;
  }
  return todayKey();
}

export function shiftDay(day: string, by: number): string {
  return dayKey.format(new Date(new Date(`${day}T12:00:00+08:00`).getTime() + by * 86_400_000));
}

/** Minutes after midnight, Manila time, clamped to the given day. */
export function minutesIntoDay(iso: string, day: string): number {
  const start = new Date(`${day}T00:00:00+08:00`).getTime();
  return Math.max(0, Math.min(24 * 60, Math.round((new Date(iso).getTime() - start) / 60_000)));
}

export async function loadDaySchedule(facilityId: string, day: string): Promise<DaySchedule> {
  const supabase = await createServerSupabase();
  const from = new Date(`${day}T00:00:00+08:00`);
  const to = new Date(from.getTime() + 86_400_000);
  const [spaces, bookings, venue] = await Promise.all([
    supabase
      .from("facility_spaces")
      .select("id, name, sport, parent_id, is_active, rate_php, peak_rate_php")
      .eq("facility_id", facilityId)
      .order("created_at"),
    supabase
      .from("space_bookings")
      .select("id, space_id, booked_for, note, starts_at, ends_at, price_php")
      .eq("facility_id", facilityId)
      .eq("status", "CONFIRMED")
      .lt("starts_at", to.toISOString())
      .gt("ends_at", from.toISOString())
      .order("starts_at"),
    supabase.from("facilities").select("peak_start_hour, peak_end_hour, app_booking").eq("id", facilityId).single(),
  ]);
  if (spaces.error ?? bookings.error ?? venue.error) {
    throw new Error("Could not load the schedule.", { cause: spaces.error ?? bookings.error ?? venue.error });
  }

  const all: Space[] = (spaces.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sport: row.sport,
    parentId: row.parent_id,
    isActive: row.is_active,
    rate: row.rate_php === null ? null : Number(row.rate_php),
    peakRate: row.peak_rate_php === null ? null : Number(row.peak_rate_php),
  }));
  const ordered = all
    .filter((space) => !space.parentId)
    .flatMap((parent) => [parent, ...all.filter((space) => space.parentId === parent.id)]);

  return {
    day,
    spaces: ordered,
    bookings: (bookings.data ?? []).map((row) => ({
      id: row.id,
      spaceId: row.space_id,
      bookedFor: row.booked_for,
      note: row.note,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      price: row.price_php === null ? null : Number(row.price_php),
    })),
    peak:
      venue.data.peak_start_hour !== null && venue.data.peak_end_hour !== null
        ? { start: venue.data.peak_start_hour, end: venue.data.peak_end_hour }
        : null,
    appBooking: venue.data.app_booking,
  };
}
