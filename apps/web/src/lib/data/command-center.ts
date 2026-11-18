import "server-only";
import type { MemberStanding } from "sodia-core";
import { startOfSuiteDay } from "../format";
import { createServerSupabase } from "../supabase/server";
import { loadMemberDirectory, type MemberRow } from "./members";

export const RANGES = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
] as const;
export type RangeId = (typeof RANGES)[number]["id"];

export interface AttentionItem {
  id: string;
  tone: "danger" | "warning";
  title: string;
  detail: string;
  href: string;
  action: string;
}

export interface AtRiskMember {
  userId: string;
  name: string;
  handle: string | null;
  reason: string;
  kind: "EXPIRING" | "ABSENT" | "LAPSED";
}

export interface CommandCenter {
  range: (typeof RANGES)[number];
  counts: Record<MemberStanding, number>;
  totalMembers: number;
  /** Granted check-ins in the range, and in the equally long period before it. */
  checkIns: { current: number; previous: number };
  denied: number;
  inside: { estimate: number; capacity: number | null };
  /** Members gained and lost in the range: joined − lapsed − cancelled = net. */
  growth: { joined: number; lapsed: number; cancelled: number; net: number };
  attention: AttentionItem[];
  atRisk: AtRiskMember[];
  /** Entries on passes that were paid for versus passes granted free at the desk. */
  gateVsTill: { paidEntries: number; freeEntries: number; freeMembers: number };
  /** Check-ins per bucket across the range, oldest first. */
  series: { label: string; value: number; isCurrent: boolean }[];
  /** Last 30 days of check-ins by weekday (Mon first) and hour of day. */
  heatmap: {
    hours: number[];
    rows: { day: string; cells: number[] }[];
    peak: number;
    busiest: string | null;
    quietest: string | null;
  };
  /** Owners and admins only; null for other staff. */
  money: null | {
    earned: number;
    previousEarned: number;
    orders: number;
    awaitingPayment: number;
    topPlans: { name: string; earned: number; orders: number }[];
  };
}

const DAY_MS = 86_400_000;
const MANILA_OFFSET_MS = 8 * 3_600_000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_HOURS = Array.from({ length: 18 }, (_, i) => i + 5); // 5 AM to 10 PM

/** Manila wall-clock parts of an instant (Manila has no daylight saving). */
function manilaParts(ms: number): { weekday: number; hour: number; dayKey: string } {
  const shifted = new Date(ms + MANILA_OFFSET_MS);
  return {
    weekday: (shifted.getUTCDay() + 6) % 7,
    hour: shifted.getUTCHours(),
    dayKey: shifted.toISOString().slice(0, 10),
  };
}

