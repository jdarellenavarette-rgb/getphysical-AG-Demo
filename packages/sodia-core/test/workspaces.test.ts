import { describe, expect, it } from "vitest";
import { BUSINESS_KINDS, WORKSPACES, workspaceHas, workspaceSections } from "../src/workspaces";

const ids = (kind: (typeof BUSINESS_KINDS)[number], role: "OWNER" | "ADMIN" | "STAFF" | "COACH") =>
  workspaceSections(kind, role).map((section) => section.id);

describe("workspaces", () => {
  it("gives every kind a home and settings, and no section twice", () => {
    for (const kind of BUSINESS_KINDS) {
      const sections = ids(kind, "OWNER");
      expect(sections[0]).toBe("home");
      expect(sections.at(-1)).toBe("settings");
      expect(new Set(sections).size).toBe(sections.length);
    }
  });

  it("keeps each product's own tools out of the others", () => {
    expect(workspaceHas("GYM", "OWNER", "checkin")).toBe(true);
    expect(workspaceHas("GYM", "OWNER", "schedule")).toBe(false);
    expect(workspaceHas("GYM", "STAFF", "classes")).toBe(true);
    expect(workspaceHas("CLUB", "OWNER", "classes")).toBe(false);
    expect(workspaceHas("GYM", "OWNER", "events")).toBe(false);
    expect(workspaceHas("CLUB", "OWNER", "schedule")).toBe(true);
    expect(workspaceHas("CLUB", "OWNER", "checkin")).toBe(false);
    expect(workspaceHas("COACH", "OWNER", "clients")).toBe(true);
    expect(workspaceHas("COACH", "OWNER", "members")).toBe(false);
    expect(workspaceHas("COACH", "OWNER", "checkin")).toBe(false);
    expect(workspaceHas("ORGANIZER", "OWNER", "events")).toBe(true);
    expect(workspaceHas("ORGANIZER", "OWNER", "plans")).toBe(false);
    expect(workspaceHas("ORGANIZER", "OWNER", "clients")).toBe(false);
  });

  it("gives every workspace a way to post to the people who follow it", () => {
    for (const kind of BUSINESS_KINDS) {
      expect(workspaceHas(kind, "STAFF", "posts")).toBe(true);
      // Front-desk staff take money, so the till is theirs too.
      expect(workspaceHas(kind, "STAFF", "till")).toBe(true);
    }
  });

  it("hides money and configuration from staff", () => {
    for (const kind of BUSINESS_KINDS) {
      for (const section of ["plans", "payouts", "sales"] as const) {
        expect(workspaceHas(kind, "STAFF", section)).toBe(false);
      }
    }
    expect(workspaceHas("GYM", "ADMIN", "sales")).toBe(true);
  });

  it("gives a coach on a venue's team their own client list", () => {
    expect(ids("GYM", "COACH")).toContain("clients");
    expect(ids("GYM", "STAFF")).not.toContain("clients");
    expect(ids("COACH", "COACH").filter((id) => id === "clients")).toHaveLength(1);
  });

  it("uses each trade's own words and keeps non-venues out of Discover", () => {
    expect(WORKSPACES.CLUB.people.many).toBe("players");
    expect(WORKSPACES.COACH.people.many).toBe("clients");
    expect(WORKSPACES.ORGANIZER.people.many).toBe("participants");
    expect(BUSINESS_KINDS.filter((kind) => WORKSPACES[kind].isVenue)).toEqual(["GYM", "STUDIO", "CLUB"]);
    expect(WORKSPACES.GYM.registryType).toBe("COMMERCIAL");
    expect(WORKSPACES.COACH.registryType).toBe("COMMUNITY");
  });
});
