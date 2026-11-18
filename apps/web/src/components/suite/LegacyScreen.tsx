"use client";

import type { ReactNode } from "react";
import { ActiveFacilityProvider, type ActiveFacilityValue } from "./ActiveFacilityContext";
import { SuiteThemeProvider } from "./theme";

/** Context for screens that have not moved to the shared component set yet (inbox and the sample screens). */
export function LegacyScreen({ facility, children }: { facility: ActiveFacilityValue; children: ReactNode }) {
  return (
    <ActiveFacilityProvider value={facility}>
      <SuiteThemeProvider>{children}</SuiteThemeProvider>
    </ActiveFacilityProvider>
  );
}
