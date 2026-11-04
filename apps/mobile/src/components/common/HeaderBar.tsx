import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Menu, MessageSquare, Bell, Settings } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useCrmMessagingStore } from "../../store/crmMessagingStore";

interface HeaderBarProps {
  onOpenMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenInbox?: () => void;
  onPressLogo?: () => void;
}

export function HeaderBar({
  onOpenMenu,
  onOpenSettings,
  onOpenActivity,
  onOpenInbox,
  onPressLogo,
}: HeaderBarProps) {
  const { colors } = useThemeStore();
  const { threads } = useCrmMessagingStore();
  const unreadCount = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  return (
    <View style={[styles.header, { backgroundColor: colors.bgHeader, borderBottomColor: colors.borderColor }]}>
      {/* BRAND & DRAWER MENU */}
      <View style={styles.leftGroup}>
        <TouchableOpacity
          onPress={onOpenMenu}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.menuIconBtn}
        >
          <Menu size={22} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onPressLogo} style={styles.logoTouch}>
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
            getphysical<Text style={styles.brandDot}>.</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS: DM, NOTIFICATIONS, SETTINGS */}
      <View style={styles.rightGroup}>
        <TouchableOpacity
          onPress={onOpenInbox}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconCircle}
        >
          <MessageSquare size={19} color={colors.textPrimary} strokeWidth={2} />
          {unreadCount > 0 && <View style={[styles.notificationDot, { borderColor: colors.bgHeader }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenActivity}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconCircle}
        >
          <Bell size={19} color={colors.textPrimary} strokeWidth={2} />
          <View style={[styles.notificationDot, { borderColor: colors.bgHeader }]} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenSettings}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconCircle}
        >
          <Settings size={19} color={colors.textSecondary} strokeWidth={2} />
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
    borderBottomWidth: 1,
    zIndex: 40,
  },
  leftGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuIconBtn: { minWidth: 40, minHeight: 40, alignItems: "center", justifyContent: "center" },
  logoTouch: { paddingVertical: 4 },
  brandTitle: { fontSize: 21, fontWeight: "900", letterSpacing: -0.6 },
  brandDot: { color: "#E11D48" },
  rightGroup: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", position: "relative" },
  notificationDot: { position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#E11D48", borderWidth: 1.5 },
});
