import type { Database } from "./database.types";

/**
 * The four products of the Business Suite. Each kind of business works differently, so each gets
 * its own workspace: its own sections, words and home screen. This file is the single description
 * of them; the web suite, the mobile role portals and the docs all read it.
 */
export type BusinessKind = Database["public"]["Enums"]["business_kind"];

export type WorkspaceId = "GYMDASH" | "CLUBDASH" | "COACHDASH" | "ORGANIZER";

export type WorkspaceSection =
  | "home"
  | "members"
  | "checkin"
  | "schedule"
  | "events"
  | "clients"
  | "inbox"
  | "plans"
  | "payouts"
  | "sales"
  | "settings";

export interface WorkspaceSectionEntry {
  id: WorkspaceSection;
  /** What this workspace calls the section. */
  label: string;
  /** Money and configuration: owners and admins only. */
  adminOnly?: boolean;
}

export interface Workspace {
  id: WorkspaceId;
  /** Product name shown to the operator. */
  product: string;
  /** What the business is called in sentences ("your gym"). */
  noun: string;
  registryType: Database["public"]["Enums"]["registry_type"];
  /** Stored in facilities.category, and shown in the app. */
  category: string;
  /** What this business calls the people it serves. */
  people: { one: string; many: string };
  /** Whether it is a place people visit, and so belongs in Discover. */
  isVenue: boolean;
  sections: WorkspaceSectionEntry[];
}

const MONEY: WorkspaceSectionEntry[] = [
  { id: "payouts", label: "Payouts", adminOnly: true },
  { id: "sales", label: "Sales", adminOnly: true },
];
const SETTINGS: WorkspaceSectionEntry = { id: "settings", label: "Settings" };

const GYMDASH_SECTIONS: WorkspaceSectionEntry[] = [
  { id: "home", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "checkin", label: "Check-in" },
  { id: "inbox", label: "Inbox" },
  { id: "plans", label: "Plans and prices", adminOnly: true },
  ...MONEY,
  SETTINGS,
];

export const WORKSPACES: Record<BusinessKind, Workspace> = {
  GYM: {
    id: "GYMDASH",
    product: "GymDash",
    noun: "gym",
    registryType: "COMMERCIAL",
    category: "Gym",
    people: { one: "member", many: "members" },
    isVenue: true,
    sections: GYMDASH_SECTIONS,
  },
  STUDIO: {
    id: "GYMDASH",
    product: "GymDash",
    noun: "studio",
    registryType: "COMMERCIAL",
    category: "Fitness studio",
    people: { one: "member", many: "members" },
    isVenue: true,
    sections: GYMDASH_SECTIONS,
  },
  CLUB: {
    id: "CLUBDASH",
    product: "Clubdash",
    noun: "club",
    registryType: "COMMUNITY",
    category: "Sports club",
    people: { one: "player", many: "players" },
    isVenue: true,
    sections: [
      { id: "home", label: "Today" },
      { id: "schedule", label: "Courts" },
      { id: "members", label: "Players" },
      { id: "events", label: "Events" },
      { id: "inbox", label: "Inbox" },
      { id: "plans", label: "Plans and prices", adminOnly: true },
      ...MONEY,
      SETTINGS,
    ],
  },
  COACH: {
    id: "COACHDASH",
    product: "CoachDash",
    noun: "coaching business",
    registryType: "COMMUNITY",
    category: "Coaching",
    people: { one: "client", many: "clients" },
    isVenue: false,
    sections: [
      { id: "home", label: "Today" },
      { id: "clients", label: "Clients" },
      { id: "inbox", label: "Inbox" },
      { id: "plans", label: "Packages and prices", adminOnly: true },
      ...MONEY,
      SETTINGS,
    ],
  },
  ORGANIZER: {
    id: "ORGANIZER",
    product: "Organizer Pro",
    noun: "organizer profile",
    registryType: "COMMUNITY",
    category: "Event organizer",
    people: { one: "participant", many: "participants" },
    isVenue: false,
    sections: [
      { id: "home", label: "Overview" },
      { id: "events", label: "Events" },
      { id: "members", label: "Participants" },
      { id: "inbox", label: "Inbox" },
      ...MONEY,
      SETTINGS,
    ],
  },
};

export const BUSINESS_KINDS = Object.keys(WORKSPACES) as BusinessKind[];

type StaffRole = Database["public"]["Enums"]["facility_role"];

/** The sections this role sees in this workspace. The database enforces the same split on the data. */
export function workspaceSections(kind: BusinessKind, role: StaffRole): WorkspaceSectionEntry[] {
  const isAdmin = role === "OWNER" || role === "ADMIN";
  const sections = WORKSPACES[kind].sections.filter((section) => !section.adminOnly || isAdmin);
  // A coach on a venue's team keeps their own client list next to the venue's sections.
  if (role === "COACH" && kind !== "COACH") {
    return [sections[0]!, { id: "clients", label: "My clients" }, ...sections.slice(1)];
  }
  return sections;
}

/** Whether a section exists for this role in this workspace. Pages outside it are not found. */
export function workspaceHas(kind: BusinessKind, role: StaffRole, section: WorkspaceSection): boolean {
  return workspaceSections(kind, role).some((entry) => entry.id === section);
}
