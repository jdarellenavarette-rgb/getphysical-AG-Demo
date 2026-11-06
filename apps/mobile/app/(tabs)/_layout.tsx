import React from "react";
import { StyleSheet, View } from "react-native";
import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import { BottomBar, type MobileTab } from "../../src/components/common/BottomBar";
import { HeaderBar } from "../../src/components/common/HeaderBar";
import { overlays } from "../../src/navigation/overlayStore";
import { goToTab, routeNameToTab, TAB_ROUTE_NAME } from "../../src/navigation/tabs";
import { useColors } from "../../src/theme/theme";

function DockTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const current = state.routes[state.index];
  const select = (tab: MobileTab) => {
    const target = state.routes.find((r) => r.name === TAB_ROUTE_NAME[tab]);
    if (target) navigateToTab(target.key);
  };
  return (
    <BottomBar
      currentTab={routeNameToTab(current?.name ?? "index")}
      onSelectTab={select}
      onPressCreate={() => overlays.open({ kind: "createPost" })}
    />
  );
}

export default function TabsLayout() {
  const colors = useColors();
  return (
    <View style={[styles.root, { backgroundColor: colors.bgScreen }]}>
      <HeaderBar
        onOpenMenu={() => overlays.open({ kind: "menu" })}
        onOpenSettings={() => overlays.open({ kind: "settings" })}
        onOpenActivity={() => overlays.open({ kind: "activity" })}
        onOpenInbox={() => overlays.open({ kind: "inbox", thread: null })}
        onPressLogo={() => goToTab("sodia")}
      />
      <Tabs
        tabBar={(props) => <DockTabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bgScreen } }}
      >
        <Tabs.Screen name="index" options={{ title: "Feed" }} />
        <Tabs.Screen name="discover" options={{ title: "Venues" }} />
        <Tabs.Screen name="track" options={{ title: "Track" }} />
        <Tabs.Screen name="cards" options={{ title: "Wallet" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
