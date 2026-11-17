import type { RegistryType } from "sodia-core";

export interface SuiteNavItem {
  href: string;
  label: string;
  icon: "overview" | "members" | "checkin" | "inbox" | "schedule" | "sales" | "settings";
  /** Shown only for community clubs (court bookings). */
  clubOnly?: boolean;
}

const ITEMS: SuiteNavItem[] = [
  { href: "/", label: "Overview", icon: "overview" },
  { href: "/members", label: "Members", icon: "members" },
  { href: "/check-in", label: "Check-in", icon: "checkin" },
  { href: "/inbox", label: "Inbox", icon: "inbox" },
  { href: "/schedule", label: "Court schedule", icon: "schedule", clubOnly: true },
  { href: "/sales", label: "Front desk sales", icon: "sales" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function suiteNavFor(registryType: RegistryType): SuiteNavItem[] {
  return ITEMS.filter((item) => !item.clubOnly || registryType === "COMMUNITY");
}
