import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Menu, MessageSquare, Bell, Settings, Plus } from "lucide-react-native";

interface HeaderBarProps {
  onOpenMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenInbox?: () => void;
  onPressLogo?: () => void;
  onPressCreate?: () => void;
}

export function HeaderBar({
  onOpenMenu,
  onOpenSettings,
  onOpenActivity,
  onOpenInbox,
  onPressLogo,
  onPressCreate,
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
        <TouchableOpacity
          onPress={onPressLogo}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
        >
          <Text style={styles.appName}>getphysical</Text>
        </TouchableOpacity>
      </View>

      {/* RIGHT: Create (+), Chat, Bell, Settings */}
      <View style={styles.rightRow}>
        <TouchableOpacity
          onPress={onPressCreate}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.createButton}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenInbox}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconButton}
        >
          <MessageSquare size={21} color="#FAFAFA" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenActivity}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconButton}
        >
          <Bell size={21} color="#FAFAFA" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenSettings}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconButton}
        >
          <Settings size={21} color="#FAFAFA" />
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
    minWidth: 40,
    minHeight: 40,
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
    gap: 4,
  },
  createButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E11D48",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  iconButton: {
    minWidth: 38,
    minHeight: 38,
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