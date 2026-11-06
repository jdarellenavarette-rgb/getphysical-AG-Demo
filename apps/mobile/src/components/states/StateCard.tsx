import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Clock, WifiOff, type LucideIcon } from "lucide-react-native";
import { MIN_TOUCH_TARGET, RADII, SPACING, TYPE_SCALE } from "sodia-core";
import { useColors } from "../../theme/theme";

export interface StateAction {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: "primary" | "secondary";
  readonly icon?: LucideIcon;
}

interface StateCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  message?: string;
  /** Rendered small & selectable under the message (e.g. correlation code). */
  footnote?: string;
  actions?: readonly StateAction[];
  children?: React.ReactNode;
  compact?: boolean;
}

/** Centered illustration + 1-line explanation + CTA(s) — shared by empty/error/permission states. */
export function StateCard({ icon: Icon, iconColor, title, message, footnote, actions = [], children, compact }: StateCardProps) {
  const colors = useColors();
  return (
    <View style={[styles.center, compact && styles.compact]} accessibilityRole="summary">
      <View style={[styles.iconHalo, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
        <Icon size={32} color={iconColor ?? colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">
        {title}
      </Text>
      {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
      {footnote ? (
        <Text selectable style={[styles.footnote, { color: colors.textMuted }]}>
          {footnote}
        </Text>
      ) : null}
      {children}
      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((a) => {
            const primary = (a.variant ?? "primary") === "primary";
            const ActionIcon = a.icon;
            const fg = primary ? colors.textOnAccent : colors.textPrimary;
            return (
              <TouchableOpacity
                key={a.label}
                onPress={a.onPress}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                style={[
                  styles.btn,
                  primary
                    ? { backgroundColor: colors.accent }
                    : { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor, borderWidth: 1 },
                ]}
              >
                {ActionIcon ? <ActionIcon size={16} color={fg} /> : null}
                <Text style={[styles.btnText, { color: fg }]}>{a.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/** Thin persistent banner for degraded connectivity (no_internet / slow_network). */
export function NetworkBanner({ kind, detail }: { kind: "offline" | "slow"; detail: string }) {
  const colors = useColors();
  const Icon = kind === "offline" ? WifiOff : Clock;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: colors.bgCard, borderBottomColor: colors.warning }]}
    >
      <Icon size={16} color={colors.warning} />
      <Text style={[styles.bannerText, { color: colors.textPrimary }]} numberOfLines={2}>
        {detail}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, minHeight: 320, justifyContent: "center", alignItems: "center", padding: SPACING.xxl },
  compact: { flex: 0, minHeight: 0, paddingVertical: SPACING.xxxl },
  iconHalo: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { ...TYPE_SCALE.title, fontWeight: "800", marginTop: SPACING.lg, textAlign: "center" },
  message: { ...TYPE_SCALE.body, marginTop: SPACING.sm, textAlign: "center", maxWidth: 300 },
  footnote: { ...TYPE_SCALE.caption, marginTop: SPACING.sm, fontVariant: ["tabular-nums"] },
  actions: { marginTop: SPACING.xl, gap: SPACING.sm, alignItems: "stretch", minWidth: 220 },
  btn: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADII.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  btnText: { ...TYPE_SCALE.body, fontWeight: "700" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 2,
  },
  bannerText: { ...TYPE_SCALE.footnote, fontWeight: "600", flexShrink: 1 },
});
