import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Menu, MessageSquare, Bell, Settings, type LucideIcon } from "lucide-react-native";
import { MIN_TOUCH_TARGET } from "sodia-core";
import { useThemeStore } from "../../theme/theme";
import { useCrmMessagingStore } from "../../store/crmMessagingStore";

interface HeaderBarProps {
  onOpenMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenInbox?: () => void;
  onPressLogo?: () => void;
}

interface HeaderAction {
  readonly key: string;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly onPress?: () => void;
  readonly dot: boolean;
  readonly muted?: boolean;
}

export function HeaderBar({ onOpenMenu, onOpenSettings, onOpenActivity, onOpenInbox, onPressLogo }: HeaderBarProps) {
  const { colors } = useThemeStore();
  const threads = useCrmMessagingStore((s) => s.threads);
  const unreadCount = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  const actions: readonly HeaderAction[] = [
    {
      key: "inbox",
      icon: MessageSquare,
      label: unreadCount > 0 ? `Messages, ${unreadCount} unread` : "Messages",
      onPress: onOpenInbox,
      dot: unreadCount > 0,
    },
    { key: "activity", icon: Bell, label: "Activity, new notifications", onPress: onOpenActivity, dot: true },
    { key: "settings", icon: Settings, label: "Settings", onPress: onOpenSettings, dot: false, muted: true },
  ];

  return (
    <View style={[styles.header, { backgroundColor: colors.bgHeader, borderBottomColor: colors.borderColor }]}>
      <View style={styles.leftGroup}>
        <TouchableOpacity onPress={onOpenMenu} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Open menu">
          <Menu size={22} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressLogo}
          style={styles.logoTouch}
          accessibilityRole="button"
          accessibilityLabel="getphysical, go to feed"
        >
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
            getphysical<Text style={{ color: colors.accent }}>.</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightGroup}>
        {actions.map(({ key, icon: Icon, label, onPress, dot, muted }) => (
          <TouchableOpacity key={key} onPress={onPress} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={label}>
            <Icon size={20} color={muted ? colors.textSecondary : colors.textPrimary} strokeWidth={2} />
            {dot ? <View style={[styles.notificationDot, { borderColor: colors.bgHeader, backgroundColor: colors.accent }]} /> : null}
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    zIndex: 40,
  },
  leftGroup: { flexDirection: "row", alignItems: "center", gap: 2 },
  logoTouch: { minHeight: MIN_TOUCH_TARGET, justifyContent: "center", paddingHorizontal: 4 },
  brandTitle: { fontSize: 21, fontWeight: "900", letterSpacing: -0.6 },
  rightGroup: { flexDirection: "row", alignItems: "center" },
  iconBtn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },
});
