import Link from "next/link";
import { MessageSquare, ScanLine, Users } from "lucide-react";
import { buttonClasses } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { PageHeader, StatCard } from "../../components/ui/states";
import { requireSuiteSession } from "../../lib/active-facility";
import { loadAttendanceSummary } from "../../lib/data/attendance";
import { loadMembers } from "../../lib/data/members";
import { SUITE_TIME_ZONE } from "../../lib/format";

export const metadata = { title: "Overview" };

const weekday = new Intl.DateTimeFormat("en-PH", { timeZone: SUITE_TIME_ZONE, weekday: "short" });

export default async function OverviewPage() {
  const { active } = await requireSuiteSession();
  const [attendance, members] = await Promise.all([
    loadAttendanceSummary(active.id),
    loadMembers(active.id, { status: "ALL" }),
  ]);
  const peak = Math.max(1, ...attendance.daily.map((d) => d.granted));
  const weekTotal = attendance.daily.reduce((sum, d) => sum + d.granted, 0);

  return (
    <>
      <PageHeader
        title="Overview"
        description={`Today at ${active.name}. Figures come from your own members and check-ins.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active members"
          value={String(members.activeCount)}
          hint={`${members.total} on your list in total`}
        />
        <StatCard label="Check-ins today" value={String(attendance.grantedToday)} />
        <StatCard
          label="Entered in the last 2 hours"
          value={String(attendance.lastTwoHours)}
          hint="An estimate of who is inside; exits aren't recorded"
        />
        <StatCard label="Denied at the door today" value={String(attendance.deniedToday)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Check-ins, last 7 days</CardTitle>
            <span className="text-sm text-muted-foreground">{weekTotal} in total</span>
          </CardHeader>
          <CardContent>
            {weekTotal === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No check-ins in the last 7 days. They appear here as members scan in.
              </p>
            ) : (
              <ol className="flex h-48 items-end gap-3" aria-label="Check-ins per day">
                {attendance.daily.map((d) => (
                  <li key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-sm font-semibold tabular-nums">{d.granted}</span>
                    <div
                      className="w-full rounded-t-md bg-primary"
                      style={{ height: `${Math.max(2, (d.granted / peak) * 100)}%` }}
                      aria-hidden
                    />
                    <span className="text-sm text-muted-foreground">{weekday.format(new Date(d.day))}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/check-in" className={buttonClasses("primary", "lg", "justify-start")}>
              <ScanLine size={18} aria-hidden /> Check a member in
            </Link>
            <Link href="/members" className={buttonClasses("secondary", "lg", "justify-start")}>
              <Users size={18} aria-hidden /> Add or find a member
            </Link>
            <Link href="/inbox" className={buttonClasses("secondary", "lg", "justify-start")}>
              <MessageSquare size={18} aria-hidden /> Message members
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
