import Link from "next/link";
import { CalendarPlus, CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { Meter } from "../../../components/home/shared";
import { ActionForm } from "../../../components/ui/action-form";
import { Badge } from "../../../components/ui/badge";
import { buttonClasses } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input, Label, Select } from "../../../components/ui/input";
import { EmptyState, PageHeader, StatCard } from "../../../components/ui/states";
import { requireSection } from "../../../lib/active-facility";
import { loadWeekClasses, weekStart, type ClassSession } from "../../../lib/data/classes";
import { shiftDay, todayKey } from "../../../lib/data/schedule";
import { SUITE_TIME_ZONE } from "../../../lib/format";
import { createClasses } from "../../actions/classes";

export const metadata = { title: "Classes" };

const time = new Intl.DateTimeFormat("en-PH", { timeZone: SUITE_TIME_ZONE, hour: "numeric", minute: "2-digit" });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: SUITE_TIME_ZONE });
const dayName = new Intl.DateTimeFormat("en-PH", {
  timeZone: SUITE_TIME_ZONE,
  weekday: "long",
  month: "short",
  day: "numeric",
});
const shortDay = new Intl.DateTimeFormat("en-PH", { timeZone: SUITE_TIME_ZONE, month: "short", day: "numeric" });
const at = (day: string) => new Date(`${day}T12:00:00+08:00`);

function ClassRow({ session }: { session: ClassSession }) {
  const full = session.booked >= session.capacity;
  return (
    <li>
      <Link
        href={`/classes/${session.id}`}
        className="grid gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted sm:grid-cols-[7rem_1fr_12rem] sm:items-center"
      >
        <span className="text-sm font-semibold tabular-nums">
          {time.format(new Date(session.startsAt))}
          <span className="block font-normal text-muted-foreground">until {time.format(new Date(session.endsAt))}</span>
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{session.title}</span>
          <span className="block truncate text-sm text-muted-foreground">
            {session.instructor ?? "No instructor set"}
          </span>
        </span>
        <span className="grid gap-1.5">
          {session.status === "CANCELLED" ? (
            <Badge tone="danger" className="justify-self-start">
              Cancelled
            </Badge>
          ) : (
            <>
              <span className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold tabular-nums">
                  {session.booked} of {session.capacity}
                </span>
                {full && <Badge tone="warning">Full</Badge>}
                {session.waitlist > 0 && <Badge>{session.waitlist} waiting</Badge>}
              </span>
              <Meter value={session.booked} max={session.capacity} label={`Places taken in ${session.title}`} />
            </>
          )}
        </span>
      </Link>
    </li>
  );
}

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { active } = await requireSection("classes");
  const monday = weekStart((await searchParams).week);
  const sessions = await loadWeekClasses(active.id, monday);
  const live = sessions.filter((session) => session.status === "SCHEDULED");
  const places = live.reduce((sum, session) => sum + session.capacity, 0);
  const booked = live.reduce((sum, session) => sum + session.booked, 0);
  const waiting = live.reduce((sum, session) => sum + session.waitlist, 0);
  const days = Array.from({ length: 7 }, (_, index) => shiftDay(monday, index));
  const today = todayKey();
  const isThisWeek = monday === weekStart(undefined);

  return (
    <>
      <PageHeader
        title="Classes"
        description="Your timetable. Each class has a number of places; when it fills, the next people join a waitlist and move up when someone drops out."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/classes?week=${shiftDay(monday, -7)}`}
              aria-label="Previous week"
              className={buttonClasses("secondary", "md", "px-3")}
            >
              <ChevronLeft size={18} aria-hidden />
            </Link>
            <Link
              href="/classes"
              aria-current={isThisWeek ? "date" : undefined}
              className={buttonClasses("secondary", "md")}
            >
              This week
            </Link>
            <Link
              href={`/classes?week=${shiftDay(monday, 7)}`}
              aria-label="Next week"
              className={buttonClasses("secondary", "md", "px-3")}
            >
              <ChevronRight size={18} aria-hidden />
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Classes this week" value={String(live.length)} />
        <StatCard
          label="Places booked"
          value={`${booked} of ${places}`}
          hint={places > 0 ? `${Math.round((booked / places) * 100)}% full` : undefined}
        />
        <StatCard label="On a waitlist" value={String(waiting)} hint="Waiting for a place to open" />
        <StatCard
          label="Attended"
          value={String(live.reduce((sum, session) => sum + session.attended, 0))}
          hint="Marked present so far"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="self-start lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Week of {shortDay.format(at(monday))} to {shortDay.format(at(shiftDay(monday, 6)))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <EmptyState
                icon={CalendarRange}
                title="No classes this week"
                description="Add a class with the form on this page. Repeat it weekly to fill the timetable in one go."
              />
            ) : (
              <div className="grid gap-6">
                {days
                  .map((day) => ({
                    day,
                    list: sessions.filter((session) => dayKey.format(new Date(session.startsAt)) === day),
                  }))
                  .filter((group) => group.list.length > 0)
                  .map((group) => (
                    <section key={group.day} aria-label={dayName.format(at(group.day))}>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                        {dayName.format(at(group.day))}
                        {group.day === today && <Badge tone="success">Today</Badge>}
                      </h3>
                      <ul className="grid gap-2">
                        {group.list.map((session) => (
                          <ClassRow key={session.id} session={session} />
                        ))}
                      </ul>
                    </section>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Add a class</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm
              action={createClasses}
              submitLabel="Add to timetable"
              pendingLabel="Adding…"
              icon={<CalendarPlus size={16} aria-hidden />}
              className="grid items-stretch gap-4"
            >
              <Label>
                Class name
                <Input name="title" required maxLength={80} placeholder="Evening Spin" />
              </Label>
              <Label>
                Instructor (optional)
                <Input name="instructor" maxLength={80} placeholder="Coach Jo" />
              </Label>
              <Label>
                First date
                <Input name="date" type="date" required />
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Label>
                  Starts
                  <Input name="start" type="time" step={900} required />
                </Label>
                <Label>
                  Length
                  <Select name="minutes" defaultValue={60}>
                    {[30, 45, 60, 75, 90, 120].map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} minutes
                      </option>
                    ))}
                  </Select>
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Label>
                  Places
                  <Input name="capacity" type="number" min={1} max={1000} required inputMode="numeric" />
                </Label>
                <Label>
                  Drop-in price ₱
                  <Input name="price" type="number" min={0} step="any" inputMode="decimal" placeholder="Free" />
                </Label>
              </div>
              <Label>
                Repeat
                <Select name="weeks" defaultValue={1}>
                  <option value={1}>Just this once</option>
                  {[4, 8, 12].map((weeks) => (
                    <option key={weeks} value={weeks}>
                      Weekly for {weeks} weeks
                    </option>
                  ))}
                </Select>
              </Label>
            </ActionForm>
            <p className="mt-2 text-sm text-muted-foreground">
              Times are in Philippine time. Places are booked at the desk for now; booking from the Sodia app arrives
              with the app&apos;s next update.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
