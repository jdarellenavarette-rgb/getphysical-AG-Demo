import Link from "next/link";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { DayGrid } from "../../../components/schedule/DayGrid";
import { ActionButton } from "../../../components/ui/action-button";
import { ActionForm } from "../../../components/ui/action-form";
import { Badge } from "../../../components/ui/badge";
import { buttonClasses } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input, Label, Select } from "../../../components/ui/input";
import { EmptyState, PageHeader } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { canManageFacility, requireSection } from "../../../lib/active-facility";
import { loadPeople } from "../../../lib/data/people";
import { loadDaySchedule, parseDay, shiftDay, todayKey } from "../../../lib/data/schedule";
import { SUITE_TIME_ZONE } from "../../../lib/format";
import { cancelBooking, createBooking, createSpace, setSpaceActive } from "../../actions/schedule";

export const metadata = { title: "Schedule" };

const time = new Intl.DateTimeFormat("en-PH", { timeZone: SUITE_TIME_ZONE, hour: "numeric", minute: "2-digit" });
const longDay = new Intl.DateTimeFormat("en-PH", {
  timeZone: SUITE_TIME_ZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});
const timeLabel = (iso: string) => time.format(new Date(iso));

const DURATIONS = [
  { minutes: 30, label: "30 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 90, label: "1 hour 30 minutes" },
  { minutes: 120, label: "2 hours" },
  { minutes: 180, label: "3 hours" },
  { minutes: 240, label: "4 hours" },
];

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const { active } = await requireSection("schedule");
  const day = parseDay(date);
  const [schedule, people] = await Promise.all([loadDaySchedule(active.id, day), loadPeople(active.id)]);
  const canManage = canManageFacility(active.role);
  const inUse = schedule.spaces.filter((space) => space.isActive);
  const wholeCourts = schedule.spaces.filter((space) => !space.parentId);
  const nameOf = new Map(schedule.spaces.map((space) => [space.id, space.name]));
  const isToday = day === todayKey();

  return (
    <>
      <PageHeader
        title="Schedule"
        description="Court bookings for the day. A court that divides into smaller courts is held automatically when either layout is booked."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/schedule?date=${shiftDay(day, -1)}`}
              aria-label="Previous day"
              className={buttonClasses("secondary", "md", "px-3")}
            >
              <ChevronLeft size={18} aria-hidden />
            </Link>
            <Link
              href="/schedule"
              aria-current={isToday ? "date" : undefined}
              className={buttonClasses("secondary", "md")}
            >
              Today
            </Link>
            <Link
              href={`/schedule?date=${shiftDay(day, 1)}`}
              aria-label="Next day"
              className={buttonClasses("secondary", "md", "px-3")}
            >
              <ChevronRight size={18} aria-hidden />
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{longDay.format(new Date(`${day}T12:00:00+08:00`))}</CardTitle>
            <Badge>
              {schedule.bookings.length} {schedule.bookings.length === 1 ? "booking" : "bookings"}
            </Badge>
          </CardHeader>
          <CardContent>
            {inUse.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No courts set up yet"
                description={
                  canManage
                    ? "Add your first court under Courts on this page. Bookings appear here as a day view."
                    : "Ask the owner or an admin to add the venue's courts. Bookings appear here as a day view."
                }
              />
            ) : (
              <DayGrid schedule={schedule} timeLabel={timeLabel} />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 self-start">
          {inUse.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>New booking</CardTitle>
              </CardHeader>
              <CardContent>
                <ActionForm
                  key={day}
                  action={createBooking}
                  submitLabel="Book court"
                  pendingLabel="Booking…"
                  icon={<CalendarPlus size={16} aria-hidden />}
                  className="grid items-stretch gap-4"
                >
                  <Label>
                    Court
                    <Select name="spaceId" required defaultValue={inUse[0]?.id}>
                      {inUse.map((space) => (
                        <option key={space.id} value={space.id}>
                          {space.name}
                          {space.parentId ? ` (part of ${nameOf.get(space.parentId)})` : ""}
                        </option>
                      ))}
                    </Select>
                  </Label>
                  {people.all.length > 0 && (
                    <Label>
                      Who is it for
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
                    {people.all.length > 0 ? "Name or group (optional if chosen above)" : "Booked for"}
                    <Input name="bookedFor" maxLength={120} placeholder="Name or group" />
                  </Label>
                  <Label>
                    Date
                    <Input name="date" type="date" required defaultValue={day} />
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Label>
                      Starts
                      <Input name="start" type="time" step={900} required />
                    </Label>
                    <Label>
                      Length
                      <Select name="minutes" defaultValue={60}>
                        {DURATIONS.map((option) => (
                          <option key={option.minutes} value={option.minutes}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </Label>
                  </div>
                  <Label>
                    Note (optional)
                    <Input name="note" maxLength={300} placeholder="Paid at the desk, bringing own net" />
                  </Label>
                </ActionForm>
                <p className="mt-2 text-sm text-muted-foreground">
                  Bookings are taken at the desk for now. Booking and paying from the Sodia app is not available yet.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Courts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {schedule.spaces.length > 0 && (
                <ul className="grid gap-2">
                  {schedule.spaces.map((space) => (
                    <li
                      key={space.id}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 ${space.parentId ? "ml-5" : ""}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{space.name}</span>
                        <span className="block text-sm text-muted-foreground">
                          {[space.sport, space.isActive ? null : "Switched off"].filter(Boolean).join(" · ") || "Court"}
                        </span>
                      </span>
                      {canManage && (
                        <ActionButton
                          action={setSpaceActive.bind(null, space.id, !space.isActive)}
                          pendingLabel="Saving…"
                          variant="ghost"
                          aria-label={`${space.isActive ? "Switch off" : "Switch on"} ${space.name}`}
                        >
                          {space.isActive ? "Switch off" : "Switch on"}
                        </ActionButton>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {canManage ? (
                <ActionForm
                  action={createSpace}
                  submitLabel="Add court"
                  pendingLabel="Adding…"
                  icon={<Plus size={16} aria-hidden />}
                  className="grid items-stretch gap-4"
                >
                  <Label>
                    Court name
                    <Input name="name" required maxLength={60} placeholder="Court 1" />
                  </Label>
                  <Label>
                    Sport (optional)
                    <Input name="sport" maxLength={40} placeholder="Badminton" />
                  </Label>
                  {wholeCourts.length > 0 && (
                    <Label>
                      Shares the floor of
                      <Select name="parentId" defaultValue="">
                        <option value="">Nothing: it is its own court</option>
                        {wholeCourts.map((space) => (
                          <option key={space.id} value={space.id}>
                            {space.name}
                          </option>
                        ))}
                      </Select>
                    </Label>
                  )}
                </ActionForm>
              ) : (
                schedule.spaces.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Only the owner or an admin can add or switch off courts.
                  </p>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {schedule.bookings.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Bookings this day</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <thead>
                <tr>
                  <Th>Time</Th>
                  <Th>Court</Th>
                  <Th>Booked for</Th>
                  <Th>Note</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {schedule.bookings.map((booking) => (
                  <tr key={booking.id}>
                    <Td className="whitespace-nowrap tabular-nums">
                      {timeLabel(booking.startsAt)} – {timeLabel(booking.endsAt)}
                    </Td>
                    <Td>{nameOf.get(booking.spaceId) ?? "Court"}</Td>
                    <Td className="font-semibold">{booking.bookedFor}</Td>
                    <Td className="text-muted-foreground">{booking.note ?? "—"}</Td>
                    <Td className="text-right">
                      <ActionButton
                        action={cancelBooking.bind(null, booking.id)}
                        pendingLabel="Cancelling…"
                        variant="ghost"
                        aria-label={`Cancel booking for ${booking.bookedFor}`}
                        confirm={{ question: "Cancel this booking?", yes: "Yes, cancel" }}
                      >
                        Cancel
                      </ActionButton>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
