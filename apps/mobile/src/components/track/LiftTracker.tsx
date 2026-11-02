import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Play, Check, Plus, Timer, Dumbbell, Sparkles } from "lucide-react-native";
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

  // EMPTY STATE: If no workout is active
  if (!activeWorkout.isActive) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Dumbbell size={44} color="#EC4899" />
          <Text style={styles.emptyTitle}>No Active Workout</Text>
          <Text style={styles.emptySubtitle}>
            Start a blank workout session or select an exercise to begin tracking your sets and rest periods.
          </Text>
          <TouchableOpacity
            onPress={() => startWorkout("Conventional Deadlift Session")}
            style={styles.startWorkoutButton}
          >
            <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.startWorkoutText}>Start Blank Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ACTIVE WORKOUT HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{activeWorkout.title}</Text>
          <Text style={styles.timerText}>In Progress • Logging Sets</Text>
        </View>
        <TouchableOpacity onPress={finishWorkout} style={styles.finishButton}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* FLOATING REST TIMER */}
      {activeWorkout.isResting && activeWorkout.restTimerSeconds > 0 && (
        <View style={styles.restBanner}>
          <View style={styles.restLeft}>
            <Timer size={16} color="#10B981" />
            <Text style={styles.restText}>
              Rest Timer: {activeWorkout.restTimerSeconds}s
            </Text>
          </View>
          <View style={styles.restControls}>
            <TouchableOpacity onPress={() => adjustRestTimer(15)} style={styles.adjustPill}>
              <Text style={styles.adjustText}>+15s</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={stopRestTimer} style={styles.adjustPill}>
              <Text style={styles.adjustText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* WORKING SETS */}
      <View style={styles.exerciseCard}>
        <Text style={styles.exerciseName}>Conventional Deadlift</Text>
        <View style={styles.setGrid}>
          {sets.map((set, idx) => (
            <TouchableOpacity
              key={set.setNumber}
              onPress={() => toggleSet(idx)}
              style={[styles.setRow, set.isCompleted && styles.setRowCompleted]}
            >
              <Text style={styles.setNumberText}>Set {set.setNumber}</Text>
              <Text style={styles.setWeightText}>{set.weight} kg × {set.reps}</Text>
              <View style={[styles.checkCircle, set.isCompleted && styles.checkCircleCompleted]}>
                {set.isCompleted && <Check size={14} color="#000000" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B", padding: 16 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#09090B" },
  emptyCard: {
    width: "100%", borderWidth: 1, borderColor: "#27272A", borderRadius: 18, backgroundColor: "#121215",
    padding: 28, alignItems: "center"
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#FAFAFA", marginTop: 14 },
  emptySubtitle: { fontSize: 12, color: "#A1A1AA", textAlign: "center", marginTop: 6, lineHeight: 18, maxWidth: 260 },
  startWorkoutButton: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#EC4899", paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 999, marginTop: 20
  },
  startWorkoutText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  title: { color: "#FAFAFA", fontSize: 18, fontWeight: "800" },
  timerText: { color: "#EC4899", fontSize: 12, marginTop: 2, fontWeight: "600" },
  finishButton: { backgroundColor: "#10B981", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  finishText: { color: "#000000", fontWeight: "800", fontSize: 12 },
  restBanner: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)", borderRadius: 10, padding: 12, marginBottom: 14
  },
  restLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  restText: { color: "#10B981", fontSize: 12, fontWeight: "700" },
  restControls: { flexDirection: "row", gap: 6 },
  adjustPill: { backgroundColor: "#18181B", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  adjustText: { color: "#FAFAFA", fontSize: 10, fontWeight: "700" },
  exerciseCard: { backgroundColor: "#121215", borderRadius: 14, borderWidth: 1, borderColor: "#18181B", padding: 16 },
  exerciseName: { color: "#FAFAFA", fontSize: 15, fontWeight: "700", marginBottom: 12 },
  setGrid: { gap: 8 },
  setRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#18181B",
    padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#27272A"
  },
  setRowCompleted: { backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "#10B981" },
  setNumberText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  setWeightText: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: "#71717A", alignItems: "center", justifyContent: "center" },
  checkCircleCompleted: { backgroundColor: "#10B981", borderColor: "#10B981" },
});
