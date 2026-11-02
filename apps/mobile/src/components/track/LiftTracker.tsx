import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { Check, Plus, Dumbbell, Award, Flame, Send, CheckCircle2 } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface WorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export function LiftTracker() {
  const { activeWorkout, startWorkout, finishWorkout, startRestTimer, adjustRestTimer, stopRestTimer, addPost } =
    useEcosystemStore();

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

  const totalVolume = sets.filter((s) => s.isCompleted).reduce((acc, s) => acc + s.weight * s.reps, 0);

  const handleShareToFeed = () => {
    addPost("Deadlift session crushed! Verified PR stamp attached.", "fac_metro_core", {
      id: `stamp_pr_${Date.now()}`,
      type: "lift",
      title: "Deadlift 1RM",
      primaryMetric: "225 kg",
      isVerified: true,
      isPR: true,
    });
    setIsFinishModalOpen(false);
    finishWorkout();
  };

  if (!activeWorkout.isActive) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.emptyContent} showsVerticalScrollIndicator={false}>
        {/* PERSONAL BESTS (1RM) - GYMSHARK AESTHETIC */}
        <View style={styles.prHeaderRow}>
          <Text style={styles.sectionTitle}>Personal Bests (1RM)</Text>
          <View style={styles.verifiedTrophyPill}>
            <Award size={12} color="#10B981" />
            <Text style={styles.verifiedTrophyText}>Verified PRs</Text>
          </View>
        </View>

        <View style={styles.prRingsRow}>
          {[
            { label: "Deadlift", val: 225, color: "#E11D48" },
            { label: "Squat", val: 160, color: "#EC4899" },
            { label: "Bench Press", val: 120, color: "#3B82F6" },
          ].map((item) => (
            <View key={item.label} style={styles.prRingItem}>
              <View style={[styles.prRingCircle, { borderColor: item.color }]}>
                <Text style={styles.prRingWeight}>{item.val}</Text>
                <Text style={styles.prRingUnit}>KG</Text>
              </View>
              <Text style={styles.prRingLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* WORKOUT LAUNCHPAD */}
        <View style={styles.launchpadCard}>
          <View style={styles.launchpadIcon}>
            <Dumbbell size={28} color="#FAFAFA" />
          </View>
          <Text style={styles.launchpadTitle}>Ready to Train?</Text>
          <Text style={styles.launchpadSubtitle}>Log sets with live RPE velocity feedback and automated rest timer recovery.</Text>
          <TouchableOpacity onPress={() => startWorkout("Conventional Deadlift Session")} style={styles.startWorkoutButton}>
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={styles.startWorkoutText}>Start Blank Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      {/* ACTIVE WORKOUT HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{activeWorkout.title}</Text>
          <Text style={styles.timerText}>In Progress • Live Logging</Text>
        </View>
        <TouchableOpacity onPress={() => setIsFinishModalOpen(true)} style={styles.finishButton}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* REST TIMER (INSPIRATION PHOTO 3) */}
      {activeWorkout.isResting && activeWorkout.restTimerSeconds > 0 && (
        <View style={styles.circularTimerCard}>
          <Text style={styles.restTitle}>Rest Countdown</Text>
          <View style={styles.timerRingRow}>
            <TouchableOpacity onPress={() => adjustRestTimer(-15)} style={styles.timerAdjustBtn}>
              <Text style={styles.timerAdjustText}>-15s</Text>
            </TouchableOpacity>
            <View style={styles.circularClock}>
              <Text style={styles.secondsBig}>{activeWorkout.restTimerSeconds}</Text>
              <Text style={styles.secondsLabel}>SEC</Text>
            </View>
            <TouchableOpacity onPress={() => adjustRestTimer(15)} style={styles.timerAdjustBtn}>
              <Text style={styles.timerAdjustText}>+15s</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={stopRestTimer} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip Rest</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* EXERCISE SETS TABLE */}
      <View style={styles.exerciseCard}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>Conventional Deadlift</Text>
          <View style={styles.targetBadge}>
            <Text style={styles.targetBadgeText}>Posterior Chain</Text>
          </View>
        </View>

        <View style={styles.setGrid}>
          {sets.map((set, idx) => (
            <TouchableOpacity
              key={set.setNumber}
              onPress={() => toggleSet(idx)}
              style={[styles.setRow, set.isCompleted && styles.setRowCompleted]}
            >
              <Text style={[styles.setNumberText, set.isCompleted && { color: "#10B981" }]}>
                SET {set.setNumber}
              </Text>
              <Text style={styles.setWeightText}>{set.weight} kg × {set.reps} reps</Text>
              <View style={[styles.checkCircle, set.isCompleted && styles.checkCircleCompleted]}>
                {set.isCompleted && <Check size={14} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={addSet} style={styles.addSetBtn}>
          <Plus size={14} color="#A1A1AA" style={{ marginRight: 4 }} />
          <Text style={styles.addSetText}>Add Set</Text>
        </TouchableOpacity>
      </View>

      {/* WORKOUT COMPLETION MODAL */}
      <Modal visible={isFinishModalOpen} transparent animationType="slide" onRequestClose={() => setIsFinishModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.finishSummaryCard}>
            <CheckCircle2 size={36} color="#10B981" />
            <Text style={styles.finishModalTitle}>Workout Complete!</Text>
            <Text style={styles.finishModalSubtitle}>
              {sets.filter((s) => s.isCompleted).length} sets logged • {totalVolume || 1465} kg total volume
            </Text>
            <TouchableOpacity onPress={handleShareToFeed} style={styles.shareFeedBtn}>
              <Send size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.shareFeedText}>Share PR Stamp to Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsFinishModalOpen(false); finishWorkout(); }} style={styles.saveQuietlyBtn}>
              <Text style={styles.saveQuietlyText}>Save to Private Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B", padding: 16 },
  emptyContent: { paddingBottom: 110 },
  prHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { color: "#FAFAFA", fontSize: 16, fontWeight: "800" },
  verifiedTrophyPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16,185,129,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  verifiedTrophyText: { color: "#10B981", fontSize: 11, fontWeight: "800" },
  prRingsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 22 },
  prRingItem: { alignItems: "center" },
  prRingCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#E11D48", alignItems: "center", justifyContent: "center", backgroundColor: "#141418" },
  prRingWeight: { color: "#FAFAFA", fontSize: 22, fontWeight: "900" },
  prRingUnit: { color: "#8E8E93", fontSize: 10, fontWeight: "800", marginTop: -2 },
  prRingLabel: { color: "#A1A1AA", fontSize: 12, fontWeight: "700", marginTop: 8 },
  launchpadCard: { borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 22, backgroundColor: "#141418", padding: 24, alignItems: "center" },
  launchpadIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#202026", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  launchpadTitle: { fontSize: 18, fontWeight: "800", color: "#FAFAFA" },
  launchpadSubtitle: { fontSize: 13, color: "#8E8E93", textAlign: "center", marginTop: 6, lineHeight: 19, maxWidth: 280 },
  startWorkoutButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#E11D48", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999, marginTop: 18 },
  startWorkoutText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { color: "#FAFAFA", fontSize: 20, fontWeight: "800" },
  timerText: { color: "#10B981", fontSize: 12, marginTop: 2, fontWeight: "700" },
  finishButton: { backgroundColor: "#10B981", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  finishText: { color: "#000000", fontWeight: "900", fontSize: 12 },
  circularTimerCard: { backgroundColor: "#141418", borderRadius: 20, padding: 18, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 16 },
  restTitle: { color: "#8E8E93", fontSize: 12, fontWeight: "700" },
  timerRingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginVertical: 12 },
  timerAdjustBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#202026", alignItems: "center", justifyContent: "center" },
  timerAdjustText: { color: "#FAFAFA", fontSize: 12, fontWeight: "800" },
  circularClock: { width: 100, height: 100, borderRadius: 50, borderWidth: 3.5, borderColor: "#10B981", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(16, 185, 129, 0.08)" },
  secondsBig: { color: "#FAFAFA", fontSize: 34, fontWeight: "900" },
  secondsLabel: { color: "#10B981", fontSize: 10, fontWeight: "800", marginTop: -2 },
  skipBtn: { padding: 4 },
  skipText: { color: "#8E8E93", fontSize: 12, fontWeight: "700" },
  exerciseCard: { backgroundColor: "#141418", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16 },
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  exerciseName: { color: "#FAFAFA", fontSize: 16, fontWeight: "800" },
  targetBadge: { backgroundColor: "rgba(225, 29, 72, 0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  targetBadgeText: { color: "#E11D48", fontSize: 10, fontWeight: "800" },
  setGrid: { gap: 8 },
  setRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#202026", borderRadius: 12, padding: 14 },
  setRowCompleted: { backgroundColor: "rgba(16, 185, 129, 0.12)" },
  setNumberText: { color: "#8E8E93", fontSize: 12, fontWeight: "800" },
  setWeightText: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#71717A", alignItems: "center", justifyContent: "center" },
  checkCircleCompleted: { borderColor: "#10B981", backgroundColor: "#10B981" },
  addSetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, marginTop: 10 },
  addSetText: { color: "#A1A1AA", fontSize: 13, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 24 },
  finishSummaryCard: { backgroundColor: "#18181B", borderRadius: 24, padding: 24, alignItems: "center", width: "100%", borderWidth: 1, borderColor: "#27272A" },
  finishModalTitle: { color: "#FAFAFA", fontSize: 20, fontWeight: "900", marginTop: 12 },
  finishModalSubtitle: { color: "#A1A1AA", fontSize: 13, textAlign: "center", marginTop: 6, marginBottom: 20 },
  shareFeedBtn: { backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 13, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "center" },
  shareFeedText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  saveQuietlyBtn: { marginTop: 12, paddingVertical: 10 },
  saveQuietlyText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
});
