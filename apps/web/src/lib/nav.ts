import { workspaceSections, type BusinessKind, type FacilityRole, type WorkspaceSection } from "sodia-core";

export interface SuiteNavItem {
  href: string;
  label: string;
  icon: WorkspaceSection;
}

export const SECTION_HREFS: Record<WorkspaceSection, string> = {
  home: "/",
  members: "/members",
  checkin: "/check-in",
  schedule: "/schedule",
  classes: "/classes",
  events: "/events",
  clients: "/clients",
  inbox: "/inbox",
  posts: "/posts",
  plans: "/plans",
  payouts: "/payouts",
  sales: "/sales",
  settings: "/settings",
};

/** The sections of this business's workspace that this role sees, in the workspace's own words. */
export function suiteNavFor(role: FacilityRole, kind: BusinessKind): SuiteNavItem[] {
  return workspaceSections(kind, role).map((section) => ({
    href: SECTION_HREFS[section.id],
    label: section.label,
    icon: section.id,
  }));
}
