import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, UserPlus, Users } from "lucide-react";
import { ActionButton } from "../../../../components/ui/action-button";
import { ActionForm } from "../../../../components/ui/action-form";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input, Label, Select } from "../../../../components/ui/input";
import { PayButton } from "../../../../components/ui/pay-button";
import { EmptyState, PageHeader, StatCard } from "../../../../components/ui/states";
import { Table, Td, Th } from "../../../../components/ui/table";
import { requireSection } from "../../../../lib/active-facility";
import { loadClass } from "../../../../lib/data/classes";
import { loadDeskPaid, paidKey } from "../../../../lib/data/desk";
import { loadPeople } from "../../../../lib/data/people";
import { formatDateTime, formatPeso } from "../../../../lib/format";
import { addToClass, cancelClass, cancelPlace, setClassAttendance } from "../../../actions/classes";

export const metadata = { title: "Class" };

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { active } = await requireSection("classes");
  const [found, people, paid] = await Promise.all([
    /^[0-9a-f-]{36}$/.test(id) ? loadClass(active.id, id) : null,
    loadPeople(active.id),
    loadDeskPaid(active.id, "CLASS"),
  ]);
  if (!found) notFound();
  const { session, bookings } = found;
  const booked = bookings.filter((booking) => booking.status === "BOOKED");
  const waiting = bookings.filter((booking) => booking.status === "WAITLIST");
  const open = session.status === "SCHEDULED" && !session.isPast;

  return (
    <>
      <Link
        href="/classes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden />
        Timetable
      </Link>
      <PageHeader
        title={session.title}
        description={[
          formatDateTime(session.startsAt),
          session.instructor,
          session.price ? `${formatPeso(session.price)} drop-in` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          session.status === "CANCELLED" ? (
            <Badge tone="danger">Cancelled</Badge>
          ) : session.isPast ? (
            <Badge>Finished</Badge>
          ) : (
            <ActionButton
              action={cancelClass.bind(null, session.id)}
              pendingLabel="Cancelling…"
              variant="danger"
              size="md"
              confirm={{ question: "Cancel this class? Nobody is notified automatically.", yes: "Yes, cancel it" }}
            >
              Cancel class
            </ActionButton>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Places"
          value={`${session.booked} of ${session.capacity}`}
          hint={`${Math.max(session.capacity - session.booked, 0)} left`}
        />
        <StatCard label="Waiting" value={String(session.waitlist)} hint="Move up when someone drops out" />
        <StatCard label="Attended" value={String(session.attended)} hint="Marked present" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="self-start lg:col-span-2">
          <CardHeader>
            <CardTitle>Booked</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {booked.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nobody booked yet"
                description="Add someone with the form on this page."
              />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Person</Th>
                    {session.price !== null && <Th>Payment</Th>}
                    <Th>Attendance</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {booked.map((booking) => (
                    <tr key={booking.id}>
                      <Td>
                        <p className="font-semibold">{booking.name}</p>
                        {!booking.userId && <p className="text-sm text-muted-foreground">Booked at the desk</p>}
                      </Td>
                      {session.price !== null && (
                        <Td>
                          <PayButton
                            kind="CLASS"
                            refId={booking.id}
                            price={session.price}
                            paid={paid.get(paidKey(booking.id)) ?? 0}
                            payerName={booking.name}
                          />
                        </Td>
                      )}
                      <Td>{booking.attendedAt ? <Badge tone="success">Attended</Badge> : <Badge>Not yet</Badge>}</Td>
                      <Td className="text-right">
                        <span className="inline-flex flex-wrap justify-end gap-2">
                          {session.status === "SCHEDULED" && (
                            <ActionButton
                              action={setClassAttendance.bind(null, booking.id, !booking.attendedAt)}
                              pendingLabel="Saving…"
                              variant={booking.attendedAt ? "ghost" : "primary"}
                              aria-label={`${booking.attendedAt ? "Undo attendance for" : "Mark attended:"} ${booking.name}`}
                            >
                              {booking.attendedAt ? "Undo" : "Mark attended"}
                            </ActionButton>
                          )}
                          {open && (
                            <ActionButton
                              action={cancelPlace.bind(null, booking.id)}
                              pendingLabel="Removing…"
                              variant="ghost"
                              aria-label={`Remove ${booking.name} from the class`}
                              confirm={{ question: `Remove ${booking.name}?`, yes: "Yes, remove" }}
                            >
                              Remove
                            </ActionButton>
                          )}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 self-start">
          {open && (
            <Card>
              <CardHeader>
                <CardTitle>Add someone</CardTitle>
              </CardHeader>
              <CardContent>
                <ActionForm
                  action={addToClass.bind(null, session.id)}
                  id="add-to-class"
                  submitLabel={session.booked >= session.capacity ? "Add to waitlist" : "Give a place"}
                  pendingLabel="Adding…"
                  icon={<UserPlus size={16} aria-hidden />}
                  className="grid items-stretch gap-4"
                >
                  {people.all.length > 0 && (
                    <Label>
                      From your list
                      <Select name="person" defaultValue="">
                        <option value="">Someone not on your list</option>
                        {people.all.map((person) => (
                          <option key={person.key} value={person.key}>
                            {person.name}
                            {person.onApp ? "" : " (not on the app)"}
                          </option>
                        ))}
                      </Select>
                    </Label>
                  )}
                  <Label>
                    {people.all.length > 0 ? "Or type a name" : "Name"}
                    <Input name="name" maxLength={120} autoComplete="off" />
                  </Label>
                </ActionForm>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Waitlist</CardTitle>
              <Badge>{waiting.length} waiting</Badge>
            </CardHeader>
            <CardContent>
              {waiting.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nobody is waiting. When the class is full, the next people to book are listed here in order.
                </p>
              ) : (
                <ol className="grid gap-2">
                  {waiting.map((booking, index) => (
                    <li key={booking.id} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="min-w-0">
                        <span className="font-semibold tabular-nums">{index + 1}.</span> {booking.name}
                      </span>
                      {open && (
                        <ActionButton
                          action={cancelPlace.bind(null, booking.id)}
                          pendingLabel="Removing…"
                          variant="ghost"
                          aria-label={`Remove ${booking.name} from the waitlist`}
                        >
                          Remove
                        </ActionButton>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
