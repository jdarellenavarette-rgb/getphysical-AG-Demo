import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Play, Check, Plus, Timer, Sparkles, Award } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface WorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
  isPR?: boolean;
}

export function LiftTracker() {
  const { activeWorkout, startRestTimer, adjustRestTimer, stopRestTimer } =
    useEcosystemStore();

  const [sets, setSets] = useState<WorkoutSet[]>([
    { setNumber: 1, weight: 100, reps: 10, isCompleted: true },
    { setNumber: 2, weight: 140, reps: 8, isCompleted: true },
    { setNumber: 3, weight: 180, reps: 5, isCompleted: false },
    { setNumber: 4, weight: 225, reps: 1, isCompleted: false, isPR: true },
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ACTIVE WORKOUT HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{activeWorkout.title}</Text>
          <Text style={styles.timerText}>Session Duration: 23:40</Text>
        </View>
        <TouchableOpacity style={styles.finishButton}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* FLOATING REST TIMER NOTIFICATION */}
      {activeWorkout.isResting && (
        <View style={styles.restTimerCard}>
          <View style={styles.restTimerLeft}>
            <Timer size={18} color="#10B981" />
            <Text style={styles.restTimerText}>
              REST: {Math.floor(activeWorkout.restTimerSeconds / 60)}:
              {(activeWorkout.restTimerSeconds % 60).toString().padStart(2, "0")}
            </Text>
          </View>
          <View style={styles.restTimerActions}>
            <TouchableOpacity onPress={() => adjustRestTimer(15)} style={styles.timerPill}>
              <Text style={styles.timerPillText}>+15s</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={stopRestTimer} style={styles.timerPillSkip}>
              <Text style={styles.timerPillSkipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* EXERCISE BLOCK */}
      <View style={styles.exerciseBlock}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>Barbell Conventional Deadlift</Text>
          <Award size={18} color="#F59E0B" />
        </View>

        <View style={styles.gridHeader}>
          <Text style={[styles.colHeader, { width: 36 }]}>SET</Text>
          <Text style={[styles.colHeader, { flex: 1 }]}>WEIGHT (KG)</Text>
          <Text style={[styles.colHeader, { flex: 1 }]}>REPS</Text>
          <Text style={[styles.colHeader, { width: 44, textAlign: "center" }]}>LOG</Text>
        </View>

        {sets.map((s, idx) => (
          <View
            key={s.setNumber}
            style={[styles.setRow, s.isCompleted && styles.completedRow]}
          >
            <Text style={styles.setNumberText}>{s.setNumber}</Text>
            <Text style={styles.valText}>{s.weight}</Text>
            <Text style={styles.valText}>{s.reps}</Text>
            <TouchableOpacity
              onPress={() => toggleSet(idx)}
              style={[styles.checkButton, s.isCompleted && styles.checkButtonActive]}
            >
              <Check size={16} color={s.isCompleted ? "#FFFFFF" : "#71717A"} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={() =>
            setSets((prev) => [
              ...prev,
              { setNumber: prev.length + 1, weight: 200, reps: 3, isCompleted: false },
            ])
          }
          style={styles.addSetButton}
        >
          <Plus size={14} color="#FAFAFA" />
          <Text style={styles.addSetText}>Add Set</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { color: "#FAFAFA", fontSize: 18, fontWeight: "800" },
  timerText: { color: "#10B981", fontSize: 12, fontWeight: "600", marginTop: 2 },
  finishButton: { backgroundColor: "#E11D48", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  finishText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  restTimerCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(16, 185, 129, 0.15)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)", borderRadius: 12, padding: 12, marginBottom: 16 },
  restTimerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  restTimerText: { color: "#10B981", fontSize: 14, fontWeight: "800" },
  restTimerActions: { flexDirection: "row", gap: 8 },
  timerPill: { backgroundColor: "#27272A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  timerPillText: { color: "#FAFAFA", fontSize: 11, fontWeight: "700" },
  timerPillSkip: { backgroundColor: "#E11D48", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  timerPillSkipText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  exerciseBlock: { backgroundColor: "#121215", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#18181B" },
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  exerciseName: { color: "#FAFAFA", fontSize: 15, fontWeight: "700" },
  gridHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#18181B", paddingBottom: 8, marginBottom: 8 },
  colHeader: { color: "#71717A", fontSize: 11, fontWeight: "700" },
  setRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  completedRow: { backgroundColor: "rgba(16, 185, 129, 0.08)" },
  setNumberText: { width: 36, color: "#71717A", fontSize: 13, fontWeight: "600" },
  valText: { flex: 1, color: "#FAFAFA", fontSize: 14, fontWeight: "700" },
  checkButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#18181B", borderWidth: 1, borderColor: "#27272A", alignItems: "center", justifyContent: "center" },
  checkButtonActive: { backgroundColor: "#10B981", borderColor: "#10B981" },
  addSetButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, marginTop: 8, gap: 6 },
  addSetText: { color: "#FAFAFA", fontSize: 12, fontWeight: "600" },
});
