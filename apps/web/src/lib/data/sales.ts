import "server-only";
import { startOfSuiteDay } from "../format";
import { createServerSupabase } from "../supabase/server";

export type OrderStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED" | "REFUNDED";

export interface SaleRow {
  id: string;
  buyerName: string;
  buyerHandle: string | null;
  plan: string;
  /** What the venue receives. */
  pricePhp: number;
  serviceFeePhp: number;
  /** What the member paid. */
  totalPhp: number;
  status: OrderStatus;
  provider: string;
  createdAt: string | null;
  paidAt: string | null;
}

export interface SalesSummary {
  /** Venue earnings (your price, before the member's service fee) from paid orders in the last 30 days. */
  earned30d: number;
  paid30d: number;
  pending: number;
  refunded30d: number;
}

const LEGACY_PLAN_NAMES: Record<string, string> = { DAY_PASS: "Day pass", MONTHLY: "Monthly membership" };

/** Orders placed for this venue, newest first. Owners and admins only (RLS returns nothing to other staff). */
export async function loadSales(facilityId: string, limit = 200): Promise<{ sales: SaleRow[]; summary: SalesSummary }> {
  const supabase = await createServerSupabase();
  const { data: orders, error } = await supabase
    .from("payment_orders")
    .select(
      "id, user_id, product_name, sku, base_amount_php, service_fee_php, total_php, status, provider, created_at, paid_at",
    )
    .eq("facility_id", facilityId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Could not load sales.", { cause: error });

  const buyerIds = [...new Set(orders.map((o) => o.user_id))];
  const { data: profiles, error: profileError } = buyerIds.length
    ? await supabase.from("profiles").select("id, name, username").in("id", buyerIds)
    : { data: [], error: null };
  if (profileError) throw new Error("Could not load sales.", { cause: profileError });
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const sales: SaleRow[] = orders.map((order) => {
    const buyer = profileById.get(order.user_id);
    return {
      id: order.id,
      buyerName: buyer?.name || buyer?.username || "Member",
      buyerHandle: buyer?.username ? `@${buyer.username}` : null,
      plan: order.product_name ?? LEGACY_PLAN_NAMES[order.sku] ?? order.sku,
      pricePhp: order.base_amount_php,
      serviceFeePhp: order.service_fee_php,
      totalPhp: order.total_php,
      status: order.status,
      provider: order.provider,
      createdAt: order.created_at,
      paidAt: order.paid_at,
    };
  });

  const since = startOfSuiteDay(30).getTime();
  const recent = sales.filter((s) => new Date(s.paidAt ?? s.createdAt ?? 0).getTime() >= since);
  return {
    sales,
    summary: {
      earned30d: recent.filter((s) => s.status === "PAID").reduce((sum, s) => sum + s.pricePhp, 0),
      paid30d: recent.filter((s) => s.status === "PAID").length,
      pending: sales.filter((s) => s.status === "PENDING").length,
      refunded30d: recent.filter((s) => s.status === "REFUNDED").length,
    },
  };
}
