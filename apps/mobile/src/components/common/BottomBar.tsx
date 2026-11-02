import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Compass, Dumbbell, CreditCard, User } from "lucide-react-native";

export type MobileTab = "sodia" | "discover" | "track" | "cards" | "profile";

interface BottomBarProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onPressCreate?: () => void;
}

export function BottomBar({ currentTab, onSelectTab }: BottomBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 10);

  const tabs: { key: MobileTab; label: string; icon: typeof Home }[] = [
    { key: "sodia", label: "Feed", icon: Home },
    { key: "discover", label: "Discover", icon: Compass },
    { key: "track", label: "Track", icon: Dumbbell },
    { key: "cards", label: "Wallet", icon: CreditCard },
    { key: "profile", label: "Profile", icon: User },
  ];

  return (
    <View style={[styles.dockContainer, { bottom: bottomOffset }]}>
      <View style={styles.dockSurface}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          const Icon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              style={styles.tabButton}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
                <Icon
                  size={20}
                  color={isActive ? "#FFFFFF" : "#8E8E93"}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    position: "absolute",
    left: 18,
    right: 18,
    zIndex: 50,
  },
  dockSurface: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "#16161A",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 16,
  },
  tabButton: {
    flex: 1,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPill: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPillActive: {
    backgroundColor: "#E11D48",
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  label: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  labelActive: {
    color: "#FAFAFA",
    fontWeight: "800",
  },
});
