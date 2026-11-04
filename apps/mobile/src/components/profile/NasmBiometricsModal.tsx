import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput, Alert } from "react-native";
import { X, Sparkles, Calculator, Check, ArrowRight, HeartPulse, Scale, Flame } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore, type UserBiometrics } from "../../store/trackingStore";

interface NasmBiometricsModalProps {
  visible: boolean;
  onClose: () => void;
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: { label: "Sedentary (Desk Job)", factor: 1.2 },
  light: { label: "Light (1-2 days/wk)", factor: 1.375 },
  moderate: { label: "Moderate (3-5 days/wk)", factor: 1.55 },
  heavy: { label: "Heavy / Athletic (6-7 days/wk)", factor: 1.725 },
  athlete: { label: "Elite Athlete (2x/day)", factor: 1.9 },
};

const GOAL_ADJUSTMENTS = {
  hypertrophy: { label: "Hypertrophy (Build Muscle)", calDelta: 350, proteinPerKg: 2.2 },
  fat_loss: { label: "Fat Loss & Definition", calDelta: -450, proteinPerKg: 2.2 },
  strength: { label: "Maximal Strength & Power", calDelta: 200, proteinPerKg: 2.0 },
  endurance: { label: "Endurance & Conditioning", calDelta: 150, proteinPerKg: 1.8 },
  maintenance: { label: "Maintenance & Recovery", calDelta: 0, proteinPerKg: 1.8 },
};

export function NasmBiometricsModal({ visible, onClose }: NasmBiometricsModalProps) {
  const { colors } = useThemeStore();
  const { userBiometrics, updateBiometrics } = useTrackingStore();

  const [age, setAge] = useState(String(userBiometrics.age));
  const [gender, setGender] = useState<"male" | "female">(userBiometrics.gender);
  const [heightCm, setHeightCm] = useState(String(userBiometrics.heightCm));
  const [weightKg, setWeightKg] = useState(String(userBiometrics.weightKg));
  const [activity, setActivity] = useState<keyof typeof ACTIVITY_MULTIPLIERS>(userBiometrics.activityLevel);
  const [goal, setGoal] = useState<keyof typeof GOAL_ADJUSTMENTS>(userBiometrics.goal);

  if (!visible) return null;

  const numAge = parseInt(age, 10) || 25;
  const numHeight = parseFloat(heightCm) || 175;
  const numWeight = parseFloat(weightKg) || 80;

  // NASM Mifflin-St Jeor Equation
  const bmr = Math.round(10 * numWeight + 6.25 * numHeight - 5 * numAge + (gender === "male" ? 5 : -161));
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity].factor);
  const targetCalories = Math.max(1200, tdee + GOAL_ADJUSTMENTS[goal].calDelta);
  const targetProtein = Math.round(numWeight * GOAL_ADJUSTMENTS[goal].proteinPerKg);
  const targetFat = Math.round((targetCalories * 0.25) / 9);
  const targetCarbs = Math.round((targetCalories - targetProtein * 4 - targetFat * 9) / 4);
  const bmi = +(numWeight / Math.pow(numHeight / 100, 2)).toFixed(1);

  const handleSave = () => {
    updateBiometrics(
      { age: numAge, gender, heightCm: numHeight, weightKg: numWeight, activityLevel: activity, goal, bmr, tdee, bmi },
      { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat, hydration: +(numWeight * 0.038).toFixed(1) }
    );
    Alert.alert("NASM Targets Synced!", `Daily Targets: ${targetCalories} kcal (P: ${targetProtein}g • C: ${targetCarbs}g • F: ${targetFat}g)`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <Calculator size={16} color="#E11D48" />
              <Text style={styles.badgeText}>NASM BODY COMP & TARGETS</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}><X size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* COMPUTED MACRO TARGET HUD */}
            <View style={[styles.targetHud, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <Text style={[styles.hudTitle, { color: colors.textMuted }]}>RECOMMENDED ATHLETIC TARGET</Text>
              <Text style={styles.hudCalories}>{targetCalories} <Text style={styles.hudKcal}>KCAL/DAY</Text></Text>
              <View style={styles.macrosSplitRow}>
                <View style={styles.macroPill}><Text style={[styles.macroPillVal, { color: "#3B82F6" }]}>{targetProtein}g</Text><Text style={styles.macroPillLabel}>Protein</Text></View>
                <View style={styles.macroPill}><Text style={[styles.macroPillVal, { color: "#10B981" }]}>{targetCarbs}g</Text><Text style={styles.macroPillLabel}>Carbs</Text></View>
                <View style={styles.macroPill}><Text style={[styles.macroPillVal, { color: "#F59E0B" }]}>{targetFat}g</Text><Text style={styles.macroPillLabel}>Fats</Text></View>
              </View>
              <Text style={[styles.hudMeta, { color: colors.textMuted }]}>BMR: {bmr} kcal • TDEE: {tdee} kcal • BMI: {bmi}</Text>
            </View>

            {/* BIOMETRIC INPUTS */}
            <Text style={[styles.labelTitle, { color: colors.textPrimary }]}>Physical Biometrics</Text>
            <View style={styles.inputsGrid}>
              <View style={styles.inputCol}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Age (yrs)</Text>
                <TextInput style={[styles.inputBox, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]} value={age} onChangeText={setAge} keyboardType="numeric" />
              </View>
              <View style={styles.inputCol}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Height (cm)</Text>
                <TextInput style={[styles.inputBox, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]} value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" />
              </View>
              <View style={styles.inputCol}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Weight (kg)</Text>
                <TextInput style={[styles.inputBox, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]} value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" />
              </View>
            </View>

            {/* GENDER ROW */}
            <View style={styles.genderRow}>
              {(["male", "female"] as const).map((g) => (
                <TouchableOpacity key={g} onPress={() => setGender(g)} style={[styles.genderBtn, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }, gender === g && styles.genderBtnActive]}>
                  <Text style={[styles.genderBtnText, { color: colors.textMuted }, gender === g && styles.genderBtnTextActive]}>{g.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ATHLETIC GOAL */}
            <Text style={[styles.labelTitle, { color: colors.textPrimary, marginTop: 14 }]}>Primary Athletic Goal</Text>
            <View style={styles.optionsWrap}>
              {(Object.keys(GOAL_ADJUSTMENTS) as (keyof typeof GOAL_ADJUSTMENTS)[]).map((k) => (
                <TouchableOpacity key={k} onPress={() => setGoal(k)} style={[styles.optionPill, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }, goal === k && styles.optionPillActive]}>
                  <Text style={[styles.optionText, { color: colors.textPrimary }, goal === k && { color: "#FFF" }]}>{GOAL_ADJUSTMENTS[k].label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ACTIVITY LEVEL */}
            <Text style={[styles.labelTitle, { color: colors.textPrimary, marginTop: 14 }]}>Activity & Training Frequency</Text>
            <View style={styles.optionsWrap}>
              {(Object.keys(ACTIVITY_MULTIPLIERS) as (keyof typeof ACTIVITY_MULTIPLIERS)[]).map((k) => (
                <TouchableOpacity key={k} onPress={() => setActivity(k)} style={[styles.optionPill, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }, activity === k && styles.optionPillActive]}>
                  <Text style={[styles.optionText, { color: colors.textPrimary }, activity === k && { color: "#FFF" }]}>{ACTIVITY_MULTIPLIERS[k].label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleSave} style={styles.saveCtaBtn}>
              <Check size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.saveCtaText}>Save & Apply Macro Targets</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheetCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "90%", borderWidth: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  badgeText: { color: "#E11D48", fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  closeBtn: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: 24 },
  targetHud: { borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, marginBottom: 16 },
  hudTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  hudCalories: { fontSize: 36, fontWeight: "900", color: "#E11D48", marginVertical: 4 },
  hudKcal: { fontSize: 12, fontWeight: "800", color: "#E11D48" },
  macrosSplitRow: { flexDirection: "row", gap: 18, marginTop: 6 },
  macroPill: { alignItems: "center" },
  macroPillVal: { fontSize: 16, fontWeight: "900" },
  macroPillLabel: { fontSize: 10, color: "#8E8E93", fontWeight: "700" },
  hudMeta: { fontSize: 11, marginTop: 10, fontWeight: "600" },
  labelTitle: { fontSize: 13, fontWeight: "800", marginBottom: 8 },
  inputsGrid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  inputCol: { flex: 1 },
  fieldLabel: { fontSize: 10, fontWeight: "700", marginBottom: 4 },
  inputBox: { height: 42, borderRadius: 10, borderWidth: 1, textAlign: "center", fontSize: 14, fontWeight: "800" },
  genderRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  genderBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  genderBtnActive: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  genderBtnText: { fontSize: 12, fontWeight: "800" },
  genderBtnTextActive: { color: "#FFF" },
  optionsWrap: { gap: 6, marginBottom: 6 },
  optionPill: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  optionPillActive: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  optionText: { fontSize: 12, fontWeight: "700" },
  saveCtaBtn: { backgroundColor: "#10B981", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14, marginTop: 18 },
  saveCtaText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
});
