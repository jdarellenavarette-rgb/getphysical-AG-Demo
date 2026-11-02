import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Compass, Dumbbell, Wallet, User } from "lucide-react-native";

export type MobileTab = "sodia" | "discover" | "track" | "cards" | "profile";

interface BottomBarProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onPressCreate?: () => void;
}

export function BottomBar({ currentTab, onSelectTab }: BottomBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.dockWrapper, { bottom: bottomOffset }]}>
      <View style={styles.capsuleDock}>
        {/* TAB 1: SOCIAL FEED (SODIA) */}
        <TouchableOpacity
          onPress={() => onSelectTab("sodia")}
          style={styles.dockItem}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Home
            size={22}
            color={currentTab === "sodia" ? "#EC4899" : "#A1A1AA"}
          />
          <Text style={[styles.tabLabel, currentTab === "sodia" && styles.tabLabelActive]}>
            Feed
          </Text>
        </TouchableOpacity>

        {/* TAB 2: DISCOVER / VENUES */}
        <TouchableOpacity
          onPress={() => onSelectTab("discover")}
          style={styles.dockItem}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Compass
            size={22}
            color={currentTab === "discover" ? "#EC4899" : "#A1A1AA"}
          />
          <Text style={[styles.tabLabel, currentTab === "discover" && styles.tabLabelActive]}>
            Venues
          </Text>
        </TouchableOpacity>

        {/* TAB 3: TRACK HUB (LIFT / MOVE / FOOD) */}
        <TouchableOpacity
          onPress={() => onSelectTab("track")}
          style={styles.dockItem}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Dumbbell
            size={22}
            color={currentTab === "track" ? "#EC4899" : "#A1A1AA"}
          />
          <Text style={[styles.tabLabel, currentTab === "track" && styles.tabLabelActive]}>
            Track
          </Text>
        </TouchableOpacity>

        {/* TAB 4: VIP CARDS & WALLET */}
        <TouchableOpacity
          onPress={() => onSelectTab("cards")}
          style={styles.dockItem}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Wallet
            size={22}
            color={currentTab === "cards" ? "#EC4899" : "#A1A1AA"}
          />
          <Text style={[styles.tabLabel, currentTab === "cards" && styles.tabLabelActive]}>
            Cards
          </Text>
        </TouchableOpacity>

        {/* TAB 5: ATHLETE PROFILE */}
        <TouchableOpacity
          onPress={() => onSelectTab("profile")}
          style={styles.dockItem}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <User
            size={22}
            color={currentTab === "profile" ? "#EC4899" : "#A1A1AA"}
          />
          <Text style={[styles.tabLabel, currentTab === "profile" && styles.tabLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: "absolute",
    left: 14,
    right: 14,
    zIndex: 50,
  },
  capsuleDock: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "rgba(24, 24, 27, 0.96)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  dockItem: {
    flex: 1,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },
  tabLabelActive: {
    color: "#EC4899",
  },
});