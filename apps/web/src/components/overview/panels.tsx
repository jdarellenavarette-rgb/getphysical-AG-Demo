import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleCheck, Minus, TriangleAlert } from "lucide-react";
import type { AtRiskMember, AttentionItem, CommandCenter, RangeId } from "../../lib/data/command-center";
import { RANGES } from "../../lib/data/command-center";
import { formatPeso } from "../../lib/format";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { buttonClasses } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

/** Time-frame selector. Plain links, so the choice is bookmarkable and works without JavaScript. */
export function RangeTabs({ active }: { active: RangeId }) {
  return (
    <nav aria-label="Time frame" className="inline-flex rounded-xl border border-border bg-card p-1 shadow-sm">
      {RANGES.map((range) => (
        <Link
          key={range.id}
          href={range.id === "7d" ? "/" : `/?range=${range.id}`}
          aria-current={range.id === active ? "page" : undefined}
          className={cn(
            "flex h-9 items-center rounded-lg px-3 text-sm font-semibold transition-colors",
            range.id === active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {range.label}
        </Link>
      ))}
    </nav>
  );
}

/** Change against the previous period of the same length. */
export function Delta({ current, previous, label }: { current: number; previous: number; label: string }) {
  if (previous === 0 && current === 0)
    return <span className="text-sm text-muted-foreground">No activity in either period</span>;
  if (previous === 0) return <span className="text-sm text-muted-foreground">Nothing in the {label} to compare</span>;
  const change = Math.round(((current - previous) / previous) * 100);
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-semibold",
        change > 0 ? "text-success" : change < 0 ? "text-danger" : "text-muted-foreground",
      )}
    >
      <Icon size={16} aria-hidden />
      {change > 0 ? "+" : ""}
      {change}% <span className="font-normal text-muted-foreground">vs the {label}</span>
    </span>
  );
}

