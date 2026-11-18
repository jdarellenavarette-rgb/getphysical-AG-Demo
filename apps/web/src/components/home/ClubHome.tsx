import Link from "next/link";
import { CalendarDays, CalendarPlus } from "lucide-react";
import type { ActiveSuiteSession } from "../../lib/active-facility";
import { canManageFacility } from "../../lib/active-facility";
import { loadEvents } from "../../lib/data/events";
import { loadDaySchedule, todayKey } from "../../lib/data/schedule";
import { loadSetupProgress } from "../../lib/data/setup";
import { SUITE_TIME_ZONE, formatDateTime } from "../../lib/format";
import { createServerSupabase } from "../../lib/supabase/server";
import { SetupChecklist } from "../shell/SetupChecklist";
import { Badge } from "../ui/badge";
import { buttonClasses } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState, StatCard } from "../ui/states";
import { HomeHeader, SeeAll } from "./shared";

const time = new Intl.DateTimeFormat("en-PH", { timeZone: SUITE_TIME_ZONE, hour: "numeric", minute: "2-digit" });

/** Clubdash home: a club's day is about its courts, so it opens on what is on them now and next. */
export async function ClubHome({ session }: { session: ActiveSuiteSession }) {
  const active = session.active;
  const supabase = await createServerSupabase();
  const [schedule, events, players, setup] = await Promise.all([
    loadDaySchedule(active.id, todayKey()),
    loadEvents(active.id),
    supabase
      .from("facility_memberships")
      .select("user_id", { count: "exact", head: true })
      .eq("facility_id", active.id)
      .eq("status", "ACTIVE"),
    canManageFacility(active.role) ? loadSetupProgress(active.id, "CLUB", session.userId) : null,
  ]);
  if (players.error) throw new Error("Could not load your players.", { cause: players.error });

  const now = Date.now();
  const courts = schedule.spaces.filter((space) => space.isActive);
  const nameOf = new Map(schedule.spaces.map((space) => [space.id, space.name]));
  const onNow = schedule.bookings.filter(
    (b) => new Date(b.startsAt).getTime() <= now && new Date(b.endsAt).getTime() > now,
  );
  const later = schedule.bookings.filter((b) => new Date(b.startsAt).getTime() > now);
  const hours = schedule.bookings.reduce(
    (sum, b) => sum + (new Date(b.endsAt).getTime() - new Date(b.startsAt).getTime()) / 3_600_000,
    0,
  );
  const upcoming = events.filter((e) => !e.isPast && e.status === "PUBLISHED").slice(0, 3);

  return (
    <>
      <HomeHeader
        name={session.displayName}
        line={
          courts.length === 0
            ? "Add your courts to start taking bookings."
            : `${schedule.bookings.length} ${schedule.bookings.length === 1 ? "booking" : "bookings"} today across ${courts.length} courts.`
        }
        action={
          <Link href="/schedule" className={buttonClasses("primary")}>
            <CalendarPlus size={16} aria-hidden />
            Book a court
          </Link>
        }
      />
      {setup && !setup.complete && <SetupChecklist progress={setup} venueName={active.name} audience="players" />}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="On court now" value={String(onNow.length)} hint={`Of ${courts.length} courts`} />
        <StatCard
          label="Bookings today"
          value={String(schedule.bookings.length)}
          hint={`${later.length} still to come`}
        />
        <StatCard
          label="Court hours today"
          value={hours.toFixed(hours % 1 === 0 ? 0 : 1)}
          hint="Booked across all courts"
        />
        <StatCard
          label="Players"
          value={String(players.count ?? 0)}
          hint={active.plan === "FREE" ? "Free plan covers 19" : "Pro plan"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="self-start lg:col-span-2">
          <CardHeader>
            <CardTitle>On the courts</CardTitle>
            <SeeAll href="/schedule">Full calendar</SeeAll>
          </CardHeader>
          <CardContent>
            {onNow.length + later.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title={schedule.bookings.length === 0 ? "No bookings today" : "Nothing more today"}
                description={
                  courts.length === 0
                    ? "Add your courts first, then book them for players at the desk."
                    : "Every court is free for the rest of the day."
                }
              />
            ) : (
              <ul className="grid gap-2">
                {[...onNow, ...later].slice(0, 8).map((booking) => (
                  <li
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{booking.bookedFor}</span>
                      <span className="block text-sm text-muted-foreground">
                        {nameOf.get(booking.spaceId) ?? "Court"} · {time.format(new Date(booking.startsAt))} –{" "}
                        {time.format(new Date(booking.endsAt))}
                      </span>
                    </span>
                    {onNow.includes(booking) ? <Badge tone="success">On now</Badge> : <Badge>Later today</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Club events</CardTitle>
            <SeeAll href="/events">All events</SeeAll>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No open play or tournaments are scheduled. Publish one under Events.
              </p>
            ) : (
              <ul className="grid gap-3">
                {upcoming.map((event) => (
                  <li key={event.id}>
                    <Link href={`/events/${event.id}`} className="font-semibold underline-offset-4 hover:underline">
                      {event.title}
                    </Link>
                    <span className="block text-sm text-muted-foreground">
                      {formatDateTime(event.startsAt)} · {event.registered}
                      {event.capacity ? ` of ${event.capacity}` : ""} signed up
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
