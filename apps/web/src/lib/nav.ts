import type { FacilityRole } from "sodia-core";

export interface SuiteNavItem {
  href: string;
  label: string;
  icon: "overview" | "members" | "checkin" | "inbox" | "plans" | "payouts" | "sales" | "settings";
  /** Money and configuration: owners and admins only. */
  adminOnly?: boolean;
}

const ITEMS: SuiteNavItem[] = [
  { href: "/", label: "Overview", icon: "overview" },
  { href: "/members", label: "Members", icon: "members" },
  { href: "/check-in", label: "Check-in", icon: "checkin" },
  { href: "/inbox", label: "Inbox", icon: "inbox" },
  { adminOnly: true, href: "/plans", label: "Plans and prices", icon: "plans" },
  { adminOnly: true, href: "/payouts", label: "Payouts", icon: "payouts" },
  { adminOnly: true, href: "/sales", label: "Sales", icon: "sales" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

/** Sections shown to this staff role. The pages and the database enforce the same rule. */
export function suiteNavFor(role: FacilityRole): SuiteNavItem[] {
  const isAdmin = role === "OWNER" || role === "ADMIN";
  return ITEMS.filter((item) => !item.adminOnly || isAdmin);
}
