import React from "react";
import { ProfileHub } from "../../src/components/profile/ProfileHub";
import { overlays } from "../../src/navigation/overlayStore";
import { goToTab } from "../../src/navigation/tabs";

export default function ProfileRoute() {
  return (
    <ProfileHub
      onBack={() => goToTab("sodia")}
      onSwitchToBusinessMode={() => overlays.open({ kind: "staffDash" })}
      onSwitchToCoachDash={() => overlays.open({ kind: "coachDash" })}
      onOpenMessages={() => overlays.open({ kind: "inbox", thread: null })}
    />
  );
}
