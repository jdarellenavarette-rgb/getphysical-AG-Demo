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
        <TouchableOpacity
          onPress={onOpenMenu}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.menuButton}
        >
          <Menu size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text style={styles.appName}>getphysical</Text>
      </View>

      {/* RIGHT: Chat, Bell, Settings */}
      <View style={styles.rightRow}>
        <TouchableOpacity
          onPress={onOpenInbox}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          style={styles.iconButton}
        >
          <MessageSquare size={22} color="#FAFAFA" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenActivity}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          style={styles.iconButton}
        >
          <Bell size={22} color="#FAFAFA" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenSettings}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          style={styles.iconButton}
        >
          <Settings size={22} color="#FAFAFA" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#09090B",
    zIndex: 30,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    color: "#FAFAFA",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EC4899",
  },
});