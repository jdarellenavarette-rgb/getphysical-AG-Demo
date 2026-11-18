import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { ActionButton } from "../../../../components/ui/action-button";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { QrCode } from "../../../../components/ui/qr";
import { EmptyState, PageHeader, StatCard } from "../../../../components/ui/states";
import { Table, Td, Th } from "../../../../components/ui/table";
import { requireSection } from "../../../../lib/active-facility";
import { loadEventRoster, loadEvents } from "../../../../lib/data/events";
import { loadQrCode } from "../../../../lib/data/join-code";
import { formatDateTime } from "../../../../lib/format";
import { cancelEvent, setAttendance } from "../../../actions/events";

export const metadata = { title: "Event" };

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { active } = await requireSection("events");
  // Looked up within the active venue, so an id from another venue is simply not found.
  const event = (await loadEvents(active.id)).find((e) => e.id === id);
  if (!event) notFound();
  const [roster, code] = await Promise.all([loadEventRoster(event.id), loadQrCode("EVENT", event.id)]);
  const going = roster.filter((r) => r.status === "REGISTERED");
  const cancelled = event.status === "CANCELLED";

  return (
    <>
      <Link
        href="/events"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden />
        All events
      </Link>
      <PageHeader
        title={event.title}
        description={[event.sport, formatDateTime(event.startsAt), event.description].filter(Boolean).join(" · ")}
        actions={
          cancelled ? (
            <Badge tone="danger">Cancelled</Badge>
          ) : event.isPast ? (
            <Badge>Finished</Badge>
          ) : (
            <ActionButton
              action={cancelEvent.bind(null, event.id)}
              pendingLabel="Cancelling…"
              variant="danger"
              size="md"
              confirm={{ question: "Cancel this event? Sign-ups close.", yes: "Yes, cancel it" }}
            >
              Cancel event
            </ActionButton>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Signed up"
          value={event.capacity ? `${event.registered} of ${event.capacity}` : String(event.registered)}
          hint={event.capacity ? `${Math.max(event.capacity - event.registered, 0)} places left` : "No limit set"}
        />
        <StatCard label="Arrived" value={String(event.checkedIn)} hint="Marked present by your team" />
        <StatCard label="Dropped out" value={String(roster.length - going.length)} hint="Cancelled their sign-up" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sign-up list</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {going.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No sign-ups yet"
                description="Share the event code so people can sign up in the Sodia app. They appear here straight away."
              />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Person</Th>
                    <Th>Signed up</Th>
                    <Th>On the day</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {going.map((person) => (
                    <tr key={person.userId}>
                      <Td>
                        <p className="font-semibold">{person.name}</p>
                        {person.username && <p className="text-sm text-muted-foreground">@{person.username}</p>}
                      </Td>
                      <Td className="whitespace-nowrap">{formatDateTime(person.registeredAt)}</Td>
                      <Td>
                        {person.checkedInAt ? (
                          <Badge tone="success">Arrived {formatDateTime(person.checkedInAt)}</Badge>
                        ) : (
                          <Badge>Not yet</Badge>
                        )}
                      </Td>
                      <Td className="text-right">
                        {!cancelled && (
                          <ActionButton
                            action={setAttendance.bind(null, event.id, person.userId, !person.checkedInAt)}
                            pendingLabel="Saving…"
                            variant={person.checkedInAt ? "ghost" : "primary"}
                            aria-label={`${person.checkedInAt ? "Undo arrival for" : "Mark arrived:"} ${person.name}`}
                          >
                            {person.checkedInAt ? "Undo" : "Mark arrived"}
                          </ActionButton>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Event code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            {code ? (
              <>
                <QrCode modules={code.modules} label={`QR code for ${event.title}`} />
                <p className="max-w-52 text-sm text-muted-foreground">
                  Put this on a poster or a post. Scanning it in the Sodia app opens the event to sign up.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">The event code could not be loaded. Reload to try again.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
