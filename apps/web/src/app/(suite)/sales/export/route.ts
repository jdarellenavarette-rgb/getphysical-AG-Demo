import { canManageFacility, requireSuiteSession } from "../../../../lib/active-facility";
import { loadSales } from "../../../../lib/data/sales";

export const dynamic = "force-dynamic";

/** Quote a CSV cell; also neutralise values a spreadsheet would run as a formula. */
function cell(value: string | number | null): string {
  const text = value == null ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

/** Download this venue's orders as CSV. A read-only export, limited to owners and admins. */
export async function GET() {
  const { active } = await requireSuiteSession();
  if (!canManageFacility(active.role))
    return new Response("Only the owner or an admin can export sales.", { status: 403 });
  const { sales } = await loadSales(active.id, 5000);
  const header = [
    "Order",
    "Date",
    "Member",
    "Username",
    "Plan",
    "Your price (PHP)",
    "Service fee (PHP)",
    "Member paid (PHP)",
    "Status",
    "Provider",
    "Paid at",
  ];
  const lines = sales.map((s) =>
    [
      s.id,
      s.createdAt,
      s.buyerName,
      s.buyerHandle,
      s.plan,
      s.pricePhp,
      s.serviceFeePhp,
      s.totalPhp,
      s.status,
      s.provider,
      s.paidAt,
    ]
      .map(cell)
      .join(","),
  );
  const csv = [header.map(cell).join(","), ...lines].join("\r\n");
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
