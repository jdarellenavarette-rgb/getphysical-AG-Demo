import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeOutDown, cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Timer } from "lucide-react-native";
import { MIN_TOUCH_TARGET } from "sodia-core";
import { useColors } from "../../../theme/theme";

interface RestTimerPillProps {
  remainingMs: number;
  totalMs: number;
  endsAt: number;
  onAdjust: (deltaSeconds: number) => void;
  onSkip: () => void;
}

function fmt(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Floating Hevy-style rest timer docked above the tab bar. Progress drains on the UI thread. */
export function RestTimerPill({ remainingMs, totalMs, endsAt, onAdjust, onSkip }: RestTimerPillProps) {
  const colors = useColors();
  const progress = useSharedValue(remainingMs / Math.max(1, totalMs));

  // Re-target the linear drain whenever the end time / total changes (±15s).
  useEffect(() => {
    const left = Math.max(0, endsAt - Date.now());
    progress.value = left / Math.max(1, totalMs);
    progress.value = withTiming(0, { duration: left, easing: Easing.linear });
    return () => cancelAnimation(progress);
  }, [endsAt, totalMs, progress]);

  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutDown.duration(160)}
      style={[styles.wrap, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
      accessibilityRole="timer"
      accessibilityLabel={`Rest timer, ${Math.ceil(remainingMs / 1000)} seconds remaining`}
    >
      <View style={[styles.track, { backgroundColor: colors.bgInput }]}>
        <Animated.View style={[styles.bar, { backgroundColor: colors.accentGreen }, barStyle]} />
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => onAdjust(-15)} style={[styles.adj, { backgroundColor: colors.bgInput }]} accessibilityRole="button" accessibilityLabel="Subtract 15 seconds">
          <Text style={[styles.adjText, { color: colors.textPrimary }]}>−15</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Timer size={16} color={colors.accentGreen} />
          <Text style={[styles.time, { color: colors.textPrimary }]}>{fmt(remainingMs)}</Text>
        </View>
        <TouchableOpacity onPress={() => onAdjust(15)} style={[styles.adj, { backgroundColor: colors.bgInput }]} accessibilityRole="button" accessibilityLabel="Add 15 seconds">
          <Text style={[styles.adjText, { color: colors.textPrimary }]}>+15</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkip} style={[styles.skip, { backgroundColor: colors.accent }]} accessibilityRole="button" accessibilityLabel="Skip rest">
          <Text style={[styles.skipText, { color: colors.textOnAccent }]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, bottom: 96, borderRadius: 18, borderWidth: 1, overflow: "hidden", shadowColor: "#000000", shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 14 },
  track: { height: 4 },
  bar: { height: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  center: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  time: { fontSize: 22, fontWeight: "900", fontVariant: ["tabular-nums"] },
  adj: { minWidth: MIN_TOUCH_TARGET + 4, height: MIN_TOUCH_TARGET, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  adjText: { fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  skip: { minWidth: MIN_TOUCH_TARGET + 12, height: MIN_TOUCH_TARGET, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  skipText: { fontSize: 14, fontWeight: "800" },
});
