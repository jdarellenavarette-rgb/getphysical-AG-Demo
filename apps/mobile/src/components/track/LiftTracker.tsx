import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert } from "react-native";
import { Check, Plus, Award, Flame } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useTrackingStore, type LoggedSet, type ProgramExercise } from "../../store/trackingStore";
import { LiftLaunchpadView } from "./LiftLaunchpadView";

export function LiftTracker() {
  const { colors } = useThemeStore();
  const { addPost } = useEcosystemStore();
  const { liftSessions, saveLiftSession } = useTrackingStore();

  const [isTraining, setIsTraining] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState("Conventional Deadlift Routine");
  const [activeExerciseName, setActiveExerciseName] = useState("Conventional Deadlift");
  const [restSeconds, setRestSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sets, setSets] = useState<LoggedSet[]>([
    { setNumber: 1, weight: 140, reps: 5, isCompleted: true },
    { setNumber: 2, weight: 180, reps: 3, isCompleted: true },
    { setNumber: 3, weight: 225, reps: 1, isCompleted: false },
  ]);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  useEffect(() => {
    let t: any = null;
    if (isTraining) {
      t = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
        setRestSeconds((r) => (r > 0 ? r - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isTraining]);

  const toggleSet = (idx: number) => {
    setSets((prev) =>
      prev.map((s, i) => {
        if (i === idx) {
          if (!s.isCompleted) setRestSeconds(90);
          return { ...s, isCompleted: !s.isCompleted };
        }
        return s;
      })
    );
  };

  const adjustWeight = (idx: number, delta: number) => {
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, weight: Math.max(0, s.weight + delta) } : s)));
  };
  const adjustReps = (idx: number, delta: number) => {
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, reps: Math.max(1, s.reps + delta) } : s)));
  };
  const addSet = () => {
    const last = sets[sets.length - 1];
    setSets((prev) => [...prev, { setNumber: prev.length + 1, weight: last?.weight ?? 100, reps: last?.reps ?? 5, isCompleted: false }]);
  };

  const handleFinishSession = (shareToFeed = false) => {
    const completedSets = sets.filter((s) => s.isCompleted);
    const totalVol = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    const maxWeight = Math.max(...sets.map((s) => s.weight), 0);
    const isPR = maxWeight >= 225;

    saveLiftSession({
      title: workoutTitle,
      durationSeconds: elapsedSeconds || 1800,
      exercises: [{ id: `ex_${Date.now()}`, name: activeExerciseName, sets }],
      totalVolumeKg: totalVol,
      totalSets: sets.length,
      isPR,
    });

    if (shareToFeed) {
      addPost(`${workoutTitle} completed! Verified PR stamp attached. Total volume: ${totalVol.toLocaleString()} kg.`, "fac_metro_core", {
        id: `stamp_pr_${Date.now()}`,
        type: "lift",
        title: `${activeExerciseName} 1RM`,
        primaryMetric: `${maxWeight} kg`,
        isVerified: true,
        isPR,
      });
    }

    setIsFinishModalOpen(false);
    setIsTraining(false);
    setElapsedSeconds(0);
    setRestSeconds(0);
    Alert.alert("Workout Saved!", "Your lift session and volume have been recorded to your athletic memories.");
  };

  const handleStartWorkout = (title?: string, exercises?: ProgramExercise[]) => {
    if (title) setWorkoutTitle(title);
    if (exercises && exercises.length > 0 && exercises[0]) {
      const first = exercises[0];
      setActiveExerciseName(first.name);
      setSets(Array.from({ length: first.sets }, (_, i) => ({
        setNumber: i + 1,
        weight: first.weightKg,
        reps: first.reps,
        isCompleted: false,
      })));
    }
    setIsTraining(true);
  };

  if (!isTraining) {
    return (
      <LiftLaunchpadView
        workoutTitle={workoutTitle}
        setWorkoutTitle={setWorkoutTitle}
        onStartTraining={handleStartWorkout}
        liftSessions={liftSessions}
      />
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <TextInput style={[styles.titleInput, { color: colors.textPrimary }]} value={workoutTitle} onChangeText={setWorkoutTitle} />
          <Text style={styles.timerText}>Active Time: {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</Text>
        </View>
        <TouchableOpacity onPress={() => setIsFinishModalOpen(true)} style={styles.finishButton}>
          <Text style={styles.finishText}>FINISH</Text>
        </TouchableOpacity>
      </View>

      {restSeconds > 0 && (
        <View style={[styles.circularTimerCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.restTitle, { color: colors.textMuted }]}>REST INTERVAL TIMER</Text>
          <View style={styles.timerRingRow}>
            <TouchableOpacity onPress={() => setRestSeconds((s) => Math.max(0, s - 15))} style={[styles.timerAdjustBtn, { backgroundColor: colors.bgInput }]}>
              <Text style={[styles.timerAdjustText, { color: colors.textPrimary }]}>-15s</Text>
            </TouchableOpacity>
            <View style={styles.circularClock}>
              <Text style={[styles.secondsBig, { color: colors.textPrimary }]}>{restSeconds}</Text>
              <Text style={styles.secondsLabel}>SEC REST</Text>
            </View>
            <TouchableOpacity onPress={() => setRestSeconds((s) => s + 15)} style={[styles.timerAdjustBtn, { backgroundColor: colors.bgInput }]}>
              <Text style={[styles.timerAdjustText, { color: colors.textPrimary }]}>+15s</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setRestSeconds(0)} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip Rest Timer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.exerciseCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.exerciseHeader}>
          <TextInput style={[styles.exerciseNameInput, { color: colors.textPrimary }]} value={activeExerciseName} onChangeText={setActiveExerciseName} />
          <View style={styles.targetBadge}><Text style={styles.targetBadgeText}>CUSTOM LIFTS</Text></View>
        </View>

        <View style={styles.setGrid}>
          {sets.map((set, idx) => (
            <View key={set.setNumber} style={[styles.setRow, { backgroundColor: colors.bgCardSecondary }, set.isCompleted && styles.setRowCompleted]}>
              <Text style={[styles.setNumberText, { color: colors.textMuted }]}>SET {set.setNumber}</Text>
              <View style={styles.weightRepControls}>
                <TouchableOpacity onPress={() => adjustWeight(idx, -5)} style={styles.stepBtn}><Text style={[styles.stepBtnText, { color: colors.textPrimary }]}>-</Text></TouchableOpacity>
                <Text style={[styles.setWeightText, { color: colors.textPrimary }]}>{set.weight}kg</Text>
                <TouchableOpacity onPress={() => adjustWeight(idx, 5)} style={styles.stepBtn}><Text style={[styles.stepBtnText, { color: colors.textPrimary }]}>+</Text></TouchableOpacity>
                <Text style={{ color: colors.textMuted, marginHorizontal: 4 }}>×</Text>
                <TouchableOpacity onPress={() => adjustReps(idx, -1)} style={styles.stepBtn}><Text style={[styles.stepBtnText, { color: colors.textPrimary }]}>-</Text></TouchableOpacity>
                <Text style={[styles.setWeightText, { color: colors.textPrimary }]}>{set.reps}r</Text>
                <TouchableOpacity onPress={() => adjustReps(idx, 1)} style={styles.stepBtn}><Text style={[styles.stepBtnText, { color: colors.textPrimary }]}>+</Text></TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => toggleSet(idx)} style={[styles.checkCircle, { borderColor: colors.borderColor }, set.isCompleted && styles.checkCircleCompleted]}>
                {set.isCompleted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </TouchableOpacity>
            </View>
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
            <Award size={44} color="#10B981" />
            <Text style={[styles.finishModalTitle, { color: colors.textPrimary }]}>Save Strength Session</Text>
            <Text style={[styles.finishModalSubtitle, { color: colors.textMuted }]}>
              {sets.filter((s) => s.isCompleted).length} sets completed • {sets.reduce((s, c) => s + (c.isCompleted ? c.weight * c.reps : 0), 0)} kg total volume
            </Text>
            <TouchableOpacity onPress={() => handleFinishSession(true)} style={styles.shareFeedBtn}>
              <Flame size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.shareFeedText}>Post PR Stamp to Sodia Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFinishSession(false)} style={styles.saveQuietlyBtn}>
              <Text style={[styles.saveQuietlyText, { color: colors.textMuted }]}>Save to Personal Memories</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  titleInput: { fontSize: 18, fontWeight: "800" },
  timerText: { color: "#10B981", fontSize: 12, marginTop: 2, fontWeight: "700" },
  finishButton: { backgroundColor: "#10B981", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  finishText: { color: "#000000", fontWeight: "900", fontSize: 12 },
  circularTimerCard: { borderRadius: 18, padding: 14, alignItems: "center", borderWidth: 1, marginBottom: 14 },
  restTitle: { fontSize: 11, fontWeight: "700" },
  timerRingRow: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 8 },
  timerAdjustBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  timerAdjustText: { fontSize: 12, fontWeight: "800" },
  circularClock: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: "#10B981", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(16,185,129,0.08)" },
  secondsBig: { fontSize: 28, fontWeight: "900" },
  secondsLabel: { color: "#10B981", fontSize: 9, fontWeight: "800", marginTop: -2 },
  skipBtn: { padding: 4 },
  skipText: { fontSize: 11, fontWeight: "700" },
  exerciseCard: { borderRadius: 18, borderWidth: 1, padding: 14 },
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  exerciseNameInput: { fontSize: 16, fontWeight: "800", flex: 1 },
  targetBadge: { backgroundColor: "rgba(225,29,72,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  targetBadgeText: { color: "#E11D48", fontSize: 9, fontWeight: "800" },
  setGrid: { gap: 8 },
  setRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 10, padding: 10 },
  setRowCompleted: { backgroundColor: "rgba(16,185,129,0.12)" },
  setNumberText: { fontSize: 11, fontWeight: "800" },
  weightRepControls: { flexDirection: "row", alignItems: "center" },
  stepBtn: { width: 24, height: 24, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  stepBtnText: { fontSize: 13, fontWeight: "800" },
  setWeightText: { fontSize: 13, fontWeight: "800", marginHorizontal: 4 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkCircleCompleted: { borderColor: "#10B981", backgroundColor: "#10B981" },
  addSetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, marginTop: 8 },
  addSetText: { fontSize: 13, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center", padding: 24 },
  finishSummaryCard: { borderRadius: 20, padding: 22, alignItems: "center", width: "100%", borderWidth: 1 },
  finishModalTitle: { fontSize: 18, fontWeight: "900", marginTop: 10 },
  finishModalSubtitle: { fontSize: 13, textAlign: "center", marginTop: 6, marginBottom: 18 },
  shareFeedBtn: { backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "center" },
  shareFeedText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  saveQuietlyBtn: { marginTop: 12, paddingVertical: 8 },
  saveQuietlyText: { fontSize: 12, fontWeight: "700" },
});
