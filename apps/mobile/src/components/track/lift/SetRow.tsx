import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check, Minus, Plus } from "lucide-react-native";
import { MIN_TOUCH_TARGET } from "sodia-core";
import { useColors } from "../../../theme/theme";
import type { LoggedSet } from "../../../store/trackingStore";

interface SetRowProps {
  set: LoggedSet;
  index: number;
  onAdjustWeight: (idx: number, delta: number) => void;
  onAdjustReps: (idx: number, delta: number) => void;
  onToggle: (idx: number) => void;
}

function Stepper({ label, value, onDec, onInc }: { label: string; value: string; onDec: () => void; onInc: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.stepper} accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ text: value }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => (e.nativeEvent.actionName === "increment" ? onInc() : onDec())}
    >
      <TouchableOpacity onPress={onDec} style={[styles.stepBtn, { backgroundColor: colors.bgInput }]} hitSlop={6} importantForAccessibility="no">
        <Minus size={14} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      <TouchableOpacity onPress={onInc} style={[styles.stepBtn, { backgroundColor: colors.bgInput }]} hitSlop={6} importantForAccessibility="no">
        <Plus size={14} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

function SetRowImpl({ set, index, onAdjustWeight, onAdjustReps, onToggle }: SetRowProps) {
  const colors = useColors();
  const done = set.isCompleted;
  return (
    <View style={[styles.row, { backgroundColor: done ? colors.accentGreenMuted : colors.bgCardSecondary }]}>
      <Text style={[styles.setNo, { color: colors.textMuted }]}>{set.setNumber}</Text>
      <Stepper label={`Set ${set.setNumber} weight`} value={`${set.weight} kg`} onDec={() => onAdjustWeight(index, -2.5)} onInc={() => onAdjustWeight(index, 2.5)} />
      <Stepper label={`Set ${set.setNumber} reps`} value={`${set.reps}`} onDec={() => onAdjustReps(index, -1)} onInc={() => onAdjustReps(index, 1)} />
      <TouchableOpacity
        onPress={() => onToggle(index)}
        style={[styles.check, { borderColor: done ? colors.accentGreen : colors.borderColor, backgroundColor: done ? colors.accentGreen : "transparent" }]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`Complete set ${set.setNumber}`}
      >
        {done && <Check size={18} color={colors.textOnAccent} strokeWidth={3} />}
      </TouchableOpacity>
    </View>
  );
}

export const SetRow = memo(SetRowImpl);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingVertical: 6, paddingHorizontal: 10, gap: 8, marginHorizontal: 16 },
  setNo: { width: 20, fontSize: 14, fontWeight: "900", textAlign: "center" },
  stepper: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  value: { fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  check: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
