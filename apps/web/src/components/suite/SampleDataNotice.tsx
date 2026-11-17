"use client";

import { FlaskConical } from "lucide-react";
import { useActiveFacility } from "./ActiveFacilityContext";
import { useSuiteTheme } from "./theme";

/**
 * Shown on every screen that is not yet connected to the facility's own data,
 * so sample figures are never mistaken for real ones.
 */
export function SampleDataNotice({ area }: { area: string }) {
  const { isDark } = useSuiteTheme();
  const facility = useActiveFacility();
  return (
    <div
      role="note"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "12px 16px",
        marginBottom: "16px",
        borderRadius: "14px",
        backgroundColor: isDark ? "#3A2A05" : "#FEF3C7",
        border: `1px solid ${isDark ? "#7C5A0B" : "#F59E0B"}`,
        color: isDark ? "#FDE68A" : "#78350F",
        fontSize: "13px",
        lineHeight: "19px",
      }}
    >
      <FlaskConical size={16} style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden />
      <span>
        <strong>Sample data.</strong> {area} is not connected to {facility.name} yet. The figures and names below are
        examples, and nothing you do here is saved, charged or sent.
      </span>
    </div>
  );
}
