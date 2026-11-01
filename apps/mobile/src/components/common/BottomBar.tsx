import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MapPin, BarChart2, Plus, Wallet, User } from "lucide-react-native";

export type MobileTab = "sodia" | "discover" | "cards" | "track" | "profile";

interface BottomBarProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onPressCreate?: () => void;
}

export function BottomBar({ currentTab, onSelectTab, onPressCreate }: BottomBarProps) {
  return (
    <View style={styles.dockWrapper}>
      <View style={styles.capsuleDock}>
        {/* TAB 1: DISCOVER / MAP */}
        <TouchableOpacity
          onPress={() => onSelectTab("discover")}
          style={styles.dockItem}
        >
          <MapPin
            size={20}
            color={currentTab === "discover" ? "#EC4899" : "#A1A1AA"}
          />
        </TouchableOpacity>

        {/* TAB 2: JOURNEY / TRACK */}
        <TouchableOpacity
          onPress={() => onSelectTab("track")}
          style={styles.dockItem}
        >
          <BarChart2
            size={20}
            color={currentTab === "track" ? "#EC4899" : "#A1A1AA"}
          />
        </TouchableOpacity>

        {/* CENTER ELEVATED GRADIENT FAB (+) */}
        <View style={styles.centerFabAnchor}>
          <TouchableOpacity
            onPress={onPressCreate ? onPressCreate : () => onSelectTab("sodia")}
            style={styles.centerFab}
          >
            <Plus size={22} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* TAB 3: VIP CARDS & WALLET */}
        <TouchableOpacity
          onPress={() => onSelectTab("cards")}
          style={styles.dockItem}
        >
          <Wallet
            size={20}
            color={currentTab === "cards" ? "#EC4899" : "#A1A1AA"}
          />
        </TouchableOpacity>

        {/* TAB 4: PROFILE */}
        <TouchableOpacity
          onPress={() => onSelectTab("profile")}
          style={styles.dockItem}
        >
          <User
            size={20}
            color={currentTab === "profile" ? "#EC4899" : "#A1A1AA"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  capsuleDock: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    backgroundColor: "rgba(28, 28, 30, 0.96)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  dockItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerFabAnchor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EC4899",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    borderWidth: 4,
    borderColor: "#09090B",
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});
