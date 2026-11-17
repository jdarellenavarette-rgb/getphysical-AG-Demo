"use client";

import { useState, type ReactNode } from "react";
import { allowedSuiteModes, type SuiteMode } from "../../lib/suite-modes";
import { SpatialCalendar } from "../clubdash/SpatialCalendar";
import { DailyDash } from "../daily-dash/DailyDash";
import { TriageDashboard } from "../dashboard/TriageDashboard";
import { ActiveFacilityProvider, type ActiveFacilityValue } from "./ActiveFacilityContext";
import { AthleticInboxCRMView } from "./AthleticInboxCRMView";
import { MainDashboardView } from "./MainDashboardView";
import { NavigationDock, type NavTab } from "./NavigationDock";
import { SampleDataNotice } from "./SampleDataNotice";
import { SuiteHeader } from "./SuiteHeader";
import { SuiteSettingsPanel } from "./SuiteSettingsPanel";
import { SuiteThemeProvider, useSuiteTheme } from "./theme";

export interface BusinessSuiteShellProps {
  facility: ActiveFacilityValue;
  facilities: ActiveFacilityValue[];
  operatorName: string;
  /** Account roles from the profile; decide which extra workspaces are offered. */
  profileRoles: string[];
}

const SCHEDULE_TITLES: Record<SuiteMode, string> = {
  GYMDASH: "Schedule",
  CLUBDASH: "Court schedule",
  COACHDASH: "Client schedule",
  ORGANIZERDASH: "Match schedule",
};
const SALES_TITLES: Record<SuiteMode, string> = {
  GYMDASH: "Front desk and sales",
  CLUBDASH: "Front desk and sales",
  COACHDASH: "Payouts",
  ORGANIZERDASH: "Registrations and payouts",
};
const ATTENTION_TITLES: Record<SuiteMode, string> = {
  GYMDASH: "Needs attention",
  CLUBDASH: "Needs attention",
  COACHDASH: "Client check-ins",
  ORGANIZERDASH: "Participant check-in",
};

function TabPanel({ title, children }: { title: string; children: ReactNode }) {
  const { theme } = useSuiteTheme();
  return (
    <section
      style={{
        backgroundColor: theme.bgCard,
        padding: "24px",
        borderRadius: "24px",
        border: `1px solid ${theme.borderColor}`,
        boxShadow: theme.shadowCard,
      }}
    >
      <h2 style={{ fontSize: "20px", fontWeight: 900, color: theme.textPrimary, margin: "0 0 16px" }}>{title}</h2>
      {children}
    </section>
  );
}

function BusinessSuiteInner({ facility, facilities, operatorName, profileRoles }: BusinessSuiteShellProps) {
  const { theme } = useSuiteTheme();
  const availableModes = allowedSuiteModes(facility.registryType, profileRoles);
  const [suiteMode, setSuiteMode] = useState<SuiteMode>(availableModes[0]!);
  const [activeTab, setActiveTab] = useState<NavTab>("DASHBOARD");

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.bgScreen,
        color: theme.textPrimary,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <NavigationDock activeTab={activeTab} onSelectTab={setActiveTab} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        <SuiteHeader
          facility={facility}
          facilities={facilities}
          operatorName={operatorName}
          suiteMode={suiteMode}
          availableModes={availableModes}
          onSelectMode={setSuiteMode}
        />

        <main style={{ flex: 1, padding: "24px 28px", maxWidth: "1440px", width: "100%", margin: "0 auto" }}>
          {activeTab === "DASHBOARD" && (
            <>
              <SampleDataNotice area="The dashboard" />
              <MainDashboardView suiteMode={suiteMode} onNavigateToSchedule={() => setActiveTab("SPATIAL")} />
            </>
          )}

          {activeTab === "SPATIAL" && (
            <TabPanel title={SCHEDULE_TITLES[suiteMode]}>
              <SampleDataNotice area="The schedule" />
              <SpatialCalendar />
            </TabPanel>
          )}

          {activeTab === "INBOX" && (
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 900, color: theme.textPrimary, margin: "0 0 16px" }}>
                Member inbox
              </h2>
              <AthleticInboxCRMView suiteMode={suiteMode} />
            </div>
          )}

          {activeTab === "BILLING" && (
            <TabPanel title={SALES_TITLES[suiteMode]}>
              <SampleDataNotice area="Door scanning and sales" />
              <DailyDash />
            </TabPanel>
          )}

          {activeTab === "TRIAGE" && (
            <TabPanel title={ATTENTION_TITLES[suiteMode]}>
              <SampleDataNotice area="This queue" />
              <TriageDashboard />
            </TabPanel>
          )}

          {activeTab === "SETTINGS" && (
            <SuiteSettingsPanel facility={facility} operatorName={operatorName} availableModes={availableModes} />
          )}
        </main>
      </div>
    </div>
  );
}

export function BusinessSuiteShell(props: BusinessSuiteShellProps) {
  return (
    <ActiveFacilityProvider value={props.facility}>
      <SuiteThemeProvider>
        {/* Keyed so tab and workspace state reset when the operator switches facility. */}
        <BusinessSuiteInner key={props.facility.id} {...props} />
      </SuiteThemeProvider>
    </ActiveFacilityProvider>
  );
}
