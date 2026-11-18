import type { FacilityRole } from "sodia-core";
import type { BusinessKind } from "./active-facility";

export interface SuiteNavItem {
  href: string;
  label: string;
  icon:
    | "overview"
    | "members"
    | "checkin"
    | "inbox"
    | "plans"
    | "payouts"
    | "sales"
    | "settings"
    | "clients"
    | "events"
    | "schedule";
  /** Money and configuration: owners and admins only. */
  adminOnly?: boolean;
  /** Business kinds that see this section. Everyone when omitted. */
  kinds?: BusinessKind[];
}

const VENUES: BusinessKind[] = ["GYM", "STUDIO", "CLUB"];

const ITEMS: SuiteNavItem[] = [
  { href: "/", label: "Overview", icon: "overview" },
  { href: "/clients", label: "Clients", icon: "clients", kinds: ["COACH"] },
  { href: "/events", label: "Events", icon: "events", kinds: ["ORGANIZER"] },
  { href: "/members", label: "Members", icon: "members" },
  { href: "/check-in", label: "Check-in", icon: "checkin", kinds: VENUES },
  { href: "/schedule", label: "Schedule", icon: "schedule", kinds: VENUES },
  { href: "/events", label: "Events", icon: "events", kinds: VENUES },
  { href: "/inbox", label: "Inbox", icon: "inbox" },
  { adminOnly: true, href: "/plans", label: "Plans and prices", icon: "plans" },
  { adminOnly: true, href: "/payouts", label: "Payouts", icon: "payouts" },
  { adminOnly: true, href: "/sales", label: "Sales", icon: "sales" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

/** Sections shown to this staff role at this kind of business. The pages and the database enforce the same rule. */
export function suiteNavFor(role: FacilityRole, kind: BusinessKind, isDemo = false): SuiteNavItem[] {
  const isAdmin = role === "OWNER" || role === "ADMIN";
  const items = ITEMS.filter((item) => (!item.adminOnly || isAdmin) && (!item.kinds || item.kinds.includes(kind)));
  // A coach on a venue's team sees their own client list as well. The demo venue shows it so every
  // section can be explored from one place.
  if ((role === "COACH" || isDemo) && kind !== "COACH") {
    items.splice(1, 0, { href: "/clients", label: "My clients", icon: "clients" });
  }
  return items;
}
