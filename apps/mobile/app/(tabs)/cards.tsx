import React from "react";
import { CardsHub } from "../../src/components/cards/CardsHub";
import { goToTab } from "../../src/navigation/tabs";

export default function CardsRoute() {
  return <CardsHub onBrowseVenues={() => goToTab("discover")} />;
}
