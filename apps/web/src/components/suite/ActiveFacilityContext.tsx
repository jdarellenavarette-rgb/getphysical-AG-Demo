"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FacilityRole, RegistryType } from "sodia-core";

export interface ActiveFacilityValue {
  id: string;
  name: string;
  registryType: RegistryType;
  plan: "FREE" | "PRO";
  logoUrl: string | null;
  role: FacilityRole;
}

const ActiveFacilityContext = createContext<ActiveFacilityValue | null>(null);

export function ActiveFacilityProvider({ value, children }: { value: ActiveFacilityValue; children: ReactNode }) {
  return <ActiveFacilityContext.Provider value={value}>{children}</ActiveFacilityContext.Provider>;
}

/** The facility (tenant) the operator is currently acting for. */
export function useActiveFacility(): ActiveFacilityValue {
  const value = useContext(ActiveFacilityContext);
  if (!value) throw new Error("useActiveFacility must be used inside <ActiveFacilityProvider>");
  return value;
}
