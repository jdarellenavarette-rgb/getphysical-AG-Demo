import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors, type ColorPalette } from "../../../theme/theme";

export interface MacroTotals {
  readonly calories: number;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
}

interface MacroSummaryCardProps {
  totals: MacroTotals;
  targets: MacroTotals;
}

function macroRows(t: MacroTotals, g: MacroTotals, c: ColorPalette) {
  return [
    { key: "cal", label: "Calories", value: t.calories, target: g.calories, unit: "", color: c.accent },
    { key: "p", label: "Protein", value: t.protein, target: g.protein, unit: "g", color: c.info },
    { key: "c", label: "Carbs", value: t.carbs, target: g.carbs, unit: "g", color: c.accentGreen },
    { key: "f", label: "Fat", value: t.fat, target: g.fat, unit: "g", color: c.warning },
  ] as const;
}

/** MyFitnessPal-style "Remaining = Goal − Food" header with per-macro bars. */
export function MacroSummaryCard({ totals, targets }: MacroSummaryCardProps) {
  const colors = useColors();
  const remaining = Math.max(0, targets.calories - totals.calories);
  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">Today</Text>
        <Text style={[styles.remaining, { color: colors.accentGreen }]}>{remaining} kcal left</Text>
      </View>
      <Text style={[styles.equation, { color: colors.textMuted }]}>
        {targets.calories} goal − {totals.calories} food = {remaining}
      </Text>
      <View style={styles.row}>
        {macroRows(totals, targets, colors).map((m) => {
          const pct = Math.min(100, (m.value / Math.max(1, m.target)) * 100);
          return (
            <View key={m.key} style={styles.col} accessible accessibilityLabel={`${m.label}: ${m.value}${m.unit} of ${m.target}${m.unit}`}>
              <Text style={[styles.val, { color: colors.textPrimary }]}>{Math.round(m.value)}{m.unit}</Text>
              <View style={[styles.track, { backgroundColor: colors.borderColor }]}>
                <View style={[styles.fill, { width: `${pct}%`, backgroundColor: m.color }]} />
              </View>
              <Text style={[styles.label, { color: colors.textMuted }]}>{m.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "900" },
  remaining: { fontSize: 15, fontWeight: "900", fontVariant: ["tabular-nums"] },
  equation: { fontSize: 12, marginTop: 2, fontVariant: ["tabular-nums"] },
  row: { flexDirection: "row", gap: 10, marginTop: 14 },
  col: { flex: 1 },
  val: { fontSize: 15, fontWeight: "800", fontVariant: ["tabular-nums"] },
  track: { height: 6, borderRadius: 3, marginVertical: 6, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  label: { fontSize: 11, fontWeight: "600" },
});
