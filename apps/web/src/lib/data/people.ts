import "server-only";
import type { MemberStanding } from "sodia-core";
import { createServerSupabase } from "../supabase/server";

/** Someone a business knows who is not one of its members: a record without an account, or an app user who only signed up or booked. */
export interface OtherPerson {
  key: string;
  userId: string | null;
  contactId: string | null;
  name: string;
  handle: string | null;
  email: string | null;
  phone: string | null;
  onApp: boolean;
  source: "IMPORT" | "DESK" | null;
  planName: string | null;
  planExpiresOn: string | null;
  eventsCount: number;
  bookingsCount: number;
  nextBookingAt: string | null;
}

/** What else is known about a member, beyond their standing. */
export interface MemberExtras {
  planName: string | null;
  planExpiresOn: string | null;
  eventsCount: number;
  bookingsCount: number;
  nextBookingAt: string | null;
}

export interface People {
  /** Keyed by user id, for the people who are members. */
  memberExtras: Map<string, MemberExtras>;
  others: OtherPerson[];
  /** Everyone, for pickers: members first is not guaranteed; sorted by name. */
  all: { key: string; name: string; onApp: boolean }[];
}

const MEMBER_STANDINGS = new Set<string>([
  "ACTIVE",
  "LAPSED",
  "NO_PASS",
  "PENDING",
  "CANCELLED",
] satisfies MemberStanding[]);

/** Everyone the business knows, one entry per person: members, contacts, event sign-ups and people with bookings. */
export async function loadPeople(facilityId: string): Promise<People> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("facility_people", { p_facility_id: facilityId });
  if (error) throw new Error("Could not load your list.", { cause: error });

  const memberExtras = new Map<string, MemberExtras>();
  const others: OtherPerson[] = [];
  for (const row of data ?? []) {
    const extras: MemberExtras = {
      planName: row.plan_name,
      planExpiresOn: row.plan_expires_on,
      eventsCount: row.events_count,
      bookingsCount: row.bookings_count,
      nextBookingAt: row.next_booking_at,
    };
    if (row.user_id && row.standing && MEMBER_STANDINGS.has(row.standing)) {
      memberExtras.set(row.user_id, extras);
    } else {
      others.push({
        key: row.person_key,
        userId: row.user_id,
        contactId: row.contact_id,
        name: row.name,
        handle: row.username ? `@${row.username}` : null,
        email: row.email,
        phone: row.phone,
        onApp: row.on_app,
        source: row.contact_source === "IMPORT" || row.contact_source === "DESK" ? row.contact_source : null,
        ...extras,
      });
    }
  }
  return {
    memberExtras,
    others,
    all: (data ?? []).map((row) => ({ key: row.person_key, name: row.name, onApp: row.on_app })),
  };
}

/** Resolve a picker value ("u:<id>" or "c:<id>") against the business's own list. Null when it is not on it. */
export async function findPerson(
  facilityId: string,
  key: string,
): Promise<{ name: string; userId: string | null; contactId: string | null } | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("facility_people", { p_facility_id: facilityId });
  if (error) return null;
  const row = (data ?? []).find((person) => person.person_key === key);
  if (!row) return null;
  // A booking points at the account when there is one, otherwise at the contact record.
  return { name: row.name, userId: row.user_id, contactId: row.user_id ? null : row.contact_id };
}
