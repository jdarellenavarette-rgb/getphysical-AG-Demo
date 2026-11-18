import Link from "next/link";
import { ArrowRight, MessageSquare, ScanLine, Tags, Users } from "lucide-react";
import { SetupChecklist } from "../../components/shell/SetupChecklist";
import { Badge } from "../../components/ui/badge";
import { buttonClasses } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { PageHeader, StatCard } from "../../components/ui/states";
import { canManageFacility, requireSuiteSession } from "../../lib/active-facility";
import { loadAttendanceSummary, loadRecentScans } from "../../lib/data/attendance";
import { loadMembers } from "../../lib/data/members";
import { loadSetupProgress } from "../../lib/data/setup";
import { SUITE_TIME_ZONE, formatDateTime } from "../../lib/format";

export const metadata = { title: "Overview" };

const weekday = new Intl.DateTimeFormat("en-PH", { timeZone: SUITE_TIME_ZONE, weekday: "short" });
const hourOf = new Intl.DateTimeFormat("en-PH", { timeZone: SUITE_TIME_ZONE, hour: "numeric", hour12: false });

function greeting(): string {
  const hour = Number(hourOf.format(new Date()));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default async function OverviewPage() {
  const session = await requireSuiteSession();
  const active = session.active;
  const canManage = canManageFacility(active.role);
  const [attendance, members, scans, setup] = await Promise.all([
    loadAttendanceSummary(active.id),
    loadMembers(active.id, { standing: "ALL" }),
    loadRecentScans(active.id, 6),
    canManage ? loadSetupProgress(active.id) : null,
  ]);
  const peak = Math.max(1, ...attendance.daily.map((d) => d.granted));
  const weekTotal = attendance.daily.reduce((sum, d) => sum + d.granted, 0);
  const usesPasses = active.registryType === "COMMERCIAL";
  const firstName = session.displayName.split(/[\s@]/)[0];

  return (
    <>
      <PageHeader title={`${greeting()}, ${firstName}`} description={`Here's how ${active.name} is doing today.`} />

      {setup && !setup.complete && <SetupChecklist progress={setup} venueName={active.name} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active members"
          value={String(members.counts.ACTIVE)}
          hint={
            usesPasses
              ? `${members.counts.LAPSED} lapsed · ${members.counts.NO_PASS} without a pass`
              : `${members.total} on your list in total`
          }
        />
        <StatCard label="Check-ins today" value={String(attendance.grantedToday)} />
        <StatCard
          label="Entered in the last 2 hours"
          value={String(attendance.lastTwoHours)}
          hint="An estimate of who is inside; exits aren't recorded"
        />
        <StatCard label="Denied at the door today" value={String(attendance.deniedToday)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Check-ins, last 7 days</CardTitle>
            <span className="text-sm text-muted-foreground">{weekTotal} in total</span>
          </CardHeader>
          <CardContent>
            {weekTotal === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                No check-ins in the last 7 days. They appear here as members scan in.
              </p>
            ) : (
              <ol className="flex h-56 items-end gap-3 sm:gap-5" aria-label="Check-ins per day">
                {attendance.daily.map((d, index) => (
                  <li key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-sm font-semibold tabular-nums">{d.granted}</span>
                    <div
                      className={`w-full max-w-16 rounded-t-lg ${index === attendance.daily.length - 1 ? "bg-primary" : "bg-foreground/15"}`}
                      style={{ height: `${Math.max(3, (d.granted / peak) * 100)}%` }}
                      aria-hidden
                    />
                    <span className="text-sm text-muted-foreground">
                      {index === attendance.daily.length - 1 ? "Today" : weekday.format(new Date(d.day))}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest at the door</CardTitle>
            <Link
              href="/check-in"
              className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Open check-in <ArrowRight size={14} aria-hidden />
            </Link>
          </CardHeader>
          <CardContent>
            {scans.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No scans yet today.</p>
            ) : (
              <ul className="grid gap-3">
                {scans.map((scan) => (
                  <li key={scan.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{scan.memberName}</span>
                      <span className="block text-sm text-muted-foreground">{formatDateTime(scan.at)}</span>
                    </span>
                    <Badge tone={scan.granted ? "success" : "danger"}>{scan.granted ? "Allowed" : "Denied"}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { href: "/check-in", icon: ScanLine, title: "Check a member in", text: "Scan a membership card" },
          { href: "/members", icon: Users, title: "Members", text: "Add, find and manage" },
          { href: "/inbox", icon: MessageSquare, title: "Message members", text: "Reply or send a broadcast" },
          ...(canManage
            ? [{ href: "/plans", icon: Tags, title: "Plans and prices", text: "Decide what you sell" }]
            : []),
        ].map(({ href, icon: Icon, title, text }) => (
          <Link
            key={href}
            href={href}
            className={buttonClasses(
              "secondary",
              "lg",
              "h-auto justify-start gap-4 rounded-2xl p-5 text-left whitespace-normal shadow-sm",
            )}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Icon size={20} aria-hidden />
            </span>
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="block text-sm font-normal text-muted-foreground">{text}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
