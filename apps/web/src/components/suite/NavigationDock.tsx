"use client";

import React from "react";
import { Home, Calendar, MessageSquare, FileText, BarChart2, Settings, type LucideIcon } from "lucide-react";
import { useSuiteTheme } from "./theme";

export type NavTab = "DASHBOARD" | "SPATIAL" | "INBOX" | "BILLING" | "TRIAGE" | "SETTINGS";

interface NavigationDockProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export function NavigationDock({ activeTab, onSelectTab }: NavigationDockProps) {
  const { theme } = useSuiteTheme();
  const navItems: { id: NavTab; icon: LucideIcon; label: string }[] = [
    { id: "DASHBOARD", icon: Home, label: "Dashboard" },
    { id: "SPATIAL", icon: Calendar, label: "Schedule" },
    { id: "INBOX", icon: MessageSquare, label: "Member inbox" },
    { id: "BILLING", icon: FileText, label: "Front desk and sales" },
    { id: "TRIAGE", icon: BarChart2, label: "Needs attention" },
    { id: "SETTINGS", icon: Settings, label: "Settings" },
  ];

  return (
    <nav
      aria-label="Business Suite sections"
      style={{
        width: "74px",
        alignSelf: "stretch",
        backgroundColor: theme.bgDock,
        borderRight: `1px solid ${theme.borderColor}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 0",
        zIndex: 10,
        flexShrink: 0,
        boxShadow: "2px 0 12px rgba(0, 0, 0, 0.02)",
      }}
    >
      {/* Top Logo & Navigation Items */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px", width: "100%" }}>
        <button
          type="button"
          aria-label="GetPhysical: go to dashboard"
          onClick={() => onSelectTab("DASHBOARD")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "22px",
            fontStyle: "italic",
            fontWeight: 900,
            color: theme.textPrimary,
            letterSpacing: "-1.5px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          GP
        </button>

        {/* Navigation Items Stack */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", width: "100%" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                style={{
                  width: "46px",
                  height: "42px",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.2s ease",
                  background: isActive ? "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)" : "transparent",
                  color: isActive ? "#FFFFFF" : theme.textMuted,
                  boxShadow: isActive ? "0 4px 14px rgba(225, 29, 72, 0.35)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = theme.textPrimary;
                    e.currentTarget.style.backgroundColor = theme.bgCardSecondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = theme.textMuted;
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
