import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { Droplet, Search, Plus, Sparkles, Utensils, RotateCcw, Camera, Barcode, Check } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

interface FoodItem { id: string; name: string; cal: number; p: number; c: number; f: number; }

export function FoodTrackerView() {
  const { colors } = useThemeStore();
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
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. MACRO PROGRESS CARD */}
      <View style={[styles.macroCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.macroHeader}>
          <Text style={[styles.macroTitle, { color: colors.textPrimary }]}>Daily Targets</Text>
          <Text style={styles.macroRemaining}>{Math.max(0, 2600 - totalCalories)} kcal left</Text>
        </View>

        <View style={styles.ringsRow}>
          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: colors.textPrimary }]}>{totalCalories}</Text>
            <View style={[styles.progBarTrack, { backgroundColor: colors.borderColor }]}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalCalories / 2600) * 100)}%`, backgroundColor: "#E11D48" }]} />
            </View>
            <Text style={[styles.ringLabel, { color: colors.textMuted }]}>Calories (2600)</Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: colors.textPrimary }]}>{totalProtein}g</Text>
            <View style={[styles.progBarTrack, { backgroundColor: colors.borderColor }]}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalProtein / 180) * 100)}%`, backgroundColor: "#3B82F6" }]} />
            </View>
            <Text style={[styles.ringLabel, { color: colors.textMuted }]}>Protein (180g)</Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: colors.textPrimary }]}>{totalCarbs}g</Text>
            <View style={[styles.progBarTrack, { backgroundColor: colors.borderColor }]}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalCarbs / 260) * 100)}%`, backgroundColor: "#10B981" }]} />
            </View>
            <Text style={[styles.ringLabel, { color: colors.textMuted }]}>Carbs (260g)</Text>
          </View>
          <View style={styles.macroCol}>
            <Text style={[styles.ringVal, { color: colors.textPrimary }]}>{totalFat}g</Text>
            <View style={[styles.progBarTrack, { backgroundColor: colors.borderColor }]}>
              <View style={[styles.progBarFill, { width: `${Math.min(100, (totalFat / 70) * 100)}%`, backgroundColor: "#F59E0B" }]} />
            </View>
            <Text style={[styles.ringLabel, { color: colors.textMuted }]}>Fat (70g)</Text>
          </View>
        </View>
      </View>

      {/* 2. HYDRATION QUICK LOG */}
      <View style={[styles.hydrationCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.hydrationHeader}>
          <Text style={[styles.hydrationTitle, { color: colors.textPrimary }]}>Hydration Target</Text>
          <Text style={styles.hydrationVal}>{hydrationLiters.toFixed(1)} / 3.0 Liters</Text>
        </View>
        <View style={[styles.waterTrack, { backgroundColor: colors.borderColor }]}>
          <View style={[styles.waterFill, { width: `${Math.min(100, (hydrationLiters / 3.0) * 100)}%` }]} />
        </View>
        <View style={styles.hydrationActions}>
          <TouchableOpacity onPress={() => setHydrationLiters((p) => Math.min(5, p + 0.25))} style={[styles.hydroPill, { backgroundColor: colors.bgCardSecondary }]}>
            <Text style={styles.hydroPillText}>+250ml Glass</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setHydrationLiters((p) => Math.min(5, p + 0.5))} style={[styles.hydroPill, { backgroundColor: colors.bgCardSecondary }]}>
            <Text style={styles.hydroPillText}>+500ml Shaker</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setHydrationLiters((p) => Math.min(5, p + 1.0))} style={[styles.hydroPill, { backgroundColor: colors.bgCardSecondary }]}>
            <Text style={styles.hydroPillText}>+1.0L Jug</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. AI NLP QUICK LOG & BARCODE */}
      <View style={[styles.nlpBox, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.nlpTop}>
          <View style={styles.nlpTitleRow}>
            <Sparkles size={14} color="#F59E0B" />
            <Text style={styles.nlpTitle}>AI LOG & BARCODE SCANNER</Text>
          </View>
          <TouchableOpacity onPress={() => setIsScannerOpen(true)} style={[styles.scanBtn, { backgroundColor: colors.bgCardSecondary }]}>
            <Barcode size={14} color={colors.textPrimary} />
            <Text style={[styles.scanBtnText, { color: colors.textPrimary }]}>Scan Barcode</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.nlpInputRow}>
          <TextInput
            style={[styles.nlpInput, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary }]}
            placeholder="Type '2 boiled eggs & oat milk'..."
            placeholderTextColor={colors.textMuted}
            value={nlpInput}
            onChangeText={setNlpInput}
            onSubmitEditing={handleNlpSubmit}
          />
          <TouchableOpacity onPress={handleNlpSubmit} style={styles.nlpAddBtn}>
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. TODAY'S FOOD LOGS */}
      <View style={[styles.foodHistoryList, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Today's Logged Meals ({loggedItems.length})</Text>
          <TouchableOpacity onPress={() => setLoggedItems([])} style={styles.clearLogsBtn}>
            <RotateCcw size={12} color={colors.textMuted} />
            <Text style={[styles.clearLogsText, { color: colors.textMuted }]}>Clear</Text>
          </TouchableOpacity>
        </View>
        {loggedItems.map((item) => (
          <View key={item.id} style={[styles.foodItemCard, { borderBottomColor: colors.borderColor }]}>
            <View>
              <Text style={[styles.foodName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.foodMacros, { color: colors.textMuted }]}>P: {item.p}g • C: {item.c}g • F: {item.f}g</Text>
            </View>
            <Text style={styles.foodCals}>{item.cal} kcal</Text>
          </View>
        ))}
      </View>

      <Modal visible={isScannerOpen} transparent animationType="slide" onRequestClose={() => setIsScannerOpen(false)}>
        <View style={styles.scannerOverlay}>
          <View style={[styles.scannerModal, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <View style={styles.scannerHeader}>
              <Text style={[styles.scannerTitle, { color: colors.textPrimary }]}>SCAN ATHLETIC BARCODE</Text>
              <TouchableOpacity onPress={() => setIsScannerOpen(false)}>
                <Text style={[styles.scannerClose, { color: colors.textMuted }]}>Close</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.viewfinderBox, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <Camera size={36} color={colors.textMuted} />
              <Text style={[styles.viewfinderText, { color: colors.textMuted }]}>Align barcode inside viewfinder</Text>
            </View>
            <View style={[styles.scannedResultCard, { backgroundColor: colors.bgCardSecondary }]}>
              <Text style={[styles.scannedTitle, { color: colors.textPrimary }]}>Optimum Nutrition Gold Standard 100% Whey</Text>
              <Text style={[styles.scannedSubtitle, { color: colors.textMuted }]}>1 Scoop (30.4g) • 120 kcal • 24g Protein</Text>
              <TouchableOpacity
                onPress={() => {
                  addMeal("ON Gold Standard Whey (1 Scoop)", 120, 24, 3, 1);
                  setIsScannerOpen(false);
                }}
                style={styles.addScannedBtn}
              >
                <Check size={16} color="#FFFFFF" strokeWidth={3} />
                <Text style={styles.addScannedText}>Log Verified Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 110, gap: 14 },
  macroCard: { borderRadius: 20, padding: 18, borderWidth: 1 },
  macroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  macroTitle: { fontSize: 15, fontWeight: "800" },
  macroRemaining: { color: "#10B981", fontSize: 12, fontWeight: "700" },
  ringsRow: { flexDirection: "row", justifyContent: "space-between" },
  macroCol: { flex: 1, alignItems: "center" },
  ringVal: { fontSize: 16, fontWeight: "800" },
  progBarTrack: { width: "80%", height: 5, borderRadius: 3, marginVertical: 6, overflow: "hidden" },
  progBarFill: { height: "100%", borderRadius: 3 },
  ringLabel: { fontSize: 10, fontWeight: "600" },
  hydrationCard: { borderRadius: 20, padding: 16, borderWidth: 1 },
  hydrationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  hydrationTitle: { fontSize: 14, fontWeight: "800" },
  hydrationVal: { color: "#38BDF8", fontSize: 13, fontWeight: "800" },
  waterTrack: { width: "100%", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 12 },
  waterFill: { height: "100%", backgroundColor: "#38BDF8", borderRadius: 4 },
  hydrationActions: { flexDirection: "row", gap: 10 },
  hydroPill: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  hydroPillText: { color: "#38BDF8", fontSize: 12, fontWeight: "800" },
  nlpBox: { borderRadius: 20, padding: 16, borderWidth: 1 },
  nlpTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  nlpTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nlpTitle: { color: "#F59E0B", fontSize: 12, fontWeight: "800" },
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  scanBtnText: { fontSize: 11, fontWeight: "700" },
  nlpInputRow: { flexDirection: "row", gap: 8 },
  nlpInput: { flex: 1, height: 44, borderRadius: 12, paddingHorizontal: 14, fontSize: 13 },
  nlpAddBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center" },
  foodHistoryList: { borderRadius: 20, padding: 16, borderWidth: 1 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  historyTitle: { fontSize: 13, fontWeight: "800" },
  clearLogsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearLogsText: { fontSize: 11, fontWeight: "600" },
  foodItemCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  foodName: { fontSize: 13, fontWeight: "700" },
  foodMacros: { fontSize: 11, marginTop: 2 },
  foodCals: { color: "#10B981", fontSize: 13, fontWeight: "800" },
  scannerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  scannerModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1 },
  scannerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  scannerTitle: { fontSize: 14, fontWeight: "800" },
  scannerClose: { fontSize: 13, fontWeight: "600" },
  viewfinderBox: { height: 160, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  viewfinderText: { fontSize: 12, marginTop: 8 },
  scannedResultCard: { borderRadius: 14, padding: 14 },
  scannedTitle: { fontSize: 14, fontWeight: "800" },
  scannedSubtitle: { fontSize: 11, marginTop: 2, marginBottom: 12 },
  addScannedBtn: { backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  addScannedText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
