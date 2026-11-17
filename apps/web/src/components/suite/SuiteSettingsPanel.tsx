"use client";

import { SUITE_MODE_LABELS, type SuiteMode } from "../../lib/suite-modes";
import type { ActiveFacilityValue } from "./ActiveFacilityContext";
import { useSuiteTheme } from "./theme";

const MODE_DESCRIPTIONS: Record<SuiteMode, string> = {
  GYMDASH: "Front desk, door access, memberships and member messaging for a commercial gym.",
  CLUBDASH: "Everything in GymDash, plus court scheduling for a community club.",
  COACHDASH: "Client roster, programs and client messaging. Shown because your account holds the coach role.",
  ORGANIZERDASH: "Events, participants and brackets. Shown because your account holds the organizer role.",
};

interface SuiteSettingsPanelProps {
  facility: ActiveFacilityValue;
  operatorName: string;
  availableModes: SuiteMode[];
}

/** Read-only facts about the facility and this account. Editing venue details comes with the venue-profile work. */
export function SuiteSettingsPanel({ facility, operatorName, availableModes }: SuiteSettingsPanelProps) {
  const { theme } = useSuiteTheme();
  const rows: { label: string; value: string }[] = [
    { label: "Facility", value: facility.name },
    { label: "Type", value: facility.registryType === "COMMUNITY" ? "Community club" : "Commercial gym" },
    { label: "Plan", value: facility.plan === "PRO" ? "Pro" : "Free" },
    { label: "Signed in as", value: operatorName },
    { label: "Your role here", value: facility.role.charAt(0) + facility.role.slice(1).toLowerCase() },
  ];

  return (
    <section
      aria-labelledby="settings-title"
      style={{
        borderRadius: "24px",
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        padding: "32px",
        maxWidth: "680px",
        boxShadow: theme.shadowCard,
      }}
    >
      <h2
        id="settings-title"
        style={{ fontSize: "18px", fontWeight: 900, margin: "0 0 20px", color: theme.textPrimary }}
      >
        Settings
      </h2>

      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "160px 1fr", rowGap: "12px", fontSize: "14px" }}>
        {rows.map((row) => (
          <div key={row.label} style={{ display: "contents" }}>
            <dt style={{ color: theme.textSecondary, fontWeight: 600 }}>{row.label}</dt>
            <dd style={{ margin: 0, color: theme.textPrimary, fontWeight: 700 }}>{row.value}</dd>
          </div>
        ))}
      </dl>

      <h3 style={{ fontSize: "14px", fontWeight: 800, margin: "28px 0 10px", color: theme.textPrimary }}>
        Workspaces available to you
      </h3>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "10px" }}>
        {availableModes.map((mode) => (
          <li
            key={mode}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              backgroundColor: theme.bgCardSecondary,
              border: `1px solid ${theme.borderColor}`,
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 800, color: theme.textPrimary }}>{SUITE_MODE_LABELS[mode]}</div>
            <div style={{ fontSize: "13px", color: theme.textSecondary, marginTop: "2px" }}>
              {MODE_DESCRIPTIONS[mode]}
            </div>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: "13px", color: theme.textSecondary, margin: "16px 0 0" }}>
        Opening hours, prices, payout account and staff are not editable here yet.
      </p>
    </section>
  );
}
