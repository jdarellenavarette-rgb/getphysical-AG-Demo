import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  AtRiskCard,
  AttentionQueue,
  CheckInChart,
  Delta,
  GateVsTill,
  GrowthEquation,
  Heatmap,
  Kpi,
  RangeTabs,
  TopPlans,
} from "../../components/overview/panels";
import { SetupChecklist } from "../../components/shell/SetupChecklist";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { canManageFacility, requireSuiteSession } from "../../lib/active-facility";
import { loadRecentScans } from "../../lib/data/attendance";
import { RANGES, loadCommandCenter } from "../../lib/data/command-center";
import { loadSetupProgress } from "../../lib/data/setup";
import { SUITE_TIME_ZONE, formatDateTime, formatPeso } from "../../lib/format";

export const metadata = { title: "Overview" };

const hourOf = new Intl.DateTimeFormat("en-PH", { timeZone: SUITE_TIME_ZONE, hour: "numeric", hour12: false });

function greeting(): string {
  const hour = Number(hourOf.format(new Date()));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

/** The owner's command centre: everything is computed from the venue's own members, scans and sales. */
export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await requireSuiteSession();
  const active = session.active;
  const canManage = canManageFacility(active.role);
  const params = await searchParams;
  const rangeId = RANGES.find((r) => r.id === params.range)?.id ?? "7d";

  const [center, scans, setup] = await Promise.all([
    loadCommandCenter(active.id, rangeId, canManage),
    loadRecentScans(active.id, 6),
    canManage ? loadSetupProgress(active.id) : null,
  ]);
  const usesPasses = active.registryType === "COMMERCIAL";
  const firstName = session.displayName.split(/[\s@]/)[0];
  const periodLabel = center.range.days === 1 ? "today" : `the last ${center.range.label}`;
  const previousLabel = center.range.days === 1 ? "day before" : `${center.range.label} before`;
  const capacity = center.inside.capacity;
  const fill = capacity ? Math.min(100, Math.round((center.inside.estimate / capacity) * 100)) : null;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            {active.name}, {periodLabel}.
          </p>
        </div>
        <RangeTabs active={rangeId} />
      </div>

      {setup && !setup.complete && <SetupChecklist progress={setup} venueName={active.name} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Active members" value={String(center.counts.ACTIVE)}>
          <p className="text-sm text-muted-foreground">
            {usesPasses
              ? `${center.counts.LAPSED} lapsed · ${center.counts.NO_PASS} without a pass`
              : `${center.totalMembers} on your list in total`}
          </p>
        </Kpi>
        <Kpi label={`Check-ins, ${center.range.label.toLowerCase()}`} value={String(center.checkIns.current)}>
          <Delta current={center.checkIns.current} previous={center.checkIns.previous} label={previousLabel} />
        </Kpi>
        {center.money ? (
          <Kpi label={`Earned, ${center.range.label.toLowerCase()}`} value={formatPeso(center.money.earned)}>
            <Delta current={center.money.earned} previous={center.money.previousEarned} label={previousLabel} />
          </Kpi>
        ) : (
          <Kpi label={`Turned away, ${center.range.label.toLowerCase()}`} value={String(center.denied)} />
        )}
        <Kpi
          label="Inside now (estimate)"
          value={capacity ? `${center.inside.estimate} / ${capacity}` : String(center.inside.estimate)}
        >
          {fill !== null && (
            <div className="h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${fill}% of capacity`}>
              <div
                className={fill >= 85 ? "h-full bg-danger" : "h-full bg-success"}
                style={{ width: `${Math.max(2, fill)}%` }}
              />
            </div>
          )}
          <p className="mt-2 text-sm text-muted-foreground">Entries in the last 2 hours; exits aren&apos;t recorded</p>
        </Kpi>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AttentionQueue items={center.attention} />
        <GrowthEquation growth={center.growth} counts={center.counts} usesPasses={usesPasses} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <CheckInChart
            series={center.series}
            total={center.checkIns.current}
            title={center.range.days === 1 ? "Check-ins today, by hour" : `Check-ins, last ${center.range.label}`}
          />
        </div>
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
              <p className="py-8 text-center text-muted-foreground">No scans yet.</p>
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

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className={usesPasses ? "min-w-0 xl:col-span-2" : "min-w-0 xl:col-span-3"}>
          <Heatmap heatmap={center.heatmap} canManage={canManage} />
        </div>
        {usesPasses && <GateVsTill data={center.gateVsTill} />}
      </div>

      {(usesPasses || center.money) && (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {usesPasses && <AtRiskCard members={center.atRisk} lapsedCount={center.counts.LAPSED} />}
          {center.money && <TopPlans money={center.money} rangeLabel={center.range.label} />}
        </div>
      )}
    </>
  );
}
