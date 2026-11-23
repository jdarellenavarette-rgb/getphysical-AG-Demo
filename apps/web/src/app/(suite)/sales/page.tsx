import Link from "next/link";
import { Download, Receipt } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { buttonClasses } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState, Notice, PageHeader, StatCard } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { canManageFacility, requireSection } from "../../../lib/active-facility";
import { loadPayoutStatus } from "../../../lib/data/payouts";
import { loadSales, type OrderStatus } from "../../../lib/data/sales";
import { formatDateTime, formatPeso } from "../../../lib/format";

export const metadata = { title: "Sales" };

const STATUS: Record<OrderStatus, { label: string; tone: "success" | "warning" | "neutral" | "danger" }> = {
  PAID: { label: "Paid", tone: "success" },
  PENDING: { label: "Awaiting payment", tone: "warning" },
  EXPIRED: { label: "Expired", tone: "neutral" },
  FAILED: { label: "Failed", tone: "danger" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
};

export default async function SalesPage() {
  const { active } = await requireSection("sales");
  if (!canManageFacility(active.role)) {
    return (
      <>
        <PageHeader title="Sales" />
        <Notice tone="warning" role="note">
          Only the owner or an admin can see sales.
        </Notice>
      </>
    );
  }
  const [{ sales, summary }, payouts] = await Promise.all([loadSales(active.id), loadPayoutStatus(active.id, true)]);

  return (
    <>
      <PageHeader
        title="Sales"
        description={`Plans bought for ${active.name} in the Sodia app.`}
        actions={
          sales.length > 0 && (
            <a href="/sales/export" className={buttonClasses("secondary", "md")}>
              <Download size={16} aria-hidden /> Export CSV
            </a>
          )
        }
      />
      {payouts.state === "NOT_SET_UP" && (
        <div className="mb-6">
          <Notice tone="warning" role="note">
            Online payments are under construction, so there are no app sales to show yet.{" "}
            <Link href="/payouts" className="font-semibold underline">
              How payments will work
            </Link>
          </Notice>
        </div>
      )}
      {payouts.state === "TEST_MODE" && (
        <div className="mb-6">
          <Notice tone="warning" role="note">
            Payments are in test mode. These orders used the payment provider&apos;s test system; no real money moved.
          </Notice>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Earned, last 30 days"
          value={formatPeso(summary.earned30d)}
          hint="Your price, before the member's service fee"
        />
        <StatCard label="Paid orders, last 30 days" value={String(summary.paid30d)} />
        <StatCard label="Awaiting payment" value={String(summary.pending)} />
        <StatCard label="Refunded, last 30 days" value={String(summary.refunded30d)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <span className="text-sm text-muted-foreground">Newest first</span>
        </CardHeader>
        {sales.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No sales yet"
            description={
              payouts.state === "NOT_SET_UP"
                ? "Members can't buy yet because payouts aren't set up."
                : "Orders appear here as soon as a member buys one of your plans."
            }
            action={
              payouts.state === "NOT_SET_UP" ? (
                <Link href="/payouts" className={buttonClasses("primary", "md")}>
                  Set up payouts
                </Link>
              ) : (
                <Link href="/plans" className={buttonClasses("secondary", "md")}>
                  View your plans
                </Link>
              )
            }
          />
        ) : (
          <div className="pt-3">
            <Table>
              <thead>
                <tr>
                  <Th>Member</Th>
                  <Th>Plan</Th>
                  <Th>Your price</Th>
                  <Th>Member paid</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <Td>
                      <p className="font-semibold">{sale.buyerName}</p>
                      {sale.buyerHandle && <p className="text-muted-foreground">{sale.buyerHandle}</p>}
                    </Td>
                    <Td>{sale.plan}</Td>
                    <Td className="tabular-nums">{formatPeso(sale.pricePhp)}</Td>
                    <Td className="tabular-nums">{formatPeso(sale.totalPhp)}</Td>
                    <Td>
                      <Badge tone={STATUS[sale.status].tone}>{STATUS[sale.status].label}</Badge>
                    </Td>
                    <Td>{formatDateTime(sale.paidAt ?? sale.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </>
  );
}
