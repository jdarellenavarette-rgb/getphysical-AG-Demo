import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Compass, Plus, Dumbbell, CreditCard } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

export type MobileTab = "sodia" | "discover" | "track" | "cards" | "profile";

interface BottomBarProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onPressCreate?: () => void;
}

export function BottomBar({ currentTab, onSelectTab, onPressCreate }: BottomBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 10);
  const { colors, themeMode } = useThemeStore();

  const isLight = themeMode === "light";

  return (
    <View style={[styles.dockContainer, { bottom: bottomOffset }]}>
      <View
        style={[
          styles.dockSurface,
          {
            backgroundColor: colors.bgDock,
            borderColor: colors.borderColor,
            shadowColor: isLight ? "#64748B" : "#000000",
            shadowOpacity: isLight ? 0.2 : 0.55,
          },
        ]}
      >
        {/* 1. FEED (SODIA) */}
        <TouchableOpacity
          onPress={() => onSelectTab("sodia")}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Home
            size={21}
            color={currentTab === "sodia" ? "#E11D48" : colors.textMuted}
            strokeWidth={currentTab === "sodia" ? 2.4 : 1.8}
          />
          <Text style={[styles.label, { color: currentTab === "sodia" ? "#E11D48" : colors.textMuted }, currentTab === "sodia" && styles.labelActive]}>
            Feed
          </Text>
        </TouchableOpacity>

        {/* 2. DISCOVER / VENUES */}
        <TouchableOpacity
          onPress={() => onSelectTab("discover")}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Compass
            size={21}
            color={currentTab === "discover" ? "#E11D48" : colors.textMuted}
            strokeWidth={currentTab === "discover" ? 2.4 : 1.8}
          />
          <Text style={[styles.label, { color: currentTab === "discover" ? "#E11D48" : colors.textMuted }, currentTab === "discover" && styles.labelActive]}>
            Venues
          </Text>
        </TouchableOpacity>

        {/* 3. CENTER CIRCLED (+) POST BUTTON */}
        <View style={styles.centerBtnContainer}>
          <TouchableOpacity
            onPress={onPressCreate}
            activeOpacity={0.85}
            style={[styles.centerCircledBtn, { borderColor: colors.bgDock }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* 4. TRACK (LIFT / MOVE / FOOD) */}
        <TouchableOpacity
          onPress={() => onSelectTab("track")}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Dumbbell
            size={21}
            color={currentTab === "track" ? "#E11D48" : colors.textMuted}
            strokeWidth={currentTab === "track" ? 2.4 : 1.8}
          />
          <Text style={[styles.label, { color: currentTab === "track" ? "#E11D48" : colors.textMuted }, currentTab === "track" && styles.labelActive]}>
            Track
          </Text>
        </TouchableOpacity>

        {/* 5. WALLET / CARDS */}
        <TouchableOpacity
          onPress={() => onSelectTab("cards")}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <CreditCard
            size={21}
            color={currentTab === "cards" ? "#E11D48" : colors.textMuted}
            strokeWidth={currentTab === "cards" ? 2.4 : 1.8}
          />
          <Text style={[styles.label, { color: currentTab === "cards" ? "#E11D48" : colors.textMuted }, currentTab === "cards" && styles.labelActive]}>
            Wallet
          </Text>
        </TouchableOpacity>
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
    borderRadius: 32,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 16,
  },
  tabButton: {
    flex: 1,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  centerBtnContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerCircledBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E11D48",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -16,
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  labelActive: {
    color: "#E11D48",
    fontWeight: "800",
  },
});
