import { workspaceHas, type BusinessKind, type FacilityRole, type WorkspaceSection } from "sodia-core";

export const AUTOMATION_KINDS = [
  "WELCOME",
  "PASS_ENDING",
  "WIN_BACK",
  "EVENT_REMINDER",
  "CLASS_REMINDER",
  "CLIENT_QUIET",
] as const;
export type AutomationKind = (typeof AUTOMATION_KINDS)[number];

interface AutomationDefinition {
  title: string;
  /** When it goes out, in a sentence. */
  when: string;
  /** The part of the suite it depends on; workspaces without it don't offer the automation. */
  section: WorkspaceSection;
  /** What {detail} stands for in this message, when it is used. */
  detail: string | null;
  defaultBody: string;
}

export const AUTOMATIONS: Record<AutomationKind, AutomationDefinition> = {
  WELCOME: {
    title: "Welcome a new member",
    when: "Sent the moment someone joins.",
    section: "members",
    detail: null,
    defaultBody: "Hi {name}, welcome to {business}! Reply here any time you have a question.",
  },
  PASS_ENDING: {
    title: "Pass about to end",
    when: "Sent three days before a member's pass or membership ends.",
    section: "plans",
    detail: "the date the pass ends",
    defaultBody: "Hi {name}, your pass at {business} ends on {detail}. Renew at the desk or in the app to keep going.",
  },
  WIN_BACK: {
    title: "Win back a lapsed member",
    when: "Sent once, a week after a member's pass ended.",
    section: "plans",
    detail: "the date the pass ended",
    defaultBody: "Hi {name}, we miss you at {business}. Your pass ended on {detail}. Come back any time.",
  },
  EVENT_REMINDER: {
    title: "Event reminder",
    when: "Sent the day before to everyone signed up.",
    section: "events",
    detail: "the event and its time",
    defaultBody: "Hi {name}, a reminder from {business}: {detail}. See you there.",
  },
  CLASS_REMINDER: {
    title: "Class reminder",
    when: "Sent the day before to everyone booked.",
    section: "classes",
    detail: "the class and its time",
    defaultBody:
      "Hi {name}, you're booked at {business}: {detail}. Can't make it? Cancel so someone else gets the place.",
  },
  CLIENT_QUIET: {
    title: "Client gone quiet",
    when: "Sent when a coached client logs nothing for three days. At most once a week each.",
    section: "clients",
    detail: null,
    defaultBody: "Hi {name}, checking in from {business}. How is training going this week?",
  },
};

/** The automations that make sense for this kind of business. */
export function automationsFor(kind: BusinessKind, role: FacilityRole): AutomationKind[] {
  return AUTOMATION_KINDS.filter((automation) => workspaceHas(kind, role, AUTOMATIONS[automation].section));
}
