"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Compass, Dumbbell, LogOut, Moon, Sun, Trophy, UserCheck, type LucideIcon } from "lucide-react";
import { signOut } from "../../app/actions/auth";
import { selectFacility } from "../../app/actions/facility";
import { SUITE_MODE_LABELS, type SuiteMode } from "../../lib/suite-modes";
import type { ActiveFacilityValue } from "./ActiveFacilityContext";
import { useSuiteTheme } from "./theme";

const MODE_ICONS: Record<SuiteMode, LucideIcon> = {
  GYMDASH: Dumbbell,
  CLUBDASH: Compass,
  COACHDASH: UserCheck,
  ORGANIZERDASH: Trophy,
};

const STAFF_ROLE_LABELS: Record<ActiveFacilityValue["role"], string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  STAFF: "Staff",
  COACH: "Coach",
};

interface SuiteHeaderProps {
  facility: ActiveFacilityValue;
  facilities: ActiveFacilityValue[];
  operatorName: string;
  suiteMode: SuiteMode;
  availableModes: SuiteMode[];
  onSelectMode: (mode: SuiteMode) => void;
}

/** Top bar: which facility and workspace you are in, who you are, and sign out. */
export function SuiteHeader({
  facility,
  facilities,
  operatorName,
  suiteMode,
  availableModes,
  onSelectMode,
}: SuiteHeaderProps) {
  const { theme, isDark, toggleTheme } = useSuiteTheme();
  const router = useRouter();
  const [isSwitching, startSwitch] = useTransition();
  const ModeIcon = MODE_ICONS[suiteMode];

  const controlStyle = {
    backgroundColor: theme.bgCardSecondary,
    color: theme.textPrimary,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: "8px",
    padding: "7px 12px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  } as const;

  const switchFacility = (facilityId: string) => {
    if (facilityId === facility.id) return;
    startSwitch(async () => {
      await selectFacility(facilityId);
      router.refresh();
    });
  };

  return (
    <header
      style={{
        minHeight: "74px",
        backgroundColor: theme.bgHeader,
        borderBottom: `1px solid ${theme.borderColor}`,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 28px",
        flexShrink: 0,
        zIndex: 5,
        gap: "12px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flexWrap: "wrap" }}>
        <div
          aria-hidden
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            backgroundColor: theme.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          <ModeIcon size={16} />
        </div>
        <div style={{ minWidth: 0 }}>
          {facilities.length > 1 ? (
            <select
              aria-label="Facility"
              value={facility.id}
              disabled={isSwitching}
              onChange={(e) => switchFacility(e.target.value)}
              style={{ ...controlStyle, fontSize: "14px", fontWeight: 800, maxWidth: "280px" }}
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          ) : (
            <div
              style={{
                fontSize: "15px",
                fontWeight: 900,
                color: theme.textPrimary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "320px",
              }}
            >
              {facility.name}
            </div>
          )}
          <div style={{ fontSize: "11px", fontWeight: 600, color: theme.textSecondary, marginTop: "2px" }}>
            {facility.registryType === "COMMUNITY" ? "Community club" : "Commercial gym"} ·{" "}
            {facility.plan === "PRO" ? "Pro plan" : "Free plan"}
          </div>
        </div>

        {availableModes.length > 1 ? (
          <select
            aria-label="Workspace"
            value={suiteMode}
            onChange={(e) => onSelectMode(e.target.value as SuiteMode)}
            style={controlStyle}
          >
            {availableModes.map((mode) => (
              <option key={mode} value={mode}>
                {SUITE_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        ) : (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: theme.textPrimary,
              backgroundColor: theme.bgCardSecondary,
              border: `1px solid ${theme.borderColor}`,
              padding: "4px 10px",
              borderRadius: "6px",
            }}
          >
            {SUITE_MODE_LABELS[suiteMode]}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ textAlign: "right", lineHeight: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: theme.textPrimary }}>{operatorName}</div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: theme.textSecondary }}>
            {STAFF_ROLE_LABELS[facility.role]}
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          style={{ ...controlStyle, display: "flex", alignItems: "center", gap: "6px" }}
        >
          {isDark ? <Sun size={14} aria-hidden /> : <Moon size={14} aria-hidden />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>
        <form action={signOut}>
          <button type="submit" style={{ ...controlStyle, display: "flex", alignItems: "center", gap: "6px" }}>
            <LogOut size={14} aria-hidden />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