export function Kpi({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums">{value}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

/** Joined − lapsed − cancelled = net growth, for the chosen time frame. */
const MIX = [
  { key: "ACTIVE", label: "Active", bar: "bg-success" },
  { key: "LAPSED", label: "Lapsed", bar: "bg-warning" },
  { key: "NO_PASS", label: "No pass", bar: "bg-foreground/30" },
  { key: "CANCELLED", label: "Cancelled", bar: "bg-danger" },
] as const;

/** Where everyone on the venue's list stands today. */
function MemberMix({ counts, usesPasses }: { counts: CommandCenter["counts"]; usesPasses: boolean }) {
  const parts = MIX.filter((part) => usesPasses || part.key === "ACTIVE" || part.key === "CANCELLED");
  const total = parts.reduce((sum, part) => sum + counts[part.key], 0);
  if (total === 0) return null;
  return (
    <div className="mt-7 border-t border-border pt-5">
      <p className="mb-3 text-sm font-medium text-muted-foreground">Everyone on your list today</p>
      <div
        className="flex h-3 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={parts.map((p) => `${counts[p.key]} ${p.label.toLowerCase()}`).join(", ")}
      >
        {parts.map((part) => (
          <div key={part.key} className={part.bar} style={{ width: `${(counts[part.key] / total) * 100}%` }} />
        ))}
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {parts.map((part) => (
          <div key={part.key} className="flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full", part.bar)} aria-hidden />
            <dt className="text-sm text-muted-foreground">{part.label}</dt>
            <dd className="text-sm font-semibold tabular-nums">{counts[part.key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function GrowthEquation({
  growth,
  counts,
  usesPasses,
}: {
  growth: CommandCenter["growth"];
  counts: CommandCenter["counts"];
  usesPasses: boolean;
}) {
  const terms = [
    { label: "Joined", value: growth.joined, sign: "+", tone: "text-success" },
    ...(usesPasses ? [{ label: "Lapsed", value: growth.lapsed, sign: "−", tone: "text-warning" }] : []),
    { label: "Cancelled", value: growth.cancelled, sign: "−", tone: "text-danger" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Member growth</CardTitle>
        <span className="text-sm text-muted-foreground">Joined, minus those you lost</span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end gap-x-5 gap-y-4">
          {terms.map((term) => (
            <div key={term.label}>
              <p className={cn("text-3xl font-bold tabular-nums", term.tone)}>
                {term.sign}
                {term.value}
              </p>
              <p className="text-sm text-muted-foreground">{term.label}</p>
            </div>
          ))}
          <p className="pb-6 text-2xl font-bold text-muted-foreground" aria-hidden>
            =
          </p>
          <div className="rounded-xl bg-muted px-4 py-2">
            <p className="text-4xl font-bold tracking-tight tabular-nums">
              {growth.net > 0 ? "+" : growth.net < 0 ? "−" : ""}
              {Math.abs(growth.net)}
            </p>
            <p className="text-sm text-muted-foreground">Net change</p>
          </div>
        </div>
        <MemberMix counts={counts} usesPasses={usesPasses} />
      </CardContent>
    </Card>
  );
}

export function AttentionQueue({ items }: { items: AttentionItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs attention</CardTitle>
        {items.length > 0 && <Badge tone="danger">{items.length}</Badge>}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex items-center gap-3 py-6 text-success">
            <CircleCheck size={28} aria-hidden />
            <div>
              <p className="font-semibold">All clear</p>
              <p className="text-sm text-muted-foreground">Nothing needs your attention right now.</p>
            </div>
          </div>
        ) : (
          <ul className="grid gap-3">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                <TriangleAlert
                  size={20}
                  aria-hidden
                  className={cn("shrink-0", item.tone === "danger" ? "text-danger" : "text-warning")}
                />
                <div className="min-w-40 flex-1">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <Link href={item.href} className={buttonClasses("secondary", "sm")}>
                  {item.action}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

const RISK_TONES = { EXPIRING: "warning", ABSENT: "neutral", LAPSED: "danger" } as const;
const RISK_LABELS = { EXPIRING: "Ending soon", ABSENT: "Not visiting", LAPSED: "Lapsed" } as const;

/** Members likely to leave, or who just did, with the reason. */
export function AtRiskCard({ members, lapsedCount }: { members: AtRiskMember[]; lapsedCount: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>At risk, worth a message</CardTitle>
        {lapsedCount > 0 && (
          <Link href="/inbox?compose=LAPSED" className={buttonClasses("primary", "sm")}>
            Message lapsed members
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="py-6 text-muted-foreground">
            Nobody is at risk right now. Passes are current and members are visiting.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((member) => (
              <li
                key={member.userId}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{member.name}</span>
                  <span className="block text-sm text-muted-foreground">{member.reason}</span>
                </span>
                <Badge tone={RISK_TONES[member.kind]}>{RISK_LABELS[member.kind]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function CheckInChart({
  series,
  total,
  title,
}: {
  series: CommandCenter["series"];
  total: number;
  title: string;
}) {
  const peak = Math.max(1, ...series.map((s) => s.value));
  const dense = series.length > 14;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-sm text-muted-foreground">{total} in total</span>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No check-ins in this period. They appear here as members scan in.
          </p>
        ) : (
          <ol
            className={cn("flex h-56 items-end", dense ? "gap-1" : "gap-3 sm:gap-4")}
            aria-label="Check-ins over time"
          >
            {series.map((point, index) => (
              <li key={index} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    dense ? "text-xs" : "text-sm",
                    point.value === 0 && "text-muted-foreground",
                  )}
                >
                  {dense && point.value === 0 ? "" : point.value}
                </span>
                <div
                  className={cn("w-full max-w-16 rounded-t-md", point.isCurrent ? "bg-primary" : "bg-foreground/15")}
                  style={{ height: `${Math.max(2, (point.value / peak) * 100)}%` }}
                  title={`${point.label}: ${point.value}`}
                />
                <span
                  className={cn(
                    "truncate text-muted-foreground",
                    dense ? "text-xs" : "text-sm",
                    dense && index % 3 !== 0 && "invisible",
                  )}
                >
                  {point.label}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

/** Entries on paid passes versus passes granted free at the desk. */
export function GateVsTill({ data }: { data: CommandCenter["gateVsTill"] }) {
  const total = data.paidEntries + data.freeEntries;
  const freeShare = total === 0 ? 0 : Math.round((data.freeEntries / total) * 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Door versus sales</CardTitle>
        <span className="text-sm text-muted-foreground">Who came in on a paid pass</span>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-6 text-muted-foreground">No entries in this period yet.</p>
        ) : (
          <>
            <div
              className="flex h-3 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`${100 - freeShare}% of entries were on paid passes`}
            >
              <div className="bg-success" style={{ width: `${100 - freeShare}%` }} />
              <div className="bg-warning" style={{ width: `${freeShare}%` }} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Entries on paid passes</dt>
                <dd className="text-2xl font-bold tabular-nums">{data.paidEntries}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Entries on free passes</dt>
                <dd className="text-2xl font-bold tabular-nums">{data.freeEntries}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              {data.freeEntries === 0
                ? "Everyone who came in had paid."
                : `${freeShare}% of entries were on passes granted at the desk, by ${data.freeMembers} ${data.freeMembers === 1 ? "member" : "members"}. Check these were intended.`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Busy and quiet hours over the last 30 days. Darker means more check-ins. */
export function Heatmap({ heatmap, canManage }: { heatmap: CommandCenter["heatmap"]; canManage: boolean }) {
  const label = (hour: number) => `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? "a" : "p"}`;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Busy hours, last 30 days</CardTitle>
        {canManage && heatmap.quietest && (
          <Link
            href={`/plans?suggest=offpeak&window=${encodeURIComponent(heatmap.quietest)}`}
            className={buttonClasses("secondary", "sm")}
          >
            Create an off-peak plan <ArrowRight size={14} aria-hidden />
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {heatmap.peak === 0 ? (
          <p className="py-6 text-muted-foreground">Not enough check-ins yet to show a pattern.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Busiest around <strong className="text-foreground">{heatmap.busiest}</strong>. Quietest from{" "}
              <strong className="text-foreground">{heatmap.quietest}</strong>: a good window for an off-peak price.
            </p>
            <div className="relative overflow-x-auto" role="region" aria-label="Busy hours table" tabIndex={0}>
              <table className="w-full min-w-[30rem] border-separate border-spacing-1 text-xs">
                <caption className="sr-only">Check-ins by weekday and hour over the last 30 days</caption>
                <thead>
                  <tr>
                    <td />
                    {heatmap.hours.map((hour) => (
                      <th key={hour} scope="col" className="font-medium text-muted-foreground">
                        {label(hour)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.rows.map((row) => (
                    <tr key={row.day}>
                      <th scope="row" className="pr-2 text-left font-medium text-muted-foreground">
                        {row.day}
                      </th>
                      {row.cells.map((value, i) => (
                        <td
                          key={i}
                          title={`${row.day} ${label(heatmap.hours[i]!)}: ${value}`}
                          className="h-7 rounded-md bg-muted"
                          style={
                            value > 0
                              ? {
                                  backgroundColor: `color-mix(in srgb, var(--primary) ${Math.round(18 + (value / heatmap.peak) * 82)}%, var(--muted))`,
                                }
                              : undefined
                          }
                        >
                          <span className="sr-only">{value}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function TopPlans({ money, rangeLabel }: { money: NonNullable<CommandCenter["money"]>; rangeLabel: string }) {
  const max = Math.max(1, ...money.topPlans.map((p) => p.earned));
  return (
    <Card>
      <CardHeader>
        <CardTitle>What sold</CardTitle>
        <Link
          href="/sales"
          className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
        >
          All sales <ArrowRight size={14} aria-hidden />
        </Link>
      </CardHeader>
      <CardContent>
        {money.topPlans.length === 0 ? (
          <p className="py-6 text-muted-foreground">No paid orders in the {rangeLabel.toLowerCase()} period.</p>
        ) : (
          <ul className="grid gap-4">
            {money.topPlans.map((plan) => (
              <li key={plan.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-semibold">{plan.name}</span>
                  <span className="shrink-0 tabular-nums">{formatPeso(plan.earned)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(3, (plan.earned / max) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.orders} {plan.orders === 1 ? "sale" : "sales"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
