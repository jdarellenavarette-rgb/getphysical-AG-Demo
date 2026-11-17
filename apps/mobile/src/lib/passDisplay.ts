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
): string {
  return purchase?.facilityName ?? facilities.find((f) => f.id === pass.facility_id)?.name ?? "Venue";
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
