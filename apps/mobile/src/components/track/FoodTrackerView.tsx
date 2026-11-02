import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Droplet, Search, Plus, Sparkles, Utensils, RotateCcw } from "lucide-react-native";

interface FoodItem {
  id: string;
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
}

export function FoodTrackerView() {
  // START IN CLEAN CANONICAL EMPTY STATE
  const [hydrationLiters, setHydrationLiters] = useState(0.0);
  const [nlpInput, setNlpInput] = useState("");
  const [loggedItems, setLoggedItems] = useState<FoodItem[]>([]);

  const totalCalories = loggedItems.reduce((acc, curr) => acc + curr.cal, 0);
  const totalProtein = loggedItems.reduce((acc, curr) => acc + curr.p, 0);
  const totalCarbs = loggedItems.reduce((acc, curr) => acc + curr.c, 0);
  const totalFat = loggedItems.reduce((acc, curr) => acc + curr.f, 0);

  const addMeal = (name: string, cal: number, p: number, c = 20, f = 5) => {
    setLoggedItems((prev) => [
      ...prev,
      { id: `f_${Date.now()}`, name, cal, p, c, f },
    ]);
  };

  const handleNlpSubmit = () => {
    if (!nlpInput.trim()) return;
    addMeal(nlpInput.trim(), 280, 24, 30, 8);
    setNlpInput("");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 4 MACRO WIDGETS */}
      <View style={styles.macroCard}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroTitle}>DAILY TARGETS (NASM FORMULA)</Text>
          <Text style={styles.macroRemaining}>{Math.max(0, 2600 - totalCalories)} kcal remaining</Text>
        </View>

        <View style={styles.ringsRow}>
          <View style={styles.macroRingItem}>
            <Text style={styles.ringValue}>{totalCalories}</Text>
            <Text style={styles.ringLabel}>Calories</Text>
          </View>
          <View style={styles.macroRingItem}>
            <Text style={[styles.ringValue, { color: "#E11D48" }]}>{totalProtein}g</Text>
            <Text style={styles.ringLabel}>Protein (180g)</Text>
          </View>
          <View style={styles.macroRingItem}>
            <Text style={[styles.ringValue, { color: "#F59E0B" }]}>{totalFat}g</Text>
            <Text style={styles.ringLabel}>Fats (70g)</Text>
          </View>
          <View style={styles.macroRingItem}>
            <Text style={[styles.ringValue, { color: "#3B82F6" }]}>{totalCarbs}g</Text>
            <Text style={styles.ringLabel}>Carbs (280g)</Text>
          </View>
        </View>
      </View>

      {/* HYDRATION TRACKER */}
      <View style={styles.hydrationCard}>
        <View style={styles.hydrationLeft}>
          <Droplet size={20} color="#38BDF8" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.hydrationTitle}>HYDRATION</Text>
            <Text style={styles.hydrationVal}>{hydrationLiters.toFixed(2)} / 3.0 Liters</Text>
          </View>
        </View>
        <View style={styles.hydrationActions}>
          <TouchableOpacity
            onPress={() => setHydrationLiters((prev) => Math.min(4.0, prev + 0.25))}
            style={styles.hydroPill}
          >
            <Text style={styles.hydroPillText}>+250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setHydrationLiters((prev) => Math.min(4.0, prev + 0.5))}
            style={styles.hydroPill}
          >
            <Text style={styles.hydroPillText}>+500ml</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* NUTRITIONIX NLP LOGGING ENGINE */}
      <View style={styles.nlpBox}>
        <View style={styles.nlpTitleRow}>
          <Sparkles size={14} color="#F59E0B" />
          <Text style={styles.nlpTitle}>NUTRITIONIX NLP MACRO PARSER</Text>
        </View>
        <View style={styles.nlpInputRow}>
          <TextInput
            style={styles.nlpInput}
            placeholder='Type meal: "3 scrambled eggs, 2 toast"'
            placeholderTextColor="#71717A"
            value={nlpInput}
            onChangeText={setNlpInput}
            onSubmitEditing={handleNlpSubmit}
          />
          <TouchableOpacity onPress={handleNlpSubmit} style={styles.nlpAddBtn}>
            <Plus size={16} color="#FAFAFA" />
          </TouchableOpacity>
        </View>

        <View style={styles.quickMealsRow}>
          <TouchableOpacity
            onPress={() => addMeal("Morning Oats & Berries", 320, 14, 55, 4)}
            style={styles.quickMealPill}
          >
            <Utensils size={10} color="#FAFAFA" />
            <Text style={styles.quickMealText}>+ Morning Oats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => addMeal("Whey Isolate Shake", 130, 26, 2, 1)}
            style={styles.quickMealPill}
          >
            <Utensils size={10} color="#FAFAFA" />
            <Text style={styles.quickMealText}>+ Whey Shake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => addMeal("Chicken Breast & Brown Rice", 450, 42, 45, 6)}
            style={styles.quickMealPill}
          >
            <Utensils size={10} color="#FAFAFA" />
            <Text style={styles.quickMealText}>+ Chicken & Rice</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TODAY'S FOOD LOGS OR CLEAN EMPTY STATE */}
      <View style={styles.foodHistoryList}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>TODAY'S LOGGED FOODS ({loggedItems.length})</Text>
          {loggedItems.length > 0 && (
            <TouchableOpacity onPress={() => setLoggedItems([])} style={styles.clearLogsBtn}>
              <RotateCcw size={11} color="#A1A1AA" />
              <Text style={styles.clearLogsText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {loggedItems.length === 0 ? (
          <View style={styles.emptyFoodBox}>
            <Utensils size={24} color="#71717A" />
            <Text style={styles.emptyFoodTitle}>No food logged today</Text>
            <Text style={styles.emptyFoodSub}>
              Type any meal description above or tap one of the quick pills to start tracking your macro targets.
            </Text>
          </View>
        ) : (
          loggedItems.map((item) => (
            <View key={item.id} style={styles.foodRow}>
              <View>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodMacros}>P: {item.p}g • C: {item.c}g • F: {item.f}g</Text>
              </View>
              <Text style={styles.foodCal}>{item.cal} kcal</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B", padding: 16 },
  macroCard: { backgroundColor: "#121215", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#18181B", marginBottom: 12 },
  macroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  macroTitle: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  macroRemaining: { color: "#10B981", fontSize: 11, fontWeight: "700" },
  ringsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 16 },
  macroRingItem: { alignItems: "center" },
  ringValue: { color: "#FAFAFA", fontSize: 18, fontWeight: "800" },
  ringLabel: { color: "#71717A", fontSize: 10, marginTop: 4 },
  hydrationCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(56, 189, 248, 0.1)", borderWidth: 1, borderColor: "rgba(56, 189, 248, 0.25)", borderRadius: 14, padding: 14, marginBottom: 12 },
  hydrationLeft: { flexDirection: "row", alignItems: "center" },
  hydrationTitle: { color: "#38BDF8", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  hydrationVal: { color: "#FAFAFA", fontSize: 14, fontWeight: "700", marginTop: 2 },
  hydrationActions: { flexDirection: "row", gap: 6 },
  hydroPill: { backgroundColor: "#18181B", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  hydroPillText: { color: "#38BDF8", fontSize: 11, fontWeight: "700" },
  nlpBox: { backgroundColor: "#121215", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#18181B", marginBottom: 16 },
  nlpTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  nlpTitle: { color: "#F59E0B", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  nlpInputRow: { flexDirection: "row", gap: 8 },
  nlpInput: { flex: 1, backgroundColor: "#18181B", borderRadius: 8, paddingHorizontal: 12, height: 42, color: "#FAFAFA", fontSize: 12 },
  nlpAddBtn: { width: 42, height: 42, backgroundColor: "#E11D48", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  quickMealsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  quickMealPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#27272A", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  quickMealText: { color: "#FAFAFA", fontSize: 10, fontWeight: "600" },
  foodHistoryList: { backgroundColor: "#121215", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#18181B", marginBottom: 30 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  historyTitle: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  clearLogsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearLogsText: { color: "#A1A1AA", fontSize: 10, fontWeight: "600" },
  emptyFoodBox: { alignItems: "center", paddingVertical: 20 },
  emptyFoodTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "700", marginTop: 6 },
  emptyFoodSub: { color: "#71717A", fontSize: 11, textAlign: "center", marginTop: 4, lineHeight: 16, maxWidth: 260 },
  foodRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1A1A1E" },
  foodName: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  foodMacros: { color: "#71717A", fontSize: 11, marginTop: 2 },
  foodCal: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
});