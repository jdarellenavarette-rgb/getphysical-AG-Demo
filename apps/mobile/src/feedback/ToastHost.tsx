import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from "lucide-react-native";
import { MIN_TOUCH_TARGET, RADII, SPACING, TYPE_SCALE } from "sodia-core";
import { useColors, type ColorPalette } from "../theme/theme";
import { useToastStore, type ToastMessage, type ToastTone } from "./toastStore";

const TONE_ICON: Record<ToastTone, LucideIcon> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

function toneColor(tone: ToastTone, colors: ColorPalette): string {
  if (tone === "success") return colors.accentGreen;
  if (tone === "warning") return colors.warning;
  if (tone === "error") return colors.danger;
  return colors.info;
}

function ToastCard({ item }: { item: ToastMessage }) {
  const colors = useColors();
  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = TONE_ICON[item.tone];
  const tint = toneColor(item.tone, colors);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(item.id), item.durationMs);
    return () => clearTimeout(timer);
  }, [dismiss, item.id, item.durationMs]);

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(18)}
      exiting={FadeOutUp.duration(180)}
      layout={LinearTransition}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor, borderLeftColor: tint }]}
    >
      <Icon size={20} color={tint} />
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.message ? (
          <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={3}>
            {item.message}
          </Text>
        ) : null}
      </View>
      {item.action ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={item.action.label}
          onPress={() => {
            item.action?.onPress();
            dismiss(item.id);
          }}
          style={styles.actionBtn}
        >
          <Text style={[styles.actionText, { color: colors.accentText }]}>{item.action.label}</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
        onPress={() => dismiss(item.id)}
        style={styles.closeBtn}
      >
        <X size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

/** Mounted once at the root; renders the toast queue above every screen and sheet. */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const queue = useToastStore((s) => s.queue);

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + SPACING.sm }]}>
      {queue.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: "absolute", left: SPACING.lg, right: SPACING.lg, zIndex: 1000, elevation: 1000, gap: SPACING.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingLeft: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  textCol: { flex: 1, paddingVertical: SPACING.xs },
  title: { ...TYPE_SCALE.body, fontWeight: "700" },
  message: { ...TYPE_SCALE.footnote, marginTop: 2 },
  actionBtn: { minHeight: MIN_TOUCH_TARGET, justifyContent: "center", paddingHorizontal: SPACING.xs },
  actionText: { ...TYPE_SCALE.body, fontWeight: "800" },
  closeBtn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
});
