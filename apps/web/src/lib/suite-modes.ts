import type { RegistryType } from "sodia-core";

export type SuiteMode = "GYMDASH" | "CLUBDASH" | "COACHDASH" | "ORGANIZERDASH";

export const SUITE_MODE_LABELS: Record<SuiteMode, string> = {
  GYMDASH: "GymDash",
  CLUBDASH: "Clubdash",
  COACHDASH: "CoachDash",
  ORGANIZERDASH: "OrganizerDash",
};

/**
 * Workspaces a person may open for a facility. The facility's registry decides
 * GymDash vs Clubdash; CoachDash and OrganizerDash appear only for accounts
 * that hold those roles (same rule as the mobile app's Settings workspaces).
 */
export function allowedSuiteModes(registryType: RegistryType, profileRoles: readonly string[]): SuiteMode[] {
  const modes: SuiteMode[] = [registryType === "COMMUNITY" ? "CLUBDASH" : "GYMDASH"];
  if (profileRoles.includes("coach")) modes.push("COACHDASH");
  if (profileRoles.includes("organizer")) modes.push("ORGANIZERDASH");
  return modes;
}
