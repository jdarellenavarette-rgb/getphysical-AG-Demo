import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Droplet, Search, Plus, Sparkles, Utensils } from "lucide-react-native";

export function FoodTrackerView() {
  const [hydrationLiters, setHydrationLiters] = useState(1.75);
  const [nlpInput, setNlpInput] = useState("");
  const [loggedItems, setLoggedItems] = useState([
    { id: "f1", name: "2 Boiled Eggs", cal: 156, p: 12, c: 1, f: 10 },
    { id: "f2", name: "1 Cup Brown Rice", cal: 216, p: 5, c: 45, f: 2 },
    { id: "f3", name: "Whey Isolate Shake", cal: 130, p: 26, c: 2, f: 1 },
  ]);

  const totalCalories = loggedItems.reduce((acc, curr) => acc + curr.cal, 0);
  const totalProtein = loggedItems.reduce((acc, curr) => acc + curr.p, 0);

  const addQuickMeal = (name: string, cal: number, p: number) => {
    setLoggedItems((prev) => [
      ...prev,
      { id: `f_${Date.now()}`, name, cal, p, c: 20, f: 5 },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 4 MACRO WIDGETS */}
      <View style={styles.macroCard}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroTitle}>DAILY TARGETS (NASM FORMULA)</Text>
          <Text style={styles.macroRemaining}>{2600 - totalCalories} kcal remaining</Text>
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
            <Text style={[styles.ringValue, { color: "#F59E0B" }]}>48g</Text>
            <Text style={styles.ringLabel}>Fats (70g)</Text>
          </View>
          <View style={styles.macroRingItem}>
            <Text style={[styles.ringValue, { color: "#3B82F6" }]}>195g</Text>
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
            onPress={() => setHydrationLiters((prev) => prev + 0.25)}
            style={styles.hydroPill}
          >
            <Text style={styles.hydroPillText}>+250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setHydrationLiters((prev) => prev + 0.5)}
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
          <Text style={styles.nlpTitle}>NUTRITIONIX NLP SEARCH</Text>
        </View>
        <TextInput
          style={styles.nlpInput}
          placeholder='e.g. "3 scrambled eggs and 2 slices of whole wheat toast"'
          placeholderTextColor="#71717A"
          value={nlpInput}
          onChangeText={setNlpInput}
        />
        <View style={styles.quickMealsRow}>
          <TouchableOpacity
            onPress={() => addQuickMeal("Morning Oats", 320, 18)}
            style={styles.quickMealPill}
          >
            <Utensils size={10} color="#FAFAFA" />
            <Text style={styles.quickMealText}>Morning Oats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => addQuickMeal("Post-Workout Shake", 250, 40)}
            style={styles.quickMealPill}
          >
            <Utensils size={10} color="#FAFAFA" />
            <Text style={styles.quickMealText}>Post-Workout Shake</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TODAY'S FOOD LOGS */}
      <View style={styles.foodHistoryList}>
        <Text style={styles.historyTitle}>TODAY'S LOGGED FOODS</Text>
        {loggedItems.map((item) => (
          <View key={item.id} style={styles.foodRow}>
            <View>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodMacros}>P: {item.p}g • C: {item.c}g • F: {item.f}g</Text>
            </View>
            <Text style={styles.foodCal}>{item.cal} kcal</Text>
          </View>
        ))}
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
  ringsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
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
  nlpInput: { backgroundColor: "#18181B", borderRadius: 8, paddingHorizontal: 12, height: 42, color: "#FAFAFA", fontSize: 12 },
  quickMealsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  quickMealPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#27272A", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  quickMealText: { color: "#FAFAFA", fontSize: 10, fontWeight: "600" },
  foodHistoryList: { backgroundColor: "#121215", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#18181B" },
  historyTitle: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 10 },
  foodRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  foodName: { color: "#FAFAFA", fontSize: 13, fontWeight: "600" },
  foodMacros: { color: "#71717A", fontSize: 11, marginTop: 2 },
  foodCal: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
});
