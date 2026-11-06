import { router } from "expo-router";
import type { MobileTab } from "../components/common/BottomBar";

/** Expo Router route name (inside app/(tabs)) for each dock tab. */
export const TAB_ROUTE_NAME: Record<MobileTab, string> = {
  sodia: "index",
  discover: "discover",
  cards: "cards",
  track: "track",
  profile: "profile",
};

const TAB_PATH = {
  sodia: "/",
  discover: "/discover",
  cards: "/cards",
  track: "/track",
  profile: "/profile",
} as const satisfies Record<MobileTab, string>;

export function routeNameToTab(name: string): MobileTab {
  const match = (Object.keys(TAB_ROUTE_NAME) as MobileTab[]).find((tab) => TAB_ROUTE_NAME[tab] === name);
  return match ?? "sodia";
}

/** Switch tabs from anywhere (overlays, stores, deep-link handlers). */
export function goToTab(tab: MobileTab): void {
  router.navigate(TAB_PATH[tab]);
}