function hourLabel(hour: number): string {
  return `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? "AM" : "PM"}`;
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function buildAtRisk(members: MemberRow[], now: number): AtRiskMember[] {
  const risks: AtRiskMember[] = [];
  for (const m of members) {
    const until = m.passValidUntil ? new Date(m.passValidUntil).getTime() : null;
    const lastVisit = m.lastVisitAt ? new Date(m.lastVisitAt).getTime() : null;
    const ended = m.lastPassEndedAt ? new Date(m.lastPassEndedAt).getTime() : null;
    const base = { userId: m.userId, name: m.name, handle: m.handle };
    if (m.standing === "ACTIVE" && until !== null && until - now < 7 * DAY_MS) {
      const days = Math.max(0, Math.ceil((until - now) / DAY_MS));
      risks.push({
        ...base,
        kind: "EXPIRING",
        reason: days <= 1 ? "Pass ends today or tomorrow" : `Pass ends in ${days} days`,
      });
    } else if (m.standing === "ACTIVE" && until !== null && (lastVisit === null || now - lastVisit > 14 * DAY_MS)) {
      risks.push({
        ...base,
        kind: "ABSENT",
        reason:
          lastVisit === null
            ? "Has a pass but has never checked in"
            : `No check-in for ${Math.floor((now - lastVisit) / DAY_MS)} days`,
      });
    } else if (m.standing === "LAPSED" && ended !== null && now - ended < 30 * DAY_MS) {
      risks.push({
        ...base,
        kind: "LAPSED",
        reason: `Pass ended ${Math.max(1, Math.floor((now - ended) / DAY_MS))} days ago`,
      });
    }
  }
  const order = { EXPIRING: 0, ABSENT: 1, LAPSED: 2 } as const;
  return risks.sort((a, b) => order[a.kind] - order[b.kind]);
}

/**
 * Everything the owner's Overview shows, computed from the venue's own members,
 * scans, passes and orders. Money figures are only loaded for owners and admins.
 */
export async function loadCommandCenter(
  facilityId: string,
  rangeId: RangeId,
  canManage: boolean,
): Promise<CommandCenter> {
  const range = RANGES.find((r) => r.id === rangeId) ?? RANGES[1];
  const supabase = await createServerSupabase();
  const now = Date.now();
  const rangeStart = startOfSuiteDay(range.days - 1).getTime();
  const previousStart = rangeStart - range.days * DAY_MS;
  const scanStart = Math.min(previousStart, startOfSuiteDay(29).getTime());

  const [members, scans, passes, cancelled, venue, threads, orders, payout, mode] = await Promise.all([
    loadMemberDirectory(facilityId),
    supabase
      .from("access_scans")
      .select("created_at, status, pass_id, user_id")
      .eq("facility_id", facilityId)
      .gte("created_at", new Date(scanStart).toISOString())
      .order("created_at", { ascending: false })
      .limit(10000),
    supabase.from("passes").select("id, sku_id").eq("facility_id", facilityId).limit(10000),
    supabase
      .from("facility_memberships")
      .select("user_id, updated_at")
      .eq("facility_id", facilityId)
      .eq("status", "CANCELLED")
      .gte("updated_at", new Date(rangeStart).toISOString()),
    supabase.from("facilities").select("max_capacity").eq("id", facilityId).single(),
    supabase
      .from("conversations")
      .select("id, last_message_at")
      .eq("kind", "FACILITY")
      .eq("facility_id", facilityId)
      .order("last_message_at", { ascending: false })
      .limit(50),
    canManage
      ? supabase
          .from("payment_orders")
          .select("product_name, sku, base_amount_php, status, paid_at, created_at")
          .eq("facility_id", facilityId)
          .gte("created_at", new Date(previousStart).toISOString())
          .limit(10000)
      : null,
    canManage
      ? supabase
          .from("facility_payout_accounts")
          .select("charges_enabled, is_sandbox")
          .eq("facility_id", facilityId)
          .maybeSingle()
      : null,
    canManage ? supabase.rpc("payments_mode") : null,
  ]);
  const failed =
    scans.error ??
    passes.error ??
    cancelled.error ??
    venue.error ??
    threads.error ??
    orders?.error ??
    payout?.error ??
    mode?.error;
  if (failed) throw new Error("Could not load the overview.", { cause: failed });

  // Who wrote last in each recent thread: a member means the venue owes a reply.
  const threadIds = (threads.data ?? []).map((t) => t.id);
  const { data: lastMessages, error: messageError } = threadIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id, sender_kind, created_at")
        .in("conversation_id", threadIds)
        .order("created_at", { ascending: false })
        .limit(400)
    : { data: [], error: null };
  if (messageError) throw new Error("Could not load the overview.", { cause: messageError });
  const lastSender = new Map<string, string>();
  for (const m of lastMessages ?? [])
    if (!lastSender.has(m.conversation_id)) lastSender.set(m.conversation_id, m.sender_kind);
  const waitingThreads = [...lastSender.values()].filter((kind) => kind === "USER").length;

  const counts: Record<MemberStanding, number> = { ACTIVE: 0, LAPSED: 0, NO_PASS: 0, PENDING: 0, CANCELLED: 0 };
  for (const m of members) counts[m.standing] += 1;

  const scanRows = (scans.data ?? []).map((s) => ({ ...s, at: new Date(s.created_at ?? 0).getTime() }));
  const granted = scanRows.filter((s) => s.status === "GRANTED");
  const inRange = (at: number) => at >= rangeStart;
  const current = granted.filter((s) => inRange(s.at));
  const previous = granted.filter((s) => s.at >= previousStart && s.at < rangeStart);
  const denied = scanRows.filter((s) => s.status === "DENIED" && inRange(s.at)).length;
  const todayStart = startOfSuiteDay(0).getTime();
  const deniedToday = scanRows.filter((s) => s.status === "DENIED" && s.at >= todayStart).length;

  // Entries on passes granted free at the desk versus passes that were paid for.
  const freePassIds = new Set((passes.data ?? []).filter((p) => p.sku_id === "COMP_PASS").map((p) => p.id));
  const freeEntries = current.filter((s) => s.pass_id && freePassIds.has(s.pass_id));
  const gateVsTill = {
    paidEntries: current.length - freeEntries.length,
    freeEntries: freeEntries.length,
    freeMembers: new Set(freeEntries.map((s) => s.user_id)).size,
  };

  const joined = members.filter((m) => m.joinedAt && new Date(m.joinedAt).getTime() >= rangeStart).length;
  const lapsed = members.filter(
    (m) => m.standing === "LAPSED" && m.lastPassEndedAt && new Date(m.lastPassEndedAt).getTime() >= rangeStart,
  ).length;
  const cancelledCount = cancelled.data?.length ?? 0;

  // Chart buckets: hours for today, days up to 30 days, weeks beyond.
  let series: CommandCenter["series"];
  if (range.days === 1) {
    const nowHour = manilaParts(now).hour;
    series = HEATMAP_HOURS.map((hour) => ({
      label: hourLabel(hour),
      value: current.filter((s) => manilaParts(s.at).hour === hour).length,
      isCurrent: hour === nowHour,
    }));
  } else if (range.days <= 30) {
    series = Array.from({ length: range.days }, (_, i) => {
      const start = rangeStart + i * DAY_MS;
      const date = new Date(start + MANILA_OFFSET_MS);
      return {
        label: range.days === 7 ? WEEKDAYS[(date.getUTCDay() + 6) % 7]! : String(date.getUTCDate()),
        value: current.filter((s) => s.at >= start && s.at < start + DAY_MS).length,
        isCurrent: i === range.days - 1,
      };
    });
  } else {
    const weeks = Math.ceil(range.days / 7);
    series = Array.from({ length: weeks }, (_, i) => {
      const start = rangeStart + i * 7 * DAY_MS;
      const date = new Date(start + MANILA_OFFSET_MS);
      return {
        label: `${date.getUTCMonth() + 1}/${date.getUTCDate()}`,
        value: current.filter((s) => s.at >= start && s.at < start + 7 * DAY_MS).length,
        isCurrent: i === weeks - 1,
      };
    });
  }

  // Heatmap: always the last 30 days, so it stays meaningful whatever range is chosen.
  const heatStart = startOfSuiteDay(29).getTime();
  const grid = WEEKDAYS.map(() => HEATMAP_HOURS.map(() => 0));
  for (const s of granted) {
    if (s.at < heatStart) continue;
    const { weekday, hour } = manilaParts(s.at);
    const column = HEATMAP_HOURS.indexOf(hour);
    if (column >= 0) grid[weekday]![column]! += 1;
  }
  const flat = grid.flatMap((row, day) => row.map((value, column) => ({ value, day, hour: HEATMAP_HOURS[column]! })));
  const peak = Math.max(0, ...flat.map((c) => c.value));
  const hourTotals = HEATMAP_HOURS.map((hour, column) => ({
    hour,
    total: grid.reduce((sum, row) => sum + row[column]!, 0),
  }));
  const busiestHour = [...hourTotals].sort((a, b) => b.total - a.total)[0];
  // Quietest two-hour stretch inside normal daytime hours.
  const windows = hourTotals.slice(1, -2).map((h, i) => ({ hour: h.hour, total: h.total + hourTotals[i + 2]!.total }));
  const quietWindow = [...windows].sort((a, b) => a.total - b.total)[0];

  const attention: AttentionItem[] = [];
  if (canManage && !(payout?.data?.charges_enabled && (!payout.data.is_sandbox || mode?.data === "sandbox"))) {
    attention.push({
      id: "payouts",
      tone: "danger",
      title: "Members can't buy yet",
      detail: "Payouts aren't set up, so your plans can't be bought.",
      href: "/payouts",
      action: "Set up payouts",
    });
  }
  if (waitingThreads > 0) {
    attention.push({
      id: "inbox",
      tone: "danger",
      title: `${plural(waitingThreads, "member is", "members are")} waiting for a reply`,
      detail: "They wrote last in their conversation with you.",
      href: "/inbox",
      action: "Open inbox",
    });
  }
  if (deniedToday > 0) {
    attention.push({
      id: "denied",
      tone: "warning",
      title: `${plural(deniedToday, "person was", "people were")} turned away at the door today`,
      detail: "Usually an ended pass. A renewal reminder often brings them back.",
      href: "/check-in",
      action: "See scans",
    });
  }
  const atRisk = buildAtRisk(members, now);
  const expiring = atRisk.filter((r) => r.kind === "EXPIRING").length;
  if (expiring > 0) {
    attention.push({
      id: "expiring",
      tone: "warning",
      title: `${plural(expiring, "pass ends", "passes end")} within 7 days`,
      detail: "Remind them to renew before they lapse.",
      href: "/members?standing=ACTIVE",
      action: "View members",
    });
  }
  if (counts.NO_PASS > 0) {
    attention.push({
      id: "nopass",
      tone: "warning",
      title: `${plural(counts.NO_PASS, "member has", "members have")} no pass`,
      detail: "They are on your list but can't check in.",
      href: "/members?standing=NO_PASS",
      action: "Grant or sell a pass",
    });
  }

  let money: CommandCenter["money"] = null;
  if (canManage && orders) {
    const rows = (orders.data ?? []).map((o) => ({ ...o, at: new Date(o.paid_at ?? o.created_at ?? 0).getTime() }));
    const paid = rows.filter((o) => o.status === "PAID");
    const paidNow = paid.filter((o) => inRange(o.at));
    const byPlan = new Map<string, { earned: number; orders: number }>();
    for (const o of paidNow) {
      const name = o.product_name ?? (o.sku === "MONTHLY" ? "Monthly membership" : "Day pass");
      const entry = byPlan.get(name) ?? { earned: 0, orders: 0 };
      byPlan.set(name, { earned: entry.earned + o.base_amount_php, orders: entry.orders + 1 });
    }
    money = {
      earned: paidNow.reduce((sum, o) => sum + o.base_amount_php, 0),
      previousEarned: paid
        .filter((o) => o.at >= previousStart && o.at < rangeStart)
        .reduce((sum, o) => sum + o.base_amount_php, 0),
      orders: paidNow.length,
      awaitingPayment: rows.filter((o) => o.status === "PENDING").length,
      topPlans: [...byPlan.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.earned - a.earned)
        .slice(0, 5),
    };
  }

  return {
    range,
    counts,
    totalMembers: members.length,
    checkIns: { current: current.length, previous: previous.length },
    denied,
    inside: {
      estimate: granted.filter((s) => s.at >= now - 2 * 3_600_000).length,
      capacity: venue.data?.max_capacity ?? null,
    },
    growth: { joined, lapsed, cancelled: cancelledCount, net: joined - lapsed - cancelledCount },
    attention,
    atRisk: atRisk.slice(0, 8),
    gateVsTill,
    series,
    heatmap: {
      hours: HEATMAP_HOURS,
      rows: WEEKDAYS.map((day, i) => ({ day, cells: grid[i]! })),
      peak,
      busiest: peak > 0 && busiestHour ? hourLabel(busiestHour.hour) : null,
      quietest: peak > 0 && quietWindow ? `${hourLabel(quietWindow.hour)} to ${hourLabel(quietWindow.hour + 2)}` : null,
    },
    money,
  };
}
