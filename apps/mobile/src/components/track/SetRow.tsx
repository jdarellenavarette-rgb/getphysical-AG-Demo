import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Check } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { LoggedSet } from "../../store/trackingStore";

interface SetRowProps {
  set: LoggedSet;
  onChange: (patch: Partial<Pick<LoggedSet, "weight" | "reps">>) => void;
  onToggle: () => void;
}

/** Keeps what was typed (e.g. "62.") while handing the parent a clean number. */
function useNumberField(initial: number, commit: (value: number) => void, decimals: boolean) {
  const [text, setText] = useState(String(initial));
  const onChangeText = (raw: string) => {
    const cleaned = decimals ? raw.replace(",", ".").replace(/[^\d.]/g, "") : raw.replace(/\D/g, "");
    setText(cleaned);
    const value = decimals ? parseFloat(cleaned) : parseInt(cleaned, 10);
    commit(Number.isFinite(value) ? value : 0);
  };
  return { text, onChangeText };
}

/** One set in the workout table: number, typed weight, typed reps, and a large tick. */
export function SetRow({ set, onChange, onToggle }: SetRowProps) {
  const { colors } = useThemeStore();
  const weight = useNumberField(set.weight, (value) => onChange({ weight: value }), true);
  const reps = useNumberField(set.reps, (value) => onChange({ reps: value }), false);
  const done = set.isCompleted;

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.bgInput, color: colors.textPrimary },
    done && { backgroundColor: "transparent" },
  ];

  return (
    <View style={[styles.row, done && { backgroundColor: "rgba(16,185,129,0.12)" }]}>
      <Text style={[styles.setNumber, { color: colors.textMuted }]}>{set.setNumber}</Text>
      <TextInput
        value={weight.text}
        onChangeText={weight.onChangeText}
        keyboardType="decimal-pad"
        selectTextOnFocus
        maxLength={6}
        style={inputStyle}
        accessibilityLabel={`Set ${set.setNumber} weight in kilograms`}
      />
      <TextInput
        value={reps.text}
        onChangeText={reps.onChangeText}
        keyboardType="number-pad"
        selectTextOnFocus
        maxLength={3}
        style={inputStyle}
        accessibilityLabel={`Set ${set.setNumber} reps`}
      />
      <TouchableOpacity
        onPress={onToggle}
        style={[
          styles.check,
          { borderColor: colors.borderColor, backgroundColor: colors.bgInput },
          done && { backgroundColor: colors.accentGreen, borderColor: colors.accentGreen },
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`Set ${set.setNumber} done`}
      >
        <Check size={20} color={done ? "#FFFFFF" : colors.textMuted} strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
}

/** Column headings that line up with the rows above. */
export function SetTableHeader() {
  const { colors } = useThemeStore();
  const label = [styles.headerLabel, { color: colors.textMuted }];
  return (
    <View style={styles.headerRow}>
      <Text style={[label, styles.headerSet]}>SET</Text>
      <Text style={[label, styles.headerCell]}>KG</Text>
      <Text style={[label, styles.headerCell]}>REPS</Text>
      <View style={styles.checkSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 6, marginBottom: 2 },
  headerLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6, textAlign: "center" },
  headerCell: { flex: 1 },
  headerSet: { width: 32 },
  setNumber: { width: 32, textAlign: "center", fontSize: 15, fontWeight: "800" },
  input: {
    flex: 1,
    // Lets the two fields share the row evenly instead of keeping their intrinsic width.
    minWidth: 0,
    height: 44,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    paddingVertical: 0,
  },
  check: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkSpacer: { width: 44 },
});
