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
    <View style={styles.header}>
      {/* BRAND & DRAWER MENU */}
      <View style={styles.leftGroup}>
        <TouchableOpacity
          onPress={onOpenMenu}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.menuIconBtn}
        >
          <Menu size={22} color="#FAFAFA" strokeWidth={2.2} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onPressLogo} style={styles.logoTouch}>
          <Text style={styles.brandTitle}>
            getphysical<Text style={styles.brandDot}>.</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.rightGroup}>
        <TouchableOpacity
          onPress={onPressCreate}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.createPill}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenInbox}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconCircle}
        >
          <MessageSquare size={19} color="#FAFAFA" strokeWidth={2} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenActivity}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconCircle}
        >
          <Bell size={19} color="#FAFAFA" strokeWidth={2} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenSettings}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconCircle}
        >
          <Settings size={19} color="#A1A1AA" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#09090B",
    zIndex: 40,
  },
  leftGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuIconBtn: { minWidth: 40, minHeight: 40, alignItems: "center", justifyContent: "center" },
  logoTouch: { paddingVertical: 4 },
  brandTitle: { color: "#FFFFFF", fontSize: 21, fontWeight: "900", letterSpacing: -0.6 },
  brandDot: { color: "#E11D48" },
  rightGroup: { flexDirection: "row", alignItems: "center", gap: 4 },
  createPill: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center", marginRight: 4 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", position: "relative" },
  notificationDot: { position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#E11D48", borderWidth: 1.5, borderColor: "#09090B" },
});
