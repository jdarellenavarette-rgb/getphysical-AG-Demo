import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Compass, CreditCard, Activity, User } from "lucide-react-native";

export type MobileTab = "sodia" | "discover" | "cards" | "track" | "profile";

interface BottomBarProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
}

export function BottomBar({ currentTab, onSelectTab }: BottomBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onSelectTab("sodia")}
        style={styles.tabItem}
      >
        <Home
          size={20}
          color={currentTab === "sodia" ? "#E11D48" : "#71717A"}
        />
        <Text
          style={[styles.tabLabel, currentTab === "sodia" && styles.tabLabelActive]}
        >
          Sodia
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelectTab("discover")}
        style={styles.tabItem}
      >
        <Compass
          size={20}
          color={currentTab === "discover" ? "#E11D48" : "#71717A"}
        />
        <Text
          style={[styles.tabLabel, currentTab === "discover" && styles.tabLabelActive]}
        >
          Discover
        </Text>
      </TouchableOpacity>

      {/* CENTER ELEVATED FAB: CARDS */}
      <View style={styles.centerFabContainer}>
        <TouchableOpacity
          onPress={() => onSelectTab("cards")}
          style={[
            styles.centerFab,
            currentTab === "cards" && styles.centerFabActive,
          ]}
        >
          <CreditCard size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text
          style={[styles.tabLabel, currentTab === "cards" && styles.tabLabelActive]}
        >
          Cards
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onSelectTab("track")}
        style={styles.tabItem}
      >
        <Activity
          size={20}
          color={currentTab === "track" ? "#E11D48" : "#71717A"}
        />
        <Text
          style={[styles.tabLabel, currentTab === "track" && styles.tabLabelActive]}
        >
          Track
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelectTab("profile")}
        style={styles.tabItem}
      >
        <User
          size={20}
          color={currentTab === "profile" ? "#E11D48" : "#71717A"}
        />
        <Text
          style={[styles.tabLabel, currentTab === "profile" && styles.tabLabelActive]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: "#09090B",
    borderTopWidth: 1,
    borderTopColor: "#18181B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  centerFabContainer: {
    alignItems: "center",
    marginTop: -20,
    flex: 1,
  },
  centerFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#27272A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#09090B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  centerFabActive: {
    backgroundColor: "#E11D48",
  },
  tabLabel: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
  tabLabelActive: {
    color: "#FAFAFA",
    fontWeight: "700",
  },
});
