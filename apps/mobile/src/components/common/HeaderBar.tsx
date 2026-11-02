import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Menu, MessageSquare, Bell, Settings } from "lucide-react-native";

interface HeaderBarProps {
  onOpenMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenInbox?: () => void;
}

export function HeaderBar({
  onOpenMenu,
  onOpenSettings,
  onOpenActivity,
  onOpenInbox,
}: HeaderBarProps) {
  return (
    <View style={styles.container}>
      {/* LEFT: ☰ getphysical */}
      <View style={styles.leftRow}>
        <TouchableOpacity onPress={onOpenMenu} style={styles.menuButton}>
          <Menu size={22} color="#FAFAFA" />
        </TouchableOpacity>
        <Text style={styles.appName}>getphysical</Text>
      </View>

      {/* RIGHT: Chat, Bell, Settings */}
      <View style={styles.rightRow}>
        <TouchableOpacity onPress={onOpenInbox} style={styles.iconButton}>
          <MessageSquare size={20} color="#FAFAFA" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenActivity} style={styles.iconButton}>
          <Bell size={20} color="#FAFAFA" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenSettings} style={styles.iconButton}>
          <Settings size={20} color="#FAFAFA" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    backgroundColor: "#09090B",
    zIndex: 30,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuButton: {
    padding: 6,
  },
  appName: {
    color: "#FAFAFA",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 4,
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EC4899",
  },
});