import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { Check, Plus, Dumbbell, Award, Flame } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";

interface WorkoutSet { setNumber: number; weight: number; reps: number; isCompleted: boolean; }

export function LiftTracker() {
  const { activeWorkout, startWorkout, finishWorkout, startRestTimer, adjustRestTimer, stopRestTimer, addPost } = useEcosystemStore();
  const { colors } = useThemeStore();
  const [sets, setSets] = useState<WorkoutSet[]>([
    { setNumber: 1, weight: 140, reps: 5, isCompleted: true },
    { setNumber: 2, weight: 180, reps: 3, isCompleted: true },
    { setNumber: 3, weight: 225, reps: 1, isCompleted: true },
  ]);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  const toggleSet = (idx: number) => {
    setSets((prev) => prev.map((s, i) => {
      if (i === idx) {
        if (!s.isCompleted) startRestTimer(90);
        return { ...s, isCompleted: !s.isCompleted };
      }
      return s;
    }));
  };

  const addSet = () => {
    const last = sets[sets.length - 1];
    setSets((prev) => [...prev, { setNumber: prev.length + 1, weight: last?.weight ?? 100, reps: last?.reps ?? 5, isCompleted: false }]);
  };

  const handleShareToFeed = () => {
    addPost("Deadlift session crushed! Verified PR stamp attached.", "fac_metro_core", {
      id: `stamp_pr_${Date.now()}`, type: "lift", title: "Deadlift 1RM", primaryMetric: "225 kg", isVerified: true, isPR: true,
    });
    setIsFinishModalOpen(false);
    finishWorkout();
  };

  if (!activeWorkout.isActive) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={styles.emptyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.prHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Personal Bests (1RM)</Text>
          <View style={styles.verifiedTrophyPill}>
            <Award size={13} color="#10B981" />
            <Text style={styles.verifiedTrophyText}>VERIFIED</Text>
          </View>
        </View>

        <View style={styles.prRingsRow}>
          {[{ name: "Deadlift", val: "225", unit: "KG" }, { name: "Bench", val: "145", unit: "KG" }, { name: "Squat", val: "190", unit: "KG" }].map((pr) => (
            <View key={pr.name} style={styles.prRingItem}>
              <View style={[styles.prRingCircle, { backgroundColor: colors.bgCard, borderColor: colors.accent }]}>
                <Text style={[styles.prRingWeight, { color: colors.textPrimary }]}>{pr.val}</Text>
                <Text style={styles.prRingUnit}>{pr.unit}</Text>
              </View>
              <Text style={[styles.prRingLabel, { color: colors.textMuted }]}>{pr.name}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.launchpadCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={[styles.launchpadIcon, { backgroundColor: colors.bgCardSecondary }]}>
            <Dumbbell size={28} color="#E11D48" />
          </View>
          <Text style={[styles.launchpadTitle, { color: colors.textPrimary }]}>Ready to Train?</Text>
          <Text style={[styles.launchpadSubtitle, { color: colors.textMuted }]}>
            Log sets, reps, and RPE with automated rest timers & verified PR stamps.
          </Text>
          <TouchableOpacity onPress={() => startWorkout("Conventional Deadlift Routine")} style={styles.startWorkoutButton}>
            <Flame size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.startWorkoutText}>Start Heavy Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{activeWorkout.title}</Text>
          <Text style={styles.timerText}>Active Time: {Math.floor(activeWorkout.durationSeconds / 60)}m {activeWorkout.durationSeconds % 60}s</Text>
        </View>
        <TouchableOpacity onPress={() => setIsFinishModalOpen(true)} style={styles.finishButton}>
          <Text style={styles.finishText}>FINISH</Text>
        </TouchableOpacity>
      </View>

      {activeWorkout.restTimerSeconds > 0 && (
        <View style={[styles.circularTimerCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.restTitle, { color: colors.textMuted }]}>REST INTERVAL TIMER</Text>
          <View style={styles.timerRingRow}>
            <TouchableOpacity onPress={() => adjustRestTimer(-15)} style={[styles.timerAdjustBtn, { backgroundColor: colors.bgInput }]}>
              <Text style={[styles.timerAdjustText, { color: colors.textPrimary }]}>-15s</Text>
            </TouchableOpacity>
            <View style={styles.circularClock}>
              <Text style={[styles.secondsBig, { color: colors.textPrimary }]}>{activeWorkout.restTimerSeconds}</Text>
              <Text style={styles.secondsLabel}>SEC REST</Text>
            </View>
            <TouchableOpacity onPress={() => adjustRestTimer(15)} style={[styles.timerAdjustBtn, { backgroundColor: colors.bgInput }]}>
              <Text style={[styles.timerAdjustText, { color: colors.textPrimary }]}>+15s</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={stopRestTimer} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip Rest Timer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.exerciseCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.exerciseHeader}>
          <Text style={[styles.exerciseName, { color: colors.textPrimary }]}>Conventional Deadlift</Text>
          <View style={styles.targetBadge}>
            <Text style={styles.targetBadgeText}>HEAVY 1-5 RM</Text>
          </View>
        </View>

        <View style={styles.setGrid}>
          {sets.map((set, idx) => (
            <TouchableOpacity
              key={set.setNumber}
              onPress={() => toggleSet(idx)}
              style={[styles.setRow, { backgroundColor: colors.bgCardSecondary }, set.isCompleted && styles.setRowCompleted]}
            >
              <Text style={[styles.setNumberText, { color: colors.textMuted }]}>SET {set.setNumber}</Text>
              <Text style={[styles.setWeightText, { color: colors.textPrimary }]}>{set.weight} kg × {set.reps} reps</Text>
              <View style={[styles.checkCircle, { borderColor: colors.borderColor }, set.isCompleted && styles.checkCircleCompleted]}>
                {set.isCompleted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={addSet} style={styles.addSetBtn}>
            <Plus size={16} color="#E11D48" style={{ marginRight: 6 }} />
            <Text style={[styles.addSetText, { color: colors.accent }]}>Add Next Set</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={isFinishModalOpen} transparent animationType="fade" onRequestClose={() => setIsFinishModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.finishSummaryCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Award size={48} color="#10B981" />
            <Text style={[styles.finishModalTitle, { color: colors.textPrimary }]}>Session Completed!</Text>
            <Text style={[styles.finishModalSubtitle, { color: colors.textMuted }]}>225 kg Deadlift PR logged to your athletic wallet.</Text>
            <TouchableOpacity onPress={handleShareToFeed} style={styles.shareFeedBtn}>
              <Flame size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.shareFeedText}>Post PR Stamp to Sodia Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsFinishModalOpen(false); finishWorkout(); }} style={styles.saveQuietlyBtn}>
              <Text style={[styles.saveQuietlyText, { color: colors.textMuted }]}>Save Quietly</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  emptyContent: { paddingBottom: 110 },
  prHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  verifiedTrophyPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16,185,129,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  verifiedTrophyText: { color: "#10B981", fontSize: 11, fontWeight: "800" },
  prRingsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 22 },
  prRingItem: { alignItems: "center" },
  prRingCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  prRingWeight: { fontSize: 22, fontWeight: "900" },
  prRingUnit: { color: "#8E8E93", fontSize: 10, fontWeight: "800", marginTop: -2 },
  prRingLabel: { fontSize: 12, fontWeight: "700", marginTop: 8 },
  launchpadCard: { borderWidth: 1, borderRadius: 22, padding: 24, alignItems: "center" },
  launchpadIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  launchpadTitle: { fontSize: 18, fontWeight: "800" },
  launchpadSubtitle: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 19, maxWidth: 280 },
  startWorkoutButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#E11D48", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999, marginTop: 18 },
  startWorkoutText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800" },
  timerText: { color: "#10B981", fontSize: 12, marginTop: 2, fontWeight: "700" },
  finishButton: { backgroundColor: "#10B981", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  finishText: { color: "#000000", fontWeight: "900", fontSize: 12 },
  circularTimerCard: { borderRadius: 20, padding: 18, alignItems: "center", borderWidth: 1, marginBottom: 16 },
  restTitle: { fontSize: 12, fontWeight: "700" },
  timerRingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginVertical: 12 },
  timerAdjustBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  timerAdjustText: { fontSize: 12, fontWeight: "800" },
  circularClock: { width: 100, height: 100, borderRadius: 50, borderWidth: 3.5, borderColor: "#10B981", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(16, 185, 129, 0.08)" },
  secondsBig: { fontSize: 34, fontWeight: "900" },
  secondsLabel: { color: "#10B981", fontSize: 10, fontWeight: "800", marginTop: -2 },
  skipBtn: { padding: 4 },
  skipText: { fontSize: 12, fontWeight: "700" },
  exerciseCard: { borderRadius: 20, borderWidth: 1, padding: 16 },
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  exerciseName: { fontSize: 16, fontWeight: "800" },
  targetBadge: { backgroundColor: "rgba(225, 29, 72, 0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  targetBadgeText: { color: "#E11D48", fontSize: 10, fontWeight: "800" },
  setGrid: { gap: 8 },
  setRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 12, padding: 14 },
  setRowCompleted: { backgroundColor: "rgba(16, 185, 129, 0.12)" },
  setNumberText: { fontSize: 12, fontWeight: "800" },
  setWeightText: { fontSize: 14, fontWeight: "800" },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkCircleCompleted: { borderColor: "#10B981", backgroundColor: "#10B981" },
  addSetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, marginTop: 10 },
  addSetText: { fontSize: 13, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center", padding: 24 },
  finishSummaryCard: { borderRadius: 24, padding: 24, alignItems: "center", width: "100%", borderWidth: 1 },
  finishModalTitle: { fontSize: 20, fontWeight: "900", marginTop: 12 },
  finishModalSubtitle: { fontSize: 13, textAlign: "center", marginTop: 6, marginBottom: 20 },
  shareFeedBtn: { backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 13, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "center" },
  shareFeedText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  saveQuietlyBtn: { marginTop: 12, paddingVertical: 10 },
  saveQuietlyText: { fontSize: 12, fontWeight: "700" },
});
