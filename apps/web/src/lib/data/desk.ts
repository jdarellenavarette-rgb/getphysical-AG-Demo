import "server-only";
import { createServerSupabase } from "../supabase/server";

export type DeskKind = "BOOKING" | "CLASS" | "PACK" | "EVENT" | "OTHER";
export type DeskMethod = "CASH" | "EWALLET" | "CARD" | "BANK" | "OTHER";

export const DESK_KIND_LABELS: Record<DeskKind, string> = {
  BOOKING: "Court booking",
  CLASS: "Class",
  PACK: "Session pack",
  EVENT: "Event entry",
  OTHER: "Other",
};
export const DESK_METHOD_LABELS: Record<DeskMethod, string> = {
  CASH: "Cash",
  EWALLET: "E-wallet",
  CARD: "Card",
  BANK: "Bank transfer",
  OTHER: "Other",
};

/** Key for "what was paid for": the thing, and for an event, whose entry. */
export function paidKey(refId: string, userId?: string | null): string {
  return `${refId}:${userId ?? ""}`;
}

/** What has been paid at the desk for each thing of one kind, net of reversals. */
export async function loadDeskPaid(facilityId: string, kind: DeskKind): Promise<Map<string, number>> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("desk_paid", { p_facility_id: facilityId, p_kind: kind });
  if (error) throw new Error("Could not load payments.", { cause: error });
  return new Map((data ?? []).map((row) => [paidKey(row.ref_id, row.user_id), Number(row.paid_php)]));
}

export interface DeskPayment {
  id: string;
  amount: number;
  method: DeskMethod;
  kind: DeskKind;
  payerName: string | null;
  note: string | null;
  createdAt: string;
  isReversal: boolean;
  /** A later entry cancels this one out. */
  reversed: boolean;
}

export interface DeskLedger {
  payments: DeskPayment[];
  /** Net money taken at the desk in the last 30 days. */
  total30d: number;
  byKind30d: { kind: DeskKind; total: number }[];
}

/** The business's own record of money it took in person. */
export async function loadDeskLedger(facilityId: string): Promise<DeskLedger> {
  const supabase = await createServerSupabase();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("desk_payments")
    .select("id, amount_php, method, kind, payer_name, note, created_at, reverses")
    .eq("facility_id", facilityId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("Could not load desk payments.", { cause: error });

  const rows = data ?? [];
  const reversedIds = new Set(rows.flatMap((row) => (row.reverses ? [row.reverses] : [])));
  const totals = new Map<DeskKind, number>();
  for (const row of rows) {
    const kind = row.kind as DeskKind;
    totals.set(kind, (totals.get(kind) ?? 0) + Number(row.amount_php));
  }
  return {
    payments: rows.slice(0, 60).map((row) => ({
      id: row.id,
      amount: Number(row.amount_php),
      method: row.method as DeskMethod,
      kind: row.kind as DeskKind,
      payerName: row.payer_name,
      note: row.note,
      createdAt: row.created_at,
      isReversal: row.reverses !== null,
      reversed: reversedIds.has(row.id),
    })),
    total30d: [...totals.values()].reduce((sum, value) => sum + value, 0),
    byKind30d: [...totals.entries()].map(([kind, total]) => ({ kind, total })).filter((entry) => entry.total !== 0),
  };
}
