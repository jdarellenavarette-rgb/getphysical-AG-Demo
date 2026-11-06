import React from "react";
import { DiscoverView } from "../../src/components/discover/DiscoverView";
import { overlays } from "../../src/navigation/overlayStore";

export default function DiscoverRoute() {
  return <DiscoverView onCheckoutItem={(item) => overlays.open({ kind: "checkout", item })} />;
}
