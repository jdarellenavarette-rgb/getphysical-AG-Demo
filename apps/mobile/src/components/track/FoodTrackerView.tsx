import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { Droplet, Search, Plus, Sparkles, Utensils, RotateCcw, Camera, Barcode, Check } from "lucide-react-native";

interface FoodItem {
  id: string;
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
}

export function FoodTrackerView() {
  const [hydrationLiters, setHydrationLiters] = useState(1.5);
  const [nlpInput, setNlpInput] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loggedItems, setLoggedItems] = useState<FoodItem[]>([
    { id: "f_1", name: "Whey Isolate Shake", cal: 130, p: 26, c: 2, f: 1 },
    { id: "f_2", name: "Chicken Breast & Brown Rice", cal: 450, p: 42, c: 45, f: 6 },
  ]);

  const totalCalories = loggedItems.reduce((acc, curr) => acc + curr.cal, 0);
  const totalProtein = loggedItems.reduce((acc, curr) => acc + curr.p, 0);
  const totalCarbs = loggedItems.reduce((acc, curr) => acc + curr.c, 0);
  const totalFat = loggedItems.reduce((acc, curr) => acc + curr.f, 0);

  const addMeal = (name: string, cal: number, p: number, c = 20, f = 5) => {
    setLoggedItems((prev) => [{ id: `f_${Date.now()}`, name, cal, p, c, f }, ...prev]);
  };

  const handleNlpSubmit = () => {
    if (!nlpInput.trim()) return;
    addMeal(nlpInput.trim(), 310, 28, 32, 7);
    setNlpInput("");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. EDITORIAL MACRO PROGRESS CARD */}
      <View style={styles.macroCard}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroTitle}>Daily Targets</Text>
          <Text style={styles.macroRemaining}>{Math.max(0, 2600 - totalCalories)} kcal left</Text>
        </View>

        <View style={styles.ringsRow}>
          <View style={styles.macroCol}>
            <Text style={styles.ringVal}>{totalCalories}</Text>
            <View style={styles.progBarTrack}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalCalories / 2600) * 100)}%`, backgroundColor: "#FAFAFA" }]} />
            </View>
            <Text style={styles.ringLabel}>Calories</Text>
          </View>

          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: "#E11D48" }]}>{totalProtein}g</Text>
            <View style={styles.progBarTrack}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalProtein / 180) * 100)}%`, backgroundColor: "#E11D48" }]} />
            </View>
            <Text style={styles.ringLabel}>Protein (180g)</Text>
          </View>

          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: "#3B82F6" }]}>{totalCarbs}g</Text>
            <View style={styles.progBarTrack}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalCarbs / 280) * 100)}%`, backgroundColor: "#3B82F6" }]} />
            </View>
            <Text style={styles.ringLabel}>Carbs (280g)</Text>
          </View>

          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: "#F59E0B" }]}>{totalFat}g</Text>
            <View style={styles.progBarTrack}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalFat / 70) * 100)}%`, backgroundColor: "#F59E0B" }]} />
            </View>
            <Text style={styles.ringLabel}>Fats (70g)</Text>
          </View>
        </View>
      </View>

      {/* 2. HYDRATION TRACKER */}
      <View style={styles.hydrationCard}>
        <View style={styles.hydrationHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Droplet size={18} color="#38BDF8" fill="#38BDF8" />
            <Text style={styles.hydrationTitle}>Hydration</Text>
          </View>
          <Text style={styles.hydrationVal}>{hydrationLiters.toFixed(2)} / 3.0 L</Text>
        </View>
        <View style={styles.waterTrack}>
          <View style={[styles.waterFill, { width: `${Math.min(100, (hydrationLiters / 3.0) * 100)}%` }]} />
        </View>
        <View style={styles.hydrationActions}>
          <TouchableOpacity onPress={() => setHydrationLiters((p) => Math.min(4.0, p + 0.25))} style={styles.hydroPill}>
            <Text style={styles.hydroPillText}>+250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setHydrationLiters((p) => Math.min(4.0, p + 0.5))} style={styles.hydroPill}>
            <Text style={styles.hydroPillText}>+500ml</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. SMART FOOD LOGGER */}
      <View style={styles.nlpBox}>
        <View style={styles.nlpTop}>
          <View style={styles.nlpTitleRow}>
            <Sparkles size={14} color="#F59E0B" />
            <Text style={styles.nlpTitle}>Smart Meal Logger</Text>
          </View>
          <TouchableOpacity onPress={() => setIsScannerOpen(true)} style={styles.scanBtn}>
            <Barcode size={14} color="#FAFAFA" />
            <Text style={styles.scanBtnText}>Scan Barcode</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nlpInputRow}>
          <TextInput
            style={styles.nlpInput}
            placeholder='e.g., "3 eggs, whole grain toast & avocado"'
            placeholderTextColor="#71717A"
            value={nlpInput}
            onChangeText={setNlpInput}
            onSubmitEditing={handleNlpSubmit}
          />
          <TouchableOpacity onPress={handleNlpSubmit} style={styles.nlpAddBtn}>
            <Plus size={16} color="#FAFAFA" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. TODAY'S FOOD LOGS */}
      <View style={styles.foodHistoryList}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Today's Meals ({loggedItems.length})</Text>
          {loggedItems.length > 0 && (
            <TouchableOpacity onPress={() => setLoggedItems([])} style={styles.clearLogsBtn}>
              <RotateCcw size={11} color="#A1A1AA" />
              <Text style={styles.clearLogsText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {loggedItems.map((f) => (
          <View key={f.id} style={styles.foodItemCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>{f.name}</Text>
              <Text style={styles.foodMacros}>P: {f.p}g • C: {f.c}g • F: {f.f}g</Text>
            </View>
            <Text style={styles.foodCals}>{f.cal} kcal</Text>
          </View>
        ))}
      </View>

      {/* BARCODE MODAL */}
      <Modal visible={isScannerOpen} transparent animationType="slide" onRequestClose={() => setIsScannerOpen(false)}>
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerModal}>
            <View style={styles.scannerHeader}>
              <Text style={styles.scannerTitle}>Scan Nutrition Barcode</Text>
              <TouchableOpacity onPress={() => setIsScannerOpen(false)}>
                <Text style={styles.scannerClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.viewfinderBox}>
              <Camera size={44} color="#71717A" />
              <Text style={styles.viewfinderText}>Align barcode inside viewfinder</Text>
            </View>
            <View style={styles.scannedResultCard}>
              <Text style={styles.scannedTitle}>Optimum Nutrition Gold Standard Whey</Text>
              <Text style={styles.scannedSubtitle}>1 scoop (30.4g) • 120 kcal • 24g Protein</Text>
              <TouchableOpacity
                onPress={() => {
                  addMeal("Gold Standard Whey (1 Scoop)", 120, 24, 3, 1);
                  setIsScannerOpen(false);
                }}
                style={styles.addScannedBtn}
              >
                <Check size={16} color="#FFFFFF" />
                <Text style={styles.addScannedText}>Log Scanned Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  content: { padding: 16, paddingBottom: 110, gap: 14 },
  macroCard: { backgroundColor: "#141418", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  macroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  macroTitle: { color: "#FAFAFA", fontSize: 15, fontWeight: "800" },
  macroRemaining: { color: "#10B981", fontSize: 12, fontWeight: "700" },
  ringsRow: { flexDirection: "row", justifyContent: "space-between" },
  macroCol: { flex: 1, alignItems: "center" },
  ringVal: { color: "#FAFAFA", fontSize: 16, fontWeight: "800" },
  progBarTrack: { width: "80%", height: 5, backgroundColor: "#27272A", borderRadius: 3, marginVertical: 6, overflow: "hidden" },
  progBarFill: { height: "100%", borderRadius: 3 },
  ringLabel: { color: "#8E8E93", fontSize: 10, fontWeight: "600" },
  hydrationCard: { backgroundColor: "#141418", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  hydrationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  hydrationTitle: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  hydrationVal: { color: "#38BDF8", fontSize: 13, fontWeight: "800" },
  waterTrack: { width: "100%", height: 8, backgroundColor: "#27272A", borderRadius: 4, overflow: "hidden", marginBottom: 12 },
  waterFill: { height: "100%", backgroundColor: "#38BDF8", borderRadius: 4 },
  hydrationActions: { flexDirection: "row", gap: 10 },
  hydroPill: { flex: 1, backgroundColor: "#202026", paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  hydroPillText: { color: "#38BDF8", fontSize: 12, fontWeight: "800" },
  nlpBox: { backgroundColor: "#141418", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  nlpTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  nlpTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nlpTitle: { color: "#F59E0B", fontSize: 12, fontWeight: "800" },
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#202026", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  scanBtnText: { color: "#FAFAFA", fontSize: 11, fontWeight: "700" },
  nlpInputRow: { flexDirection: "row", gap: 8 },
  nlpInput: { flex: 1, height: 44, backgroundColor: "#202026", borderRadius: 12, paddingHorizontal: 14, color: "#FAFAFA", fontSize: 13 },
  nlpAddBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center" },
  foodHistoryList: { backgroundColor: "#141418", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  historyTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
  clearLogsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearLogsText: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
  foodItemCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1F1F24" },
  foodName: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  foodMacros: { color: "#8E8E93", fontSize: 11, marginTop: 2 },
  foodCals: { color: "#10B981", fontSize: 13, fontWeight: "800" },
  scannerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  scannerModal: { backgroundColor: "#18181B", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: "#27272A" },
  scannerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  scannerTitle: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  scannerClose: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  viewfinderBox: { height: 160, backgroundColor: "#0C0C0E", borderRadius: 16, borderWidth: 2, borderColor: "#3F3F46", borderStyle: "dashed", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  viewfinderText: { color: "#8E8E93", fontSize: 12, marginTop: 8 },
  scannedResultCard: { backgroundColor: "#202026", borderRadius: 14, padding: 14 },
  scannedTitle: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  scannedSubtitle: { color: "#8E8E93", fontSize: 11, marginTop: 2, marginBottom: 12 },
  addScannedBtn: { backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  addScannedText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
