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
import { loadDeskPaid, paidKey } from "../../../../lib/data/desk";
import { loadEventBracket, loadEventRoster, loadEvents } from "../../../../lib/data/events";
import { loadQrCode } from "../../../../lib/data/join-code";
import { SUITE_TIME_ZONE, formatDateTime, formatPeso } from "../../../../lib/format";
import { ActionForm } from "../../../../components/ui/action-form";
import { Input, Label } from "../../../../components/ui/input";
import { MessagePeople } from "../../../../components/ui/message-people";
import { PayButton } from "../../../../components/ui/pay-button";
import { BracketCard } from "./BracketCard";
import { cancelEvent, setAttendance, updateEvent } from "../../../actions/events";

export const metadata = { title: "Event" };

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: SUITE_TIME_ZONE });
const time24 = new Intl.DateTimeFormat("en-GB", {
  timeZone: SUITE_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { active } = await requireSection("events");
  // Looked up within the active venue, so an id from another venue is simply not found.
  const event = (await loadEvents(active.id)).find((e) => e.id === id);
  if (!event) notFound();
  const [roster, code, paid, bracket] = await Promise.all([
    loadEventRoster(event.id),
    loadQrCode("EVENT", event.id),
    loadDeskPaid(active.id, "EVENT"),
    loadEventBracket(active.id, event.id),
  ]);
  const going = roster.filter((r) => r.status === "REGISTERED");
  const cancelled = event.status === "CANCELLED";
  const paidCount = going.filter(
    (person) => (paid.get(paidKey(event.id, person.userId)) ?? 0) >= (event.entryFee ?? 0),
  ).length;
  const day = dayKey.format(new Date(event.startsAt));

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
        description={[
          event.sport,
          formatDateTime(event.startsAt),
          event.entryFee ? `${formatPeso(event.entryFee)} to enter` : "Free to enter",
          event.description,
        ]
          .filter(Boolean)
          .join(" · ")}
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
        {event.entryFee ? (
          <StatCard
            label="Paid"
            value={`${paidCount} of ${going.length}`}
            hint={`${formatPeso(event.entryFee)} each, recorded at the desk`}
          />
        ) : (
          <StatCard label="Dropped out" value={String(roster.length - going.length)} hint="Cancelled their sign-up" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sign-up list</CardTitle>
            <MessagePeople
              userIds={going.map((person) => person.userId)}
              audience="everyone signed up"
              placeholder="A change of time, where to park, what to bring…"
            />
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
                    {event.categories.length > 0 && <Th>Category</Th>}
                    {event.entryFee && <Th>Entry fee</Th>}
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
                      {event.categories.length > 0 && <Td>{person.category ?? "—"}</Td>}
                      {event.entryFee && (
                        <Td>
                          <PayButton
                            kind="EVENT"
                            refId={event.id}
                            userId={person.userId}
                            price={event.entryFee}
                            paid={paid.get(paidKey(event.id, person.userId)) ?? 0}
                            payerName={person.name}
                          />
                        </Td>
                      )}
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

      <BracketCard
        eventId={event.id}
        bracket={bracket}
        categories={event.categories}
        signedUp={going.length}
        locked={cancelled}
      />

      {!cancelled && !event.isPast && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Edit event</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm
              action={updateEvent.bind(null, event.id)}
              submitLabel="Save changes"
              pendingLabel="Saving…"
              keepValues
              className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <Label className="sm:col-span-2">
                Name
                <Input name="title" required maxLength={120} defaultValue={event.title} />
              </Label>
              <Label>
                Sport or activity
                <Input name="sport" maxLength={40} defaultValue={event.sport ?? ""} />
              </Label>
              <Label>
                Places (empty for no limit)
                <Input name="capacity" type="number" min={1} inputMode="numeric" defaultValue={event.capacity ?? ""} />
              </Label>
              <Label>
                Date
                <Input name="date" type="date" required defaultValue={day} />
              </Label>
              <Label>
                Starts
                <Input name="start" type="time" required defaultValue={time24.format(new Date(event.startsAt))} />
              </Label>
              <Label>
                Ends
                <Input
                  name="end"
                  type="time"
                  defaultValue={event.endsAt ? time24.format(new Date(event.endsAt)) : ""}
                />
              </Label>
              <Label>
                Entry fee in ₱ (empty if free)
                <Input
                  name="fee"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  defaultValue={event.entryFee ?? ""}
                />
              </Label>
              <Label className="sm:col-span-2">
                Categories, separated by commas
                <Input name="categories" maxLength={600} defaultValue={event.categories.join(", ")} />
              </Label>
              <Label className="sm:col-span-2">
                Details
                <Input name="description" maxLength={2000} defaultValue={event.description ?? ""} />
              </Label>
            </ActionForm>
            <p className="mt-2 text-sm text-muted-foreground">
              Changing the time does not notify anyone. Use “Message everyone signed up” above to tell them.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
