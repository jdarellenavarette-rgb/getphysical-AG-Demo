import Link from "next/link";
import { CalendarPlus, Trophy } from "lucide-react";
import { ActionForm } from "../../../components/ui/action-form";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input, Label } from "../../../components/ui/input";
import { EmptyState, PageHeader, StatCard } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { requireSection } from "../../../lib/active-facility";
import { loadEvents, type VenueEvent } from "../../../lib/data/events";
import { formatDateTime } from "../../../lib/format";
import { createEvent } from "../../actions/events";

export const metadata = { title: "Events" };

function places(event: VenueEvent): string {
  return event.capacity ? `${event.registered} of ${event.capacity}` : String(event.registered);
}

function EventStatus({ event }: { event: VenueEvent }) {
  if (event.status === "CANCELLED") return <Badge tone="danger">Cancelled</Badge>;
  if (event.status === "DRAFT") return <Badge>Draft</Badge>;
  if (event.isPast) return <Badge>Finished</Badge>;
  if (event.capacity && event.registered >= event.capacity) return <Badge tone="warning">Full</Badge>;
  return <Badge tone="success">Open</Badge>;
}

function EventTable({ events, past }: { events: VenueEvent[]; past: boolean }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Event</Th>
          <Th>When</Th>
          <Th>Status</Th>
          <Th className="text-right">Signed up</Th>
          {past && <Th className="text-right">Arrived</Th>}
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id}>
            <Td>
              <Link href={`/events/${event.id}`} className="font-semibold underline-offset-4 hover:underline">
                {event.title}
              </Link>
              {event.sport && <p className="text-sm text-muted-foreground">{event.sport}</p>}
            </Td>
            <Td className="whitespace-nowrap">{formatDateTime(event.startsAt)}</Td>
            <Td>
              <EventStatus event={event} />
            </Td>
            <Td className="text-right tabular-nums">{places(event)}</Td>
            {past && <Td className="text-right tabular-nums">{event.checkedIn}</Td>}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default async function EventsPage() {
  const { active } = await requireSection("events");
  const events = await loadEvents(active.id);
  const upcoming = events.filter((e) => !e.isPast && e.status !== "CANCELLED");
  const past = events.filter((e) => e.isPast || e.status === "CANCELLED");
  const signedUp = upcoming.reduce((sum, e) => sum + e.registered, 0);
  const finished = past.filter((e) => e.status !== "CANCELLED" && e.registered > 0);
  const arrived = finished.reduce((sum, e) => sum + e.checkedIn, 0);
  const expected = finished.reduce((sum, e) => sum + e.registered, 0);

  return (
    <>
      <PageHeader
        title="Events"
        description="Tournaments, classes and open-play days. People sign up in the Sodia app and you check them in on the day."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming events" value={String(upcoming.length)} />
        <StatCard label="Signed up" value={String(signedUp)} hint="Across upcoming events" />
        <StatCard
          label="Turn-up rate"
          value={expected > 0 ? `${Math.round((arrived / expected) * 100)}%` : "—"}
          hint={expected > 0 ? `${arrived} of ${expected} arrived at past events` : "Shown after your first event"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="self-start lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="Nothing scheduled"
                description="Publish your first event with the form on this page. It appears in the Sodia app for people to sign up."
              />
            ) : (
              <EventTable events={upcoming} past={false} />
            )}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>New event</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm
              action={createEvent}
              submitLabel="Publish event"
              pendingLabel="Publishing…"
              icon={<CalendarPlus size={16} aria-hidden />}
              className="grid items-stretch gap-4"
            >
              <Label>
                Name
                <Input name="title" required maxLength={120} placeholder="Saturday pickleball open play" />
              </Label>
              <Label>
                Sport or activity (optional)
                <Input name="sport" maxLength={40} placeholder="Pickleball" />
              </Label>
              <Label>
                Date
                <Input name="date" type="date" required />
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Label>
                  Starts
                  <Input name="start" type="time" required />
                </Label>
                <Label>
                  Ends (optional)
                  <Input name="end" type="time" />
                </Label>
              </div>
              <Label>
                Places (leave empty for no limit)
                <Input name="capacity" type="number" min={1} inputMode="numeric" />
              </Label>
              <Label>
                Details (optional)
                <Input name="description" maxLength={2000} placeholder="Format, what to bring, who it is for" />
              </Label>
            </ActionForm>
            <p className="mt-2 text-sm text-muted-foreground">
              Times are in Philippine time. Sign-up is free: entry fees are not collected through the suite yet.
            </p>
          </CardContent>
        </Card>
      </div>

      {past.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Past and cancelled</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <EventTable events={past} past />
          </CardContent>
        </Card>
      )}
    </>
  );
}
