import { calculateHybridServiceFee, type FacilityRow, type FeeBreakdown, type PassRow } from "sodia-core";

/** What was bought for a pass, kept so receipts show the real amounts. */
export interface PassPurchase {
  baseAmountPhp: number;
  billingKind: "one_time_pass" | "recurring_subscription";
  facilityName: string;
  /** True when no payment was taken (signed-out product preview). */
  isPreview: boolean;
}

export function formatPhp(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function passVenueName(
  pass: PassRow,
  facilities: readonly FacilityRow[],
  purchase: PassPurchase | undefined,
  /** Names read with the member's passes, keyed by facility id. */
  venueNames: Readonly<Record<string, string>> = {},
): string {
  return (
    purchase?.facilityName ??
    (pass.facility_id ? venueNames[pass.facility_id] : undefined) ??
    facilities.find((f) => f.id === pass.facility_id)?.name ??
    "Venue"
  );
}

/** A pass the venue gave at the front desk, without an app purchase. */
export function isComplimentaryPass(pass: PassRow): boolean {
  return pass.pass_type === "COMP_PASS" || pass.sku_id === "COMP_PASS";
}

/** What the pass is called in the wallet: the plan's name, or "Pass from <venue>" when the venue gave it. */
export function passTitle(pass: PassRow, venueName: string): string {
  return isComplimentaryPass(pass) ? `Pass from ${venueName}` : pass.pass_type;
}

/** "Valid until 19 Nov 2026" while the pass works, "Ended 19 Nov 2026" afterwards. */
export function passExpiryLabel(pass: PassRow, now: number = Date.now()): string {
  if (!pass.valid_until) return "No end date";
  const date = new Date(pass.valid_until).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (pass.status === "ACTIVE") return isPassUsable(pass, now) ? `Valid until ${date}` : `Ended ${date}`;
  return `Was valid until ${date}`;
}

/** What the member paid, "Free" for a pass the venue gave, or a dash when the amount isn't known. */
export function passChargeLabel(pass: PassRow, purchase: PassPurchase | undefined): string {
  const charge = passCharge(purchase);
  if (charge) return formatPhp(charge.totalChargePhp);
  return isComplimentaryPass(pass) ? "Free" : "—";
}

export function passCharge(purchase: PassPurchase | undefined): FeeBreakdown | null {
  return purchase ? calculateHybridServiceFee(purchase.baseAmountPhp, purchase.billingKind) : null;
}

/** A pass opens a gate only while it is active and inside its validity window. */
export function isPassUsable(pass: PassRow, now: number = Date.now()): boolean {
  if (pass.status !== "ACTIVE") return false;
  return !pass.valid_until || new Date(pass.valid_until).getTime() > now;
}

export function passStatusLabel(pass: PassRow, now: number = Date.now()): string {
  if (pass.status !== "ACTIVE") return pass.status;
  return isPassUsable(pass, now) ? "ACTIVE" : "EXPIRED";
}

export function isCourtPass(pass: PassRow): boolean {
  return (pass.sku_id ?? "").includes("court") || /court/i.test(pass.pass_type ?? "");
}

/** Day passes end at midnight tonight; memberships run for 30 days. */
export function passExpiry(billingKind: PassPurchase["billingKind"], from: Date = new Date()): string {
  if (billingKind === "recurring_subscription") return new Date(from.getTime() + 30 * 86_400_000).toISOString();
  const endOfDay = new Date(from);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.toISOString();
}
