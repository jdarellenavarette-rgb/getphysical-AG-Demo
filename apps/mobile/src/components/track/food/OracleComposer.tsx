import React from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Check, Sparkles } from "lucide-react-native";
import { createNoSearchResultsState, createSuccessState, MIN_TOUCH_TARGET } from "sodia-core";
import { useColors } from "../../../theme/theme";
import { TenStateView } from "../../common/TenStateView";
import type { OracleAnalysisResult } from "../../../services/oracleNutritionService";

interface OracleComposerProps {
  input: string;
  onChangeInput: (v: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  draft: OracleAnalysisResult | null;
  onCommit: () => void;
  onManualEntry: (name: string) => void;
}

export function OracleComposer({ input, onChangeInput, onAnalyze, isAnalyzing, draft, onCommit, onManualEntry }: OracleComposerProps) {
  const colors = useColors();
  const unmatched = draft?.unmatched ?? [];
  const draftState = draft
    ? draft.items.length === 0
      ? createNoSearchResultsState<OracleAnalysisResult>(input, [], [], true)
      : createSuccessState(draft)
    : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
      <View style={styles.badge}>
        <Sparkles size={14} color={colors.warning} fill={colors.warning} />
        <Text style={[styles.badgeText, { color: colors.warning }]}>ORACLE</Text>
      </View>
      <Text style={[styles.instruct, { color: colors.textPrimary }]}>Describe what you ate — Oracle works out the macros.</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]}
          placeholder="e.g. 3 eggs, 2 toast with butter, latte"
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={onChangeInput}
          onSubmitEditing={onAnalyze}
          returnKeyType="search"
          accessibilityLabel="Describe your meal"
        />
        <TouchableOpacity
          onPress={onAnalyze}
          disabled={isAnalyzing || !input.trim()}
          style={[styles.ask, { backgroundColor: colors.accent }, (!input.trim() || isAnalyzing) && styles.dim]}
          accessibilityRole="button"
          accessibilityLabel="Analyze meal"
          accessibilityState={{ busy: isAnalyzing, disabled: isAnalyzing || !input.trim() }}
        >
          {isAnalyzing ? <ActivityIndicator size="small" color={colors.textOnAccent} /> : <Sparkles size={18} color={colors.textOnAccent} />}
        </TouchableOpacity>
      </View>

      {draftState ? (
        <TenStateView state={draftState} compact onManualEntry={() => onManualEntry(input.trim())} manualEntryLabel="Add it manually" onClearSearch={() => onChangeInput("")}>
          {(d) => (
            <View style={[styles.draft, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <View style={styles.draftHead}>
                <Text style={[styles.draftTitle, { color: colors.textPrimary }]}>{d.headline}</Text>
                <Text style={[styles.draftCals, { color: colors.accentText }]}>{d.totalCalories} kcal</Text>
              </View>
              <Text style={[styles.macros, { color: colors.textSecondary }]}>P {d.totalProtein}g • C {d.totalCarbs}g • F {d.totalFat}g</Text>
              {d.items.map((it) => (
                <Text key={`${it.name}_${it.portion}`} style={[styles.line, { color: colors.textMuted }]}>
                  • {it.portion} {it.name} ({it.cal} kcal)
                </Text>
              ))}
              {unmatched.length > 0 && (
                <TouchableOpacity onPress={() => onManualEntry(unmatched[0] ?? "")} style={styles.unmatched} accessibilityRole="button">
                  <Text style={[styles.unmatchedText, { color: colors.warning }]}>
                    Didn't recognise "{unmatched.join('", "')}" — add it manually
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onCommit} style={[styles.commit, { backgroundColor: colors.accentGreen }]} accessibilityRole="button">
                <Check size={16} color={colors.textOnAccent} />
                <Text style={[styles.commitText, { color: colors.textOnAccent }]}>Log to diary</Text>
              </TouchableOpacity>
            </View>
          )}
        </TenStateView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6 },
  badgeText: { fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  instruct: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  inputRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  input: { flex: 1, minHeight: MIN_TOUCH_TARGET, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 14 },
  ask: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dim: { opacity: 0.5 },
  draft: { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 12 },
  draftHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  draftTitle: { fontSize: 15, fontWeight: "800", flex: 1 },
  draftCals: { fontSize: 15, fontWeight: "900" },
  macros: { fontSize: 13, fontWeight: "700", marginVertical: 6 },
  line: { fontSize: 12, marginTop: 2 },
  unmatched: { minHeight: MIN_TOUCH_TARGET, justifyContent: "center" },
  unmatchedText: { fontSize: 13, fontWeight: "700" },
  commit: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 48, borderRadius: 12, marginTop: 10 },
  commitText: { fontSize: 14, fontWeight: "800" },
});
