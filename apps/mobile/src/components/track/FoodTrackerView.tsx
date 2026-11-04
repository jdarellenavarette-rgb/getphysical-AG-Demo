import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Sparkles, Check, Trash2 } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore } from "../../store/trackingStore";
import { askOracleAiFoodGuru, type OracleAnalysisResult } from "../../services/oracleNutritionService";
import { styles } from "./FoodTrackerView.styles";

export function FoodTrackerView() {
  const { colors } = useThemeStore();
  const {
    foodMeals,
    hydrationLiters,
    dailyTargets,
    geminiApiKey,
    saveFoodMeal,
    deleteFoodMeal,
    clearFoodMeals,
    addHydration,
  } = useTrackingStore();

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
      const res = await askOracleAiFoodGuru(nlpInput.trim(), geminiApiKey);
      setOracleDraft(res);
    } catch {
      Alert.alert("Oracle", "Could not analyze meal. Please check network or try again.");
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgScreen }]}
      contentContainerStyle={[styles.content, { paddingBottom: 60 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
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

      {/* 2. ORACLE */}
      <View style={[styles.oracleBox, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.oracleTop}>
          <View style={styles.oracleBadge}>
            <Sparkles size={13} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.oracleBadgeText}>ORACLE</Text>
          </View>
        </View>

        <Text style={[styles.oracleInstruct, { color: colors.textPrimary }]}>
          Type random foods in casual language, Oracle computes the macros:
        </Text>

        <View style={styles.oracleInputRow}>
          <TextInput
            style={[styles.oracleInput, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]}
            placeholder="e.g. 3 eggs, 2 toast with butter, latte"
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
          <Text style={styles.hydrationVal}>{hydrationLiters}L / {dailyTargets.hydration}L</Text>
        </View>
        <View style={[styles.waterTrack, { backgroundColor: colors.borderColor }]}>
          <View style={[styles.waterFill, { width: `${Math.min(100, (hydrationLiters / dailyTargets.hydration) * 100)}%` }]} />
        </View>
        <View style={styles.hydrationActions}>
          <TouchableOpacity onPress={() => addHydration(0.25)} style={[styles.hydroPill, { backgroundColor: colors.bgCardSecondary }]}>
            <Text style={styles.hydroPillText}>+250ml Cup</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addHydration(0.5)} style={[styles.hydroPill, { backgroundColor: colors.bgCardSecondary }]}>
            <Text style={styles.hydroPillText}>+500ml Bottle</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addHydration(1.0)} style={[styles.hydroPill, { backgroundColor: colors.bgCardSecondary }]}>
            <Text style={styles.hydroPillText}>+1.0L Shaker</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. TODAY'S MEAL DIARY */}
      <View style={[styles.foodHistoryList, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Today's Logged Meals ({foodMeals.length})</Text>
          {foodMeals.length > 0 && (
            <TouchableOpacity onPress={clearFoodMeals} style={styles.clearLogsBtn}>
              <Trash2 size={12} color="#EF4444" />
              <Text style={[styles.clearLogsText, { color: "#EF4444" }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {foodMeals.map((item) => (
          <View key={item.id} style={[styles.foodItemCard, { borderBottomColor: colors.borderLight }]}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.foodName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.foodMacros, { color: colors.textSecondary }]}>P: {item.totalP}g • C: {item.totalC}g • F: {item.totalF}g</Text>
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
