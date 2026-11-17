import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert } from "react-native";
import { Plus, Minus, Award, Flame, Timer } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useTrackingStore, type LoggedSet, type ProgramExercise } from "../../store/trackingStore";
import { BLANK_SETS, useLiftSessionStore } from "../../store/liftSessionStore";
import { LiftLaunchpadView } from "./LiftLaunchpadView";
import { SetRow, SetTableHeader } from "./SetRow";
import { haptics } from "../../lib/haptics";
import { SheetBackdrop } from "../common/SheetParts";

const REST_SECONDS = 90;

const formatClock = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function LiftTracker() {
  const { colors } = useThemeStore();
  const { addPost } = useEcosystemStore();
  const { liftSessions, saveLiftSession } = useTrackingStore();

  const {
    isTraining,
    workoutTitle,
    exerciseName: activeExerciseName,
    sets,
    startedAt,
    restUntil,
    sessionId,
    setWorkoutTitle,
    setExerciseName: setActiveExerciseName,
    setSets,
    setRestUntil,
    start,
    end,
  } = useLiftSessionStore();
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  // One tick a second redraws the clocks; the times themselves come from timestamps.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isTraining) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isTraining]);

  const elapsedSeconds = startedAt ? Math.max(0, Math.round((now - startedAt) / 1000)) : 0;
  const restSeconds = restUntil ? Math.max(0, Math.round((restUntil - now) / 1000)) : 0;
  const setRestSeconds = (seconds: number) => setRestUntil(seconds > 0 ? Date.now() + seconds * 1000 : null);

  const toggleSet = (idx: number) => {
    const completing = !sets[idx]?.isCompleted;
    if (completing) {
      haptics.impact();
      setRestSeconds(REST_SECONDS);
    }
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, isCompleted: !s.isCompleted } : s)));
  };

  const updateSet = (idx: number, patch: Partial<Pick<LoggedSet, "weight" | "reps">>) => {
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };
  const addSet = () => {
    haptics.tap();
    setSets((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        { setNumber: prev.length + 1, weight: last?.weight ?? 60, reps: last?.reps ?? 5, isCompleted: false },
      ];
    });
  };
  const removeLastSet = () => setSets((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  const completedSets = sets.filter((s) => s.isCompleted);
  const totalVolumeKg = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);

  const endSession = () => {
    setIsFinishModalOpen(false);
    end();
  };

  const confirmDiscard = () => {
    Alert.alert("Discard this workout?", "Nothing from this session will be saved.", [
      { text: "Keep training", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: endSession },
    ]);
  };

  const handleFinishSession = (shareToFeed = false) => {
    const topSet = completedSets.reduce<LoggedSet | null>(
      (best, s) => (!best || s.weight > best.weight ? s : best),
      null,
    );
    if (!topSet) return;

    // A PR is a heavier completed set than any earlier session of the same exercise.
    const exerciseKey = activeExerciseName.trim().toLowerCase();
    const previousBest = liftSessions
      .flatMap((session) => session.exercises)
      .filter((exercise) => exercise.name.trim().toLowerCase() === exerciseKey)
      .flatMap((exercise) => exercise.sets)
      .filter((set) => set.isCompleted)
      .reduce((best, set) => Math.max(best, set.weight), 0);
    const isPR = previousBest > 0 && topSet.weight > previousBest;

    const title = workoutTitle.trim() || "Workout";
    const exerciseName = activeExerciseName.trim() || "Exercise";

    saveLiftSession({
      title,
      durationSeconds: elapsedSeconds,
      exercises: [{ id: `ex_${Date.now()}`, name: exerciseName, sets: completedSets }],
      totalVolumeKg,
      totalSets: completedSets.length,
      isPR,
    });

    if (shareToFeed) {
      addPost(
        `${title}: ${completedSets.length} sets, ${totalVolumeKg.toLocaleString()} kg total volume.${isPR ? " New personal best!" : ""}`,
        undefined,
        {
          id: `stamp_lift_${Date.now()}`,
          type: "lift",
          title: `${exerciseName} top set`,
          primaryMetric: `${topSet.weight} kg × ${topSet.reps}`,
          isVerified: false,
          isPR,
        },
      );
    }

    haptics.success();
    endSession();
    Alert.alert("Workout saved", "Your session is in your training history.");
  };

  const handleStartWorkout = (title?: string, exercises?: ProgramExercise[]) => {
    const first = exercises?.[0];
    const plannedSets = first
      ? Array.from({ length: first.sets }, (_, i) => ({
          setNumber: i + 1,
          weight: first.weightKg,
          reps: first.reps,
          isCompleted: false,
        }))
      : BLANK_SETS;
    haptics.impact();
    start(title, first?.name, plannedSets);
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgScreen }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={[styles.titleInput, { color: colors.textPrimary }]}
            value={workoutTitle}
            onChangeText={setWorkoutTitle}
            placeholder="Workout name"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Workout name"
          />
          <View style={styles.timerRow}>
            <Timer size={14} color={colors.accentGreen} />
            <Text style={[styles.timerText, { color: colors.accentGreen }]}>{formatClock(elapsedSeconds)}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setIsFinishModalOpen(true)}
          style={[styles.finishButton, { backgroundColor: colors.accent }]}
          accessibilityRole="button"
        >
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {restSeconds > 0 && (
        <View style={[styles.circularTimerCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.restTitle, { color: colors.textMuted }]}>REST</Text>
          <View style={styles.timerRingRow}>
            <TouchableOpacity
              onPress={() => setRestSeconds(Math.max(0, restSeconds - 15))}
              style={[styles.timerAdjustBtn, { backgroundColor: colors.bgInput }]}
            >
              <Text style={[styles.timerAdjustText, { color: colors.textPrimary }]}>-15s</Text>
            </TouchableOpacity>
            <View style={styles.circularClock}>
              <Text style={[styles.secondsBig, { color: colors.textPrimary }]}>{restSeconds}</Text>
              <Text style={styles.secondsLabel}>SEC</Text>
            </View>
            <TouchableOpacity
              onPress={() => setRestSeconds(restSeconds + 15)}
              style={[styles.timerAdjustBtn, { backgroundColor: colors.bgInput }]}
            >
              <Text style={[styles.timerAdjustText, { color: colors.textPrimary }]}>+15s</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setRestSeconds(0)} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip rest</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.exerciseCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <TextInput
          style={[styles.exerciseNameInput, { color: colors.textPrimary }]}
          value={activeExerciseName}
          onChangeText={setActiveExerciseName}
          placeholder="Exercise name"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Exercise name"
        />

        <SetTableHeader />
        <View style={styles.setGrid}>
          {sets.map((set, idx) => (
            <SetRow
              key={`${sessionId}_${set.setNumber}`}
              set={set}
              onChange={(patch) => updateSet(idx, patch)}
              onToggle={() => toggleSet(idx)}
            />
          ))}
        </View>

        <View style={styles.setActions}>
          <TouchableOpacity onPress={addSet} style={styles.addSetBtn} accessibilityRole="button">
            <Plus size={16} color={colors.accent} />
            <Text style={[styles.addSetText, { color: colors.accent }]}>Add set</Text>
          </TouchableOpacity>
          {sets.length > 1 && (
            <TouchableOpacity onPress={removeLastSet} style={styles.addSetBtn} accessibilityRole="button">
              <Minus size={16} color={colors.textMuted} />
              <Text style={[styles.addSetText, { color: colors.textMuted }]}>Remove last</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={isFinishModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFinishModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Tapping outside is the same as "Keep Training": nothing is lost. */}
          <SheetBackdrop onPress={() => setIsFinishModalOpen(false)} />
          <View style={[styles.finishSummaryCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Award size={44} color="#10B981" />
            <Text style={[styles.finishModalTitle, { color: colors.textPrimary }]}>Finish Workout</Text>
            <Text style={[styles.finishModalSubtitle, { color: colors.textMuted }]}>
              {completedSets.length === 0
                ? "Tick at least one set to save this workout."
                : `${completedSets.length} sets completed • ${totalVolumeKg.toLocaleString()} kg total volume`}
            </Text>
            {completedSets.length > 0 && (
              <>
                <TouchableOpacity
                  onPress={() => handleFinishSession(true)}
                  style={styles.shareFeedBtn}
                  accessibilityRole="button"
                >
                  <Flame size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.shareFeedText}>Save & Share to Feed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleFinishSession(false)}
                  style={styles.saveQuietlyBtn}
                  accessibilityRole="button"
                >
                  <Text style={[styles.saveQuietlyText, { color: colors.textPrimary }]}>Save Privately</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              onPress={() => setIsFinishModalOpen(false)}
              style={styles.saveQuietlyBtn}
              accessibilityRole="button"
            >
              <Text style={[styles.saveQuietlyText, { color: colors.textMuted }]}>Keep Training</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDiscard} style={styles.saveQuietlyBtn} accessibilityRole="button">
              <Text style={[styles.saveQuietlyText, { color: "#E11D48" }]}>Discard Workout</Text>
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
  titleInput: { fontSize: 22, fontWeight: "800", paddingVertical: 0 },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  timerText: { fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  finishButton: {
    minHeight: 44,
    paddingHorizontal: 22,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  finishText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  circularTimerCard: { borderRadius: 18, padding: 14, alignItems: "center", borderWidth: 1, marginBottom: 14 },
  restTitle: { fontSize: 11, fontWeight: "700" },
  timerRingRow: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 8 },
  timerAdjustBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  timerAdjustText: { fontSize: 12, fontWeight: "800" },
  circularClock: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16,185,129,0.08)",
  },
  secondsBig: { fontSize: 28, fontWeight: "900" },
  secondsLabel: { color: "#10B981", fontSize: 9, fontWeight: "800", marginTop: -2 },
  skipBtn: { padding: 4 },
  skipText: { fontSize: 11, fontWeight: "700" },
  exerciseCard: { borderRadius: 18, borderWidth: 1, padding: 14 },
  exerciseNameInput: { fontSize: 18, fontWeight: "800", marginBottom: 12, paddingVertical: 0 },
  setGrid: { gap: 6 },
  setActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  addSetBtn: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingHorizontal: 6 },
  addSetText: { fontSize: 14, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  finishSummaryCard: { borderRadius: 20, padding: 22, alignItems: "center", width: "100%", borderWidth: 1 },
  finishModalTitle: { fontSize: 18, fontWeight: "900", marginTop: 10 },
  finishModalSubtitle: { fontSize: 13, textAlign: "center", marginTop: 6, marginBottom: 18 },
  shareFeedBtn: {
    backgroundColor: "#E11D48",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  shareFeedText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  saveQuietlyBtn: { marginTop: 12, paddingVertical: 8 },
  saveQuietlyText: { fontSize: 12, fontWeight: "700" },
});
