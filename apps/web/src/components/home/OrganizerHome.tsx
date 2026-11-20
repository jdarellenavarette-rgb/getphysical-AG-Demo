import Link from "next/link";
import { CalendarPlus, Trophy } from "lucide-react";
import type { ActiveSuiteSession } from "../../lib/active-facility";
import { loadEvents } from "../../lib/data/events";
import { loadSetupProgress } from "../../lib/data/setup";
import { formatDateTime } from "../../lib/format";
import { SetupChecklist } from "../shell/SetupChecklist";
import { Badge } from "../ui/badge";
import { buttonClasses } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState, StatCard } from "../ui/states";
import { HomeHeader, Meter, SeeAll } from "./shared";

function daysUntil(iso: string): string {
  const days = Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
}

/** Organizer Pro home: an organizer works one event at a time, so it opens on the next one. */
export async function OrganizerHome({ session }: { session: ActiveSuiteSession }) {
  const [events, setup] = await Promise.all([
    loadEvents(session.active.id),
    loadSetupProgress(session.active.id, "ORGANIZER", session.userId),
  ]);
  const upcoming = events.filter((e) => !e.isPast && e.status === "PUBLISHED");
  const next = upcoming[0];
  const finished = events.filter((e) => e.isPast && e.status !== "CANCELLED" && e.registered > 0);
  const arrived = finished.reduce((sum, e) => sum + e.checkedIn, 0);
  const expected = finished.reduce((sum, e) => sum + e.registered, 0);
  const signedUp = upcoming.reduce((sum, e) => sum + e.registered, 0);

  return (
    <>
      <HomeHeader
        name={session.displayName}
        line={
          next
            ? `${next.title} is ${daysUntil(next.startsAt).toLowerCase()}, with ${next.registered} signed up.`
            : "Nothing is scheduled. Publish an event to start taking sign-ups."
        }
        action={
          <Link href="/events" className={buttonClasses("primary")}>
            <CalendarPlus size={16} aria-hidden />
            New event
          </Link>
        }
      />
      {!setup.complete && <SetupChecklist progress={setup} venueName={session.active.name} audience="participants" />}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Upcoming events" value={String(upcoming.length)} />
        <StatCard label="Signed up" value={String(signedUp)} hint="Across upcoming events" />
        <StatCard label="Events run" value={String(finished.length)} hint="With at least one sign-up" />
        <StatCard
          label="Turn-up rate"
          value={expected > 0 ? `${Math.round((arrived / expected) * 100)}%` : "—"}
          hint={expected > 0 ? `${arrived} of ${expected} arrived` : "Shown after your first event"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="self-start lg:col-span-2">
          <CardHeader>
            <CardTitle>Next event</CardTitle>
            {next && <Badge tone="success">{daysUntil(next.startsAt)}</Badge>}
          </CardHeader>
          <CardContent>
            {next ? (
              <div className="grid gap-4">
                <div>
                  <p className="font-display text-2xl">{next.title}</p>
                  <p className="mt-1 text-muted-foreground">
                    {[next.sport, formatDateTime(next.startsAt)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {next.capacity ? (
                  <div className="grid gap-2">
                    <Meter value={next.registered} max={next.capacity} label="Places taken" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {next.registered} of {next.capacity}
                      </span>{" "}
                      places taken · {Math.max(next.capacity - next.registered, 0)} left
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{next.registered}</span> signed up · no limit set
                  </p>
                )}
                <div>
                  <Link href={`/events/${next.id}`} className={buttonClasses("secondary")}>
                    Open sign-up list and event code
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Trophy}
                title="No event scheduled"
                description="Publish a tournament, race or open-play day. People sign up by scanning its code in the Sodia app."
              />
            )}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Coming up</CardTitle>
            <SeeAll href="/events">All events</SeeAll>
          </CardHeader>
          <CardContent>
            {upcoming.length <= 1 ? (
              <p className="text-sm text-muted-foreground">Nothing else is scheduled after that.</p>
            ) : (
              <ul className="grid gap-3">
                {upcoming.slice(1, 6).map((event) => (
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
