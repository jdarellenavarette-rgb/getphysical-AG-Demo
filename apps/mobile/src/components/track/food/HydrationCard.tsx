import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Droplet } from "lucide-react-native";
import { MIN_TOUCH_TARGET } from "sodia-core";
import { useColors } from "../../../theme/theme";
import { haptics } from "../../../lib/haptics";

const AMOUNTS = [
  { liters: 0.25, label: "+250 ml" },
  { liters: 0.5, label: "+500 ml" },
  { liters: 1, label: "+1 L" },
] as const;

export function HydrationCard({ liters, target, onAdd }: { liters: number; target: number; onAdd: (l: number) => void }) {
  const colors = useColors();
  const pct = Math.min(100, (liters / Math.max(0.1, target)) * 100);
  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
      <View style={styles.head}>
        <View style={styles.inline}>
          <Droplet size={16} color={colors.info} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Water</Text>
        </View>
        <Text style={[styles.val, { color: colors.info }]}>{liters.toFixed(2)} / {target} L</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.borderColor }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.info }]} />
      </View>
      <View style={styles.actions}>
        {AMOUNTS.map((a) => (
          <TouchableOpacity
            key={a.label}
            onPress={() => {
              haptics.light();
              onAdd(a.liters);
            }}
            style={[styles.pill, { backgroundColor: colors.bgCardSecondary }]}
            accessibilityRole="button"
            accessibilityLabel={`Add ${a.label} of water`}
          >
            <Text style={[styles.pillText, { color: colors.info }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  inline: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 15, fontWeight: "800" },
  val: { fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  track: { height: 8, borderRadius: 4, marginVertical: 10, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  actions: { flexDirection: "row", gap: 8 },
  pill: { flex: 1, minHeight: MIN_TOUCH_TARGET, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pillText: { fontSize: 13, fontWeight: "800" },
});
