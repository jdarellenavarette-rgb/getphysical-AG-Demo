import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Compass, Plus, Dumbbell, CreditCard, type LucideIcon } from "lucide-react-native";
import { MIN_TOUCH_TARGET, TYPE_SCALE } from "sodia-core";
import { useThemeStore } from "../../theme/theme";
import { haptics } from "../../lib/haptics";

export type MobileTab = "sodia" | "discover" | "track" | "cards" | "profile";

interface BottomBarProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onPressCreate?: () => void;
}

interface DockItem {
  readonly tab: MobileTab;
  readonly label: string;
  readonly icon: LucideIcon;
}

const LEFT_ITEMS: readonly DockItem[] = [
  { tab: "sodia", label: "Feed", icon: Home },
  { tab: "discover", label: "Venues", icon: Compass },
];
const RIGHT_ITEMS: readonly DockItem[] = [
  { tab: "track", label: "Track", icon: Dumbbell },
  { tab: "cards", label: "Wallet", icon: CreditCard },
];

export const DOCK_HEIGHT = 64;

export function BottomBar({ currentTab, onSelectTab, onPressCreate }: BottomBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 10);
  const { colors, themeMode } = useThemeStore();
  const isLight = themeMode === "light";

  const renderItem = ({ tab, label, icon: Icon }: DockItem) => {
    const active = currentTab === tab;
    const tint = active ? colors.accentText : colors.textMuted;
    return (
      <TouchableOpacity
        key={tab}
        onPress={() => {
          if (!active) haptics.selection();
          onSelectTab(tab);
        }}
        style={styles.tabButton}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
      >
        <Icon size={22} color={tint} strokeWidth={active ? 2.4 : 1.8} />
        <Text style={[styles.label, { color: tint }, active && styles.labelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.dockContainer, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View
        accessibilityRole="tablist"
        style={[
          styles.dockSurface,
          {
            backgroundColor: colors.bgDock,
            borderColor: colors.borderColor,
            shadowColor: isLight ? colors.textMuted : "#000000",
            shadowOpacity: isLight ? 0.2 : 0.55,
          },
        ]}
      >
        {LEFT_ITEMS.map(renderItem)}
        <View style={styles.centerBtnContainer}>
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              onPressCreate?.();
            }}
            activeOpacity={0.85}
            style={[styles.centerCircledBtn, { borderColor: colors.bgDock, backgroundColor: colors.accent, shadowColor: colors.accent }]}
            accessibilityRole="button"
            accessibilityLabel="Create post"
          >
            <Plus size={24} color={colors.textOnAccent} strokeWidth={3} />
          </TouchableOpacity>
        </View>
        {RIGHT_ITEMS.map(renderItem)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: { position: "absolute", left: 18, right: 18, zIndex: 50 },
  dockSurface: {
    height: DOCK_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderRadius: 32,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 16,
  },
  tabButton: { flex: 1, height: DOCK_HEIGHT, minWidth: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  centerBtnContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerCircledBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 3,
  },
  label: { ...TYPE_SCALE.caption, fontWeight: "600", marginTop: 2 },
  labelActive: { fontWeight: "800" },
});
