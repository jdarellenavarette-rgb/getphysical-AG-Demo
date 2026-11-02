import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Compass, Plus, Dumbbell, CreditCard } from "lucide-react-native";

export type MobileTab = "sodia" | "discover" | "track" | "cards" | "profile";

interface BottomBarProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onPressCreate?: () => void;
}

export function BottomBar({ currentTab, onSelectTab, onPressCreate }: BottomBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 10);

  return (
    <View style={[styles.dockContainer, { bottom: bottomOffset }]}>
      <View style={styles.dockSurface}>
        {/* 1. FEED (SODIA) */}
        <TouchableOpacity
          onPress={() => onSelectTab("sodia")}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Home
            size={21}
            color={currentTab === "sodia" ? "#E11D48" : "#8E8E93"}
            strokeWidth={currentTab === "sodia" ? 2.4 : 1.8}
          />
          <Text style={[styles.label, currentTab === "sodia" && styles.labelActive]}>Feed</Text>
        </TouchableOpacity>

        {/* 2. DISCOVER / VENUES */}
        <TouchableOpacity
          onPress={() => onSelectTab("discover")}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Compass
            size={21}
            color={currentTab === "discover" ? "#E11D48" : "#8E8E93"}
            strokeWidth={currentTab === "discover" ? 2.4 : 1.8}
          />
          <Text style={[styles.label, currentTab === "discover" && styles.labelActive]}>Venues</Text>
        </TouchableOpacity>

        {/* 3. ORIGINAL CENTER CIRCLED (+) POST BUTTON */}
        <View style={styles.centerBtnContainer}>
          <TouchableOpacity
            onPress={onPressCreate}
            activeOpacity={0.85}
            style={styles.centerCircledBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* 4. TRACK (LIFT / MOVE / FOOD / JOURNEY) */}
        <TouchableOpacity
          onPress={() => onSelectTab("track")}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Dumbbell
            size={21}
            color={currentTab === "track" ? "#E11D48" : "#8E8E93"}
            strokeWidth={currentTab === "track" ? 2.4 : 1.8}
          />
          <Text style={[styles.label, currentTab === "track" && styles.labelActive]}>Track</Text>
        </TouchableOpacity>

        {/* 5. WALLET / CARDS */}
        <TouchableOpacity
          onPress={() => onSelectTab("cards")}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <CreditCard
            size={21}
            color={currentTab === "cards" ? "#E11D48" : "#8E8E93"}
            strokeWidth={currentTab === "cards" ? 2.4 : 1.8}
          />
          <Text style={[styles.label, currentTab === "cards" && styles.labelActive]}>Wallet</Text>
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
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 3,
    borderColor: "#09090B",
  },
  label: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  labelActive: {
    color: "#E11D48",
    fontWeight: "800",
  },
});
