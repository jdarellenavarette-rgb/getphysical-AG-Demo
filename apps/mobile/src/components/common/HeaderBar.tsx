import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Menu, MessageSquare, Bell, Settings } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useCrmMessagingStore } from "../../store/crmMessagingStore";

interface HeaderBarProps {
  onOpenMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenInbox?: () => void;
  onPressLogo?: () => void;
  /** Shows the dot on the bell until the activity screen has been opened. */
  hasUnseenActivity?: boolean;
}

export function HeaderBar({
  onOpenMenu,
  onOpenSettings,
  onOpenActivity,
  onOpenInbox,
  onPressLogo,
  hasUnseenActivity = false,
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
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <Menu size={22} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPressLogo}
          style={styles.logoTouch}
          accessibilityRole="button"
          accessibilityLabel="GetPhysical, go to feed"
        >
          {/* One white-on-clear file, tinted to suit the light or dark header. */}
          <Image
            source={require("../../../assets/brand/gp_wordmark.png")}
            style={[styles.wordmark, { tintColor: colors.textPrimary }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS: DM, NOTIFICATIONS, SETTINGS */}
      <View style={styles.rightGroup}>
        <TouchableOpacity
          onPress={onOpenInbox}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconCircle}
          accessibilityRole="button"
          accessibilityLabel="Messages"
        >
          <MessageSquare size={19} color={colors.textPrimary} strokeWidth={2} />
          {unreadCount > 0 && <View style={[styles.notificationDot, { borderColor: colors.bgHeader }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenActivity}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconCircle}
          accessibilityRole="button"
          accessibilityLabel="Activity"
        >
          <Bell size={19} color={colors.textPrimary} strokeWidth={2} />
          {hasUnseenActivity && <View style={[styles.notificationDot, { borderColor: colors.bgHeader }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenSettings}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.iconCircle}
          accessibilityRole="button"
          accessibilityLabel="Settings"
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
  logoTouch: { paddingVertical: 9 },
  wordmark: { width: 135, height: 22 },
  rightGroup: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#E11D48",
    borderWidth: 1.5,
  },
});
