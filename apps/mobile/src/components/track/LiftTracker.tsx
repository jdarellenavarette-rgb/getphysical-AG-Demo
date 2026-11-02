import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Check, Plus, Dumbbell, RotateCcw, Award } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface WorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export function LiftTracker() {
  const { activeWorkout, startWorkout, finishWorkout, startRestTimer, adjustRestTimer, stopRestTimer } =
    useEcosystemStore();

  const [sets, setSets] = useState<WorkoutSet[]>([
    { setNumber: 1, weight: 140, reps: 5, isCompleted: false },
    { setNumber: 2, weight: 180, reps: 3, isCompleted: false },
    { setNumber: 3, weight: 225, reps: 1, isCompleted: false },
  ]);

  const toggleSet = (idx: number) => {
    setSets((prev) =>
      prev.map((s, i) => {
        if (i === idx) {
          const nextState = !s.isCompleted;
          if (nextState) startRestTimer(90);
          return { ...s, isCompleted: nextState };
        }
        return s;
      })
    );
  };

  const addSet = () => {
    const last = sets[sets.length - 1];
    const newWeight = last ? last.weight : 100;
    const newReps = last ? last.reps : 5;
    setSets((prev) => [...prev, { setNumber: prev.length + 1, weight: newWeight, reps: newReps, isCompleted: false }]);
  };

  // EMPTY STATE
  if (!activeWorkout.isActive) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.emptyContent}>
        {/* 3 CIRCULAR PERSONAL BESTS (INSPIRATION PHOTO 5) */}
        <Text style={styles.sectionTitle}>PERSONAL BESTS (1RM)</Text>
        <View style={styles.prRingsRow}>
          <View style={styles.prRingItem}>
            <View style={styles.prRingCircle}>
              <Text style={styles.prRingWeight}>225</Text>
              <Text style={styles.prRingUnit}>KG</Text>
            </View>
            <Text style={styles.prRingLabel}>Deadlift</Text>
          </View>

          <View style={styles.prRingItem}>
            <View style={[styles.prRingCircle, { borderColor: "#EC4899" }]}>
              <Text style={styles.prRingWeight}>160</Text>
              <Text style={styles.prRingUnit}>KG</Text>
            </View>
            <Text style={styles.prRingLabel}>Squat</Text>
          </View>

          <View style={styles.prRingItem}>
            <View style={[styles.prRingCircle, { borderColor: "#3B82F6" }]}>
              <Text style={styles.prRingWeight}>120</Text>
              <Text style={styles.prRingUnit}>KG</Text>
            </View>
            <Text style={styles.prRingLabel}>Bench Press</Text>
          </View>
        </View>

        {/* EMPTY WORKOUT CARD */}
        <View style={styles.emptyCard}>
          <Dumbbell size={40} color="#E11D48" />
          <Text style={styles.emptyTitle}>Hevy-Grade Strength Tracker</Text>
          <Text style={styles.emptySubtitle}>
            Log sets, auto-calculate 1RM volume, and use our circular rest timer.
          </Text>
          <TouchableOpacity
            onPress={() => startWorkout("Conventional Deadlift Session")}
            style={styles.startWorkoutButton}
          >
            <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
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
        <TouchableOpacity onPress={finishWorkout} style={styles.finishButton}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* CIRCULAR REST TIMER (INSPIRATION PHOTO 3) */}
      {activeWorkout.isResting && activeWorkout.restTimerSeconds > 0 && (
        <View style={styles.circularTimerCard}>
          <Text style={styles.restTitle}>REST PERIOD</Text>
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
            <Text style={styles.targetBadgeText}>POSTERIOR CHAIN</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B", padding: 16 },
  emptyContent: { paddingBottom: 110 },
  sectionTitle: { color: "#71717A", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 12 },
  prRingsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  prRingItem: { alignItems: "center" },
  prRingCircle: { width: 78, height: 78, borderRadius: 39, borderWidth: 3, borderColor: "#E11D48", alignItems: "center", justifyContent: "center", backgroundColor: "#121215" },
  prRingWeight: { color: "#FAFAFA", fontSize: 20, fontWeight: "900" },
  prRingUnit: { color: "#71717A", fontSize: 10, fontWeight: "800", marginTop: -2 },
  prRingLabel: { color: "#A1A1AA", fontSize: 11, fontWeight: "700", marginTop: 6 },
  emptyCard: { borderWidth: 1, borderColor: "#27272A", borderRadius: 18, backgroundColor: "#121215", padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#FAFAFA", marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: "#A1A1AA", textAlign: "center", marginTop: 4, lineHeight: 18, maxWidth: 260 },
  startWorkoutButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#E11D48", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, marginTop: 16 },
  startWorkoutText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  title: { color: "#FAFAFA", fontSize: 18, fontWeight: "800" },
  timerText: { color: "#10B981", fontSize: 12, marginTop: 2, fontWeight: "600" },
  finishButton: { backgroundColor: "#10B981", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  finishText: { color: "#000000", fontWeight: "800", fontSize: 12 },
  circularTimerCard: { backgroundColor: "#121215", borderRadius: 18, padding: 18, alignItems: "center", borderWidth: 1, borderColor: "#27272A", marginBottom: 16 },
  restTitle: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  timerRingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginVertical: 12 },
  timerAdjustBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#18181B", borderWidth: 1, borderColor: "#27272A", alignItems: "center", justifyContent: "center" },
  timerAdjustText: { color: "#FAFAFA", fontSize: 12, fontWeight: "800" },
  circularClock: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: "#10B981", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(16, 185, 129, 0.08)" },
  secondsBig: { color: "#FAFAFA", fontSize: 32, fontWeight: "900" },
  secondsLabel: { color: "#10B981", fontSize: 10, fontWeight: "800", marginTop: -2 },
  skipBtn: { padding: 4 },
  skipText: { color: "#71717A", fontSize: 11, fontWeight: "700" },
  exerciseCard: { backgroundColor: "#121215", borderRadius: 16, borderWidth: 1, borderColor: "#18181B", padding: 16 },
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  exerciseName: { color: "#FAFAFA", fontSize: 15, fontWeight: "800" },
  targetBadge: { backgroundColor: "rgba(225, 29, 72, 0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  targetBadgeText: { color: "#E11D48", fontSize: 9, fontWeight: "800" },
  setGrid: { gap: 8 },
  setRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#18181B", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#27272A" },
  setRowCompleted: { borderColor: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.08)" },
  setNumberText: { color: "#71717A", fontSize: 12, fontWeight: "800" },
  setWeightText: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#71717A", alignItems: "center", justifyContent: "center" },
  checkCircleCompleted: { borderColor: "#10B981", backgroundColor: "#10B981" },
  addSetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, marginTop: 10 },
  addSetText: { color: "#A1A1AA", fontSize: 12, fontWeight: "700" },
});