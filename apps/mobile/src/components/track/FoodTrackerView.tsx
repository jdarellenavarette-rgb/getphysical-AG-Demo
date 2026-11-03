import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Sparkles, Plus, RotateCcw, Check, Trash2 } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore, type LoggedMeal } from "../../store/trackingStore";
import { askOracleAiFoodGuru, type OracleAnalysisResult } from "../../services/oracleNutritionService";

export function FoodTrackerView() {
  const { colors } = useThemeStore();
  const { foodMeals, hydrationLiters, dailyTargets, saveFoodMeal, deleteFoodMeal, clearFoodMeals, addHydration } = useTrackingStore();
  const [nlpInput, setNlpInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [oracleDraft, setOracleDraft] = useState<OracleAnalysisResult | null>(null);

  const totalCalories = foodMeals.reduce((acc, curr) => acc + curr.totalCal, 0);
  const totalProtein = foodMeals.reduce((acc, curr) => acc + curr.totalP, 0);
  const totalCarbs = foodMeals.reduce((acc, curr) => acc + curr.totalC, 0);
  const totalFat = foodMeals.reduce((acc, curr) => acc + curr.totalF, 0);

  const handleAskOracle = async () => {
    if (!nlpInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await askOracleAiFoodGuru(nlpInput.trim());
      setOracleDraft(res);
    } catch (e) {
      Alert.alert("Oracle AI", "Could not parse meal. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCommitOracleMeal = () => {
    if (!oracleDraft) return;
    saveFoodMeal({
      name: oracleDraft.headline,
      totalCal: oracleDraft.totalCalories,
      totalP: oracleDraft.totalProtein,
      totalC: oracleDraft.totalCarbs,
      totalF: oracleDraft.totalFat,
      items: oracleDraft.items,
      oracleNotes: oracleDraft.guruCommentary,
    });
    setOracleDraft(null);
    setNlpInput("");
    Alert.alert("Logged to Diary!", `${oracleDraft.headline} added to your daily memories.`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. DAILY MACRO TARGETS */}
      <View style={[styles.macroCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.macroHeader}>
          <Text style={[styles.macroTitle, { color: colors.textPrimary }]}>Daily Targets</Text>
          <Text style={styles.macroRemaining}>{Math.max(0, dailyTargets.calories - totalCalories)} kcal left</Text>
        </View>
        <View style={styles.ringsRow}>
          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: colors.textPrimary }]}>{totalCalories}</Text>
            <View style={[styles.progBarTrack, { backgroundColor: colors.borderColor }]}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalCalories / dailyTargets.calories) * 100)}%`, backgroundColor: "#E11D48" }]} />
            </View>
            <Text style={[styles.ringLabel, { color: colors.textMuted }]}>Calories ({dailyTargets.calories})</Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: colors.textPrimary }]}>{totalProtein}g</Text>
            <View style={[styles.progBarTrack, { backgroundColor: colors.borderColor }]}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalProtein / dailyTargets.protein) * 100)}%`, backgroundColor: "#3B82F6" }]} />
            </View>
            <Text style={[styles.ringLabel, { color: colors.textMuted }]}>Protein ({dailyTargets.protein}g)</Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: colors.textPrimary }]}>{totalCarbs}g</Text>
            <View style={[styles.progBarTrack, { backgroundColor: colors.borderColor }]}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalCarbs / dailyTargets.carbs) * 100)}%`, backgroundColor: "#10B981" }]} />
            </View>
            <Text style={[styles.ringLabel, { color: colors.textMuted }]}>Carbs ({dailyTargets.carbs}g)</Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: colors.textPrimary }]}>{totalFat}g</Text>
            <View style={[styles.progBarTrack, { backgroundColor: colors.borderColor }]}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalFat / dailyTargets.fat) * 100)}%`, backgroundColor: "#F59E0B" }]} />
            </View>
            <Text style={[styles.ringLabel, { color: colors.textMuted }]}>Fat ({dailyTargets.fat}g)</Text>
          </View>
        </View>
      </View>

      {/* 2. ORACLE - GEMINI AI FOOD GURU */}
      <View style={[styles.oracleBox, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.oracleTop}>
          <View style={styles.oracleBadge}>
            <Sparkles size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.oracleBadgeText}>ORACLE • GEMINI AI FOOD GURU</Text>
          </View>
          <Text style={[styles.oracleSub, { color: colors.textMuted }]}>Nutritionix Macro Database Engine</Text>
        </View>
        <Text style={[styles.oracleInstruct, { color: colors.textPrimary }]}>
          Type random foods in casual language, Oracle computes the macros:
        </Text>
        <View style={styles.oracleInputRow}>
          <TextInput
            style={[styles.oracleInput, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]}
            placeholder="e.g. 3 eggs, 2 slices toast with butter & a latte"
            placeholderTextColor={colors.textMuted}
            value={nlpInput}
            onChangeText={setNlpInput}
            onSubmitEditing={handleAskOracle}
          />
          <TouchableOpacity onPress={handleAskOracle} disabled={isAnalyzing} style={styles.askOracleBtn}>
            {isAnalyzing ? <ActivityIndicator size="small" color="#FFF" /> : <Sparkles size={18} color="#FFF" />}
          </TouchableOpacity>
        </View>

        {oracleDraft && (
          <View style={[styles.draftResultCard, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
            <View style={styles.draftHeaderRow}>
              <Text style={[styles.draftTitle, { color: colors.textPrimary }]}>{oracleDraft.headline}</Text>
              <Text style={styles.draftCals}>{oracleDraft.totalCalories} kcal</Text>
            </View>
            <Text style={[styles.draftCommentary, { color: colors.textMuted }]}>"{oracleDraft.guruCommentary}"</Text>
            <View style={styles.draftMacrosRow}>
              <Text style={[styles.macroPill, { color: "#3B82F6" }]}>P: {oracleDraft.totalProtein}g</Text>
              <Text style={[styles.macroPill, { color: "#10B981" }]}>C: {oracleDraft.totalCarbs}g</Text>
              <Text style={[styles.macroPill, { color: "#F59E0B" }]}>F: {oracleDraft.totalFat}g</Text>
            </View>
            <View style={styles.draftItemsList}>
              {oracleDraft.items.map((it, idx) => (
                <Text key={idx} style={[styles.draftItemLine, { color: colors.textMuted }]}>
                  • {it.portion} {it.name} ({it.cal} kcal)
                </Text>
              ))}
            </View>
            <TouchableOpacity onPress={handleCommitOracleMeal} style={styles.commitMealBtn}>
              <Check size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.commitMealBtnText}>Log to Daily Diary</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 3. HYDRATION QUICK LOG */}
      <View style={[styles.hydrationCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.hydrationHeader}>
          <Text style={[styles.hydrationTitle, { color: colors.textPrimary }]}>Hydration Target</Text>
          <Text style={styles.hydrationVal}>{hydrationLiters.toFixed(2)} / {dailyTargets.hydration.toFixed(1)} Liters</Text>
        </View>
        <View style={[styles.waterTrack, { backgroundColor: colors.borderColor }]}>
          <View style={[styles.waterFill, { width: `${Math.min(100, (hydrationLiters / dailyTargets.hydration) * 100)}%` }]} />
        </View>
        <View style={styles.hydrationActions}>
          <TouchableOpacity onPress={() => addHydration(0.25)} style={[styles.hydroPill, { backgroundColor: colors.bgCardSecondary }]}>
            <Text style={styles.hydroPillText}>+250ml Glass</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addHydration(0.5)} style={[styles.hydroPill, { backgroundColor: colors.bgCardSecondary }]}>
            <Text style={styles.hydroPillText}>+500ml Shaker</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addHydration(1.0)} style={[styles.hydroPill, { backgroundColor: colors.bgCardSecondary }]}>
            <Text style={styles.hydroPillText}>+1.0L Jug</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. TODAY'S FOOD LOGS & MEMORIES */}
      <View style={[styles.foodHistoryList, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Today's Logged Meals ({foodMeals.length})</Text>
          <TouchableOpacity onPress={clearFoodMeals} style={styles.clearLogsBtn}>
            <RotateCcw size={12} color={colors.textMuted} />
            <Text style={[styles.clearLogsText, { color: colors.textMuted }]}>Clear</Text>
          </TouchableOpacity>
        </View>
        {foodMeals.map((item) => (
          <View key={item.id} style={[styles.foodItemCard, { borderBottomColor: colors.borderColor }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.foodName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.foodMacros, { color: colors.textMuted }]}>P: {item.totalP}g • C: {item.totalC}g • F: {item.totalF}g</Text>
              {item.oracleNotes && <Text style={[styles.foodNotes, { color: colors.textMuted }]}>{item.oracleNotes}</Text>}
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <Text style={styles.foodCals}>{item.totalCal} kcal</Text>
              <TouchableOpacity onPress={() => deleteFoodMeal(item.id)}>
                <Trash2 size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  macroCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  macroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  macroTitle: { fontSize: 16, fontWeight: "800" },
  macroRemaining: { color: "#10B981", fontSize: 12, fontWeight: "700" },
  ringsRow: { flexDirection: "row", justifyContent: "space-between" },
  macroCol: { alignItems: "center", width: "22%" },
  ringVal: { fontSize: 15, fontWeight: "900", marginBottom: 4 },
  progBarTrack: { width: "100%", height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  progBarFill: { height: "100%", borderRadius: 3 },
  ringLabel: { fontSize: 9, fontWeight: "700", textAlign: "center" },
  oracleBox: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  oracleTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  oracleBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(245, 158, 11, 0.12)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  oracleBadgeText: { color: "#F59E0B", fontSize: 10, fontWeight: "900" },
  oracleSub: { fontSize: 10, fontWeight: "700" },
  oracleInstruct: { fontSize: 13, fontWeight: "700", marginBottom: 10 },
  oracleInputRow: { flexDirection: "row", gap: 8 },
  oracleInput: { flex: 1, height: 44, borderRadius: 12, paddingHorizontal: 12, fontSize: 13, borderWidth: 1 },
  askOracleBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#E11D48", justifyContent: "center", alignItems: "center" },
  draftResultCard: { marginTop: 14, borderRadius: 14, borderWidth: 1, padding: 12 },
  draftHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  draftTitle: { fontSize: 15, fontWeight: "800" },
  draftCals: { fontSize: 15, fontWeight: "900", color: "#E11D48" },
  draftCommentary: { fontSize: 12, fontStyle: "italic", marginTop: 4, marginBottom: 8 },
  draftMacrosRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  macroPill: { fontSize: 12, fontWeight: "800" },
  draftItemsList: { gap: 3, marginBottom: 12 },
  draftItemLine: { fontSize: 11 },
  commitMealBtn: { backgroundColor: "#10B981", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10 },
  commitMealBtnText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  hydrationCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  hydrationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  hydrationTitle: { fontSize: 14, fontWeight: "800" },
  hydrationVal: { color: "#3B82F6", fontSize: 12, fontWeight: "700" },
  waterTrack: { width: "100%", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 12 },
  waterFill: { height: "100%", backgroundColor: "#3B82F6", borderRadius: 4 },
  hydrationActions: { flexDirection: "row", justifyContent: "space-between" },
  hydroPill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  hydroPillText: { fontSize: 11, fontWeight: "700", color: "#3B82F6" },
  foodHistoryList: { borderRadius: 18, borderWidth: 1, padding: 16 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  historyTitle: { fontSize: 14, fontWeight: "800" },
  clearLogsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearLogsText: { fontSize: 11, fontWeight: "700" },
  foodItemCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1 },
  foodName: { fontSize: 13, fontWeight: "800" },
  foodMacros: { fontSize: 11, marginTop: 2 },
  foodNotes: { fontSize: 10, fontStyle: "italic", marginTop: 2 },
  foodCals: { fontSize: 13, fontWeight: "800", color: "#E11D48" },
});
