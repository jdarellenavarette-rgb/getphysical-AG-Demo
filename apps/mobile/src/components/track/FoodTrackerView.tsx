import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Trash2, Utensils } from "lucide-react-native";
import { MIN_TOUCH_TARGET } from "sodia-core";
import { useColors } from "../../theme/theme";
import { useTrackingStore } from "../../store/trackingStore";
import { askOracleAiFoodGuru, type OracleAnalysisResult } from "../../services/oracleNutritionService";
import { toast } from "../../feedback/toastStore";
import { StateCard } from "../states/StateCard";
import { MacroSummaryCard } from "./food/MacroSummaryCard";
import { OracleComposer } from "./food/OracleComposer";
import { HydrationCard } from "./food/HydrationCard";
import { ManualFoodSheet, type ManualFoodEntry } from "./food/ManualFoodSheet";

export function FoodTrackerView() {
  const colors = useColors();
  const { foodMeals, hydrationLiters, dailyTargets, geminiApiKey, saveFoodMeal, deleteFoodMeal, clearFoodMeals, addHydration } = useTrackingStore();
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draft, setDraft] = useState<OracleAnalysisResult | null>(null);
  const [manualName, setManualName] = useState<string | null>(null);

  const totals = foodMeals.reduce(
    (acc, m) => ({ calories: acc.calories + m.totalCal, protein: acc.protein + m.totalP, carbs: acc.carbs + m.totalC, fat: acc.fat + m.totalF }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const analyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    try {
      setDraft(await askOracleAiFoodGuru(input.trim(), geminiApiKey));
    } catch {
      toast.error("Oracle couldn't analyze that", "Check your connection, or add it manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const commit = () => {
    if (!draft) return;
    saveFoodMeal({ name: draft.headline, totalCal: draft.totalCalories, totalP: draft.totalProtein, totalC: draft.totalCarbs, totalF: draft.totalFat, items: draft.items, oracleNotes: draft.guruCommentary });
    toast.success("Logged to diary", draft.headline);
    setDraft(null);
    setInput("");
  };

  const saveManual = (e: ManualFoodEntry) => {
    saveFoodMeal({ name: e.name, totalCal: e.calories, totalP: e.protein, totalC: e.carbs, totalF: e.fat, items: [{ name: e.name, portion: "1 serving", cal: e.calories, p: e.protein, c: e.carbs, f: e.fat }] });
    toast.success("Logged to diary", e.name);
    setManualName(null);
    setDraft(null);
    setInput("");
  };

  const confirmClear = () =>
    Alert.alert("Clear today's diary?", "This removes every meal logged today.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearFoodMeals },
    ]);

  const header = (
    <View style={styles.headerStack}>
      <MacroSummaryCard totals={totals} targets={{ calories: dailyTargets.calories, protein: dailyTargets.protein, carbs: dailyTargets.carbs, fat: dailyTargets.fat }} />
      <OracleComposer input={input} onChangeInput={setInput} onAnalyze={() => { analyze().catch(() => undefined); }} isAnalyzing={isAnalyzing} draft={draft} onCommit={commit} onManualEntry={setManualName} />
      <HydrationCard liters={hydrationLiters} target={dailyTargets.hydration} onAdd={addHydration} />
      <View style={styles.diaryHead}>
        <Text style={[styles.diaryTitle, { color: colors.textPrimary }]} accessibilityRole="header">Diary ({foodMeals.length})</Text>
        {foodMeals.length > 0 && (
          <TouchableOpacity onPress={confirmClear} style={styles.clear} accessibilityRole="button" accessibilityLabel="Clear today's diary">
            <Trash2 size={14} color={colors.danger} />
            <Text style={[styles.clearText, { color: colors.danger }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <FlashList
        data={foodMeals}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={header}
        ListEmptyComponent={<StateCard compact icon={Utensils} title="Nothing logged yet" message="Describe your first meal above, or add it manually." actions={[{ label: "Add it manually", onPress: () => setManualName(""), variant: "secondary" }]} />}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <View style={[styles.meal, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <View style={styles.flex}>
              <Text style={[styles.mealName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.mealMacros, { color: colors.textSecondary }]}>P {item.totalP}g • C {item.totalC}g • F {item.totalF}g</Text>
              {item.oracleNotes ? <Text style={[styles.notes, { color: colors.textMuted }]}>{item.oracleNotes}</Text> : null}
            </View>
            <Text style={[styles.cals, { color: colors.textPrimary }]}>{item.totalCal}</Text>
            <TouchableOpacity onPress={() => deleteFoodMeal(item.id)} style={styles.del} accessibilityRole="button" accessibilityLabel={`Delete ${item.name}`}>
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
      <ManualFoodSheet visible={manualName !== null} initialName={manualName ?? ""} onClose={() => setManualName(null)} onSave={saveManual} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  headerStack: { gap: 14, marginBottom: 10 },
  diaryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  diaryTitle: { fontSize: 17, fontWeight: "900" },
  clear: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: MIN_TOUCH_TARGET, paddingHorizontal: 6 },
  clearText: { fontSize: 13, fontWeight: "700" },
  sep: { height: 8 },
  meal: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingLeft: 12, paddingVertical: 10 },
  flex: { flex: 1, paddingRight: 8 },
  mealName: { fontSize: 14, fontWeight: "800" },
  mealMacros: { fontSize: 12, marginTop: 2 },
  notes: { fontSize: 12, marginTop: 4 },
  cals: { fontSize: 15, fontWeight: "900", fontVariant: ["tabular-nums"] },
  del: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
});
