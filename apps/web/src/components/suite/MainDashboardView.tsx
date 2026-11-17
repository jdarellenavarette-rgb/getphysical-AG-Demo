"use client";

import React, { useState } from "react";
import { HeroPromoCard, type SuiteMode } from "./HeroPromoCard";
import { ActivityPerformanceSection } from "./ActivityPerformanceSection";
import { PerformanceTableCard } from "./PerformanceTableCard";
import { EngagementGaugeCard } from "./EngagementGaugeCard";
import { CoachAvailabilityCard } from "./CoachAvailabilityCard";
import { CreateMessageModal } from "./CreateMessageModal";

interface MainDashboardViewProps {
  suiteMode: SuiteMode;
}

export function MainDashboardView({ suiteMode }: MainDashboardViewProps) {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Top Grid: Hero Promo Card (Left) + Activity & Performance (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "20px",
        }}
      >
        <HeroPromoCard onCreateMessage={() => setIsMessageModalOpen(true)} suiteMode={suiteMode} />

        <ActivityPerformanceSection suiteMode={suiteMode} />
      </div>

      {/* Bottom Grid: Top Performance Table (Left) + Gauges/Coach (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "20px",
        }}
      >
        <PerformanceTableCard suiteMode={suiteMode} />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <EngagementGaugeCard suiteMode={suiteMode} />
          <CoachAvailabilityCard suiteMode={suiteMode} />
        </div>
      </div>

      <CreateMessageModal
        visible={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        suiteMode={suiteMode}
      />
    </div>
  );
}
