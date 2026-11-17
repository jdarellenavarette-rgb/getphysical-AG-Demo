import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Optional single action that fills the screen. */
  actionLabel?: string;
  onAction?: () => void;
  /** Tighter spacing when shown inside a card rather than a whole screen. */
  compact?: boolean;
}

/** The one empty state used across the app: icon, one line of explanation, at most one action. */
export function EmptyState({ icon: Icon, title, body, actionLabel, onAction, compact = false }: EmptyStateProps) {
  const { colors } = useThemeStore();
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accentMuted }]}>
        <Icon size={26} color={colors.accent} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{body}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.action, { backgroundColor: colors.accent }]}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: 32, paddingVertical: 56 },
  wrapCompact: { paddingVertical: 28 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", marginTop: 16, textAlign: "center" },
  body: { fontSize: 14, lineHeight: 20, marginTop: 6, textAlign: "center" },
  action: {
    marginTop: 20,
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
