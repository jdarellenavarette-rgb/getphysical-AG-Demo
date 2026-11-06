import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Plus } from "lucide-react-native";
import { useColors } from "../../theme/theme";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useTrackingStore, type LoggedSet, type ProgramExercise } from "../../store/trackingStore";
import { haptics } from "../../lib/haptics";
import { toast } from "../../feedback/toastStore";
import { LiftLaunchpadView } from "./LiftLaunchpadView";
import { SetRow } from "./lift/SetRow";
import { RestTimerPill } from "./lift/RestTimerPill";
import { FinishSessionSheet } from "./lift/FinishSessionSheet";
import { useRestTimer } from "./lift/useRestTimer";

const PR_THRESHOLD_KG = 225;
const INITIAL_SETS: LoggedSet[] = [
  { setNumber: 1, weight: 140, reps: 5, isCompleted: true },
  { setNumber: 2, weight: 180, reps: 3, isCompleted: true },
  { setNumber: 3, weight: 225, reps: 1, isCompleted: false },
];

function clock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

export function LiftTracker() {
  const colors = useColors();
  const addPost = useEcosystemStore((s) => s.addPost);
  const liftSessions = useTrackingStore((s) => s.liftSessions);
  const saveLiftSession = useTrackingStore((s) => s.saveLiftSession);
  const rest = useRestTimer();

  const [isTraining, setIsTraining] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [workoutTitle, setWorkoutTitle] = useState("Conventional Deadlift Routine");
  const [exerciseName, setExerciseName] = useState("Conventional Deadlift");
  const [sets, setSets] = useState<LoggedSet[]>(INITIAL_SETS);
  const [finishOpen, setFinishOpen] = useState(false);

  useEffect(() => {
    if (!isTraining) return undefined;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [isTraining, startedAt]);

  const toggleSet = (idx: number) => {
    const target = sets[idx];
    if (!target) return;
    if (!target.isCompleted) {
      haptics.success();
      rest.start();
    } else {
      haptics.light();
    }
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, isCompleted: !s.isCompleted } : s)));
  };
  const adjustWeight = (idx: number, d: number) => setSets((p) => p.map((s, i) => (i === idx ? { ...s, weight: Math.max(0, s.weight + d) } : s)));
  const adjustReps = (idx: number, d: number) => setSets((p) => p.map((s, i) => (i === idx ? { ...s, reps: Math.max(1, s.reps + d) } : s)));
  const addSet = () => {
    haptics.selection();
    setSets((prev) => {
      const last = prev[prev.length - 1];
      return [...prev, { setNumber: prev.length + 1, weight: last?.weight ?? 100, reps: last?.reps ?? 5, isCompleted: false }];
    });
  };

  const completed = sets.filter((s) => s.isCompleted);
  const volume = completed.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const maxWeight = Math.max(0, ...completed.map((s) => s.weight));
  const isPR = maxWeight >= PR_THRESHOLD_KG;

  const finish = (shareToFeed: boolean) => {
    saveLiftSession({
      title: workoutTitle,
      durationSeconds: Math.max(1, elapsed),
      exercises: [{ id: `ex_${Date.now()}`, name: exerciseName, sets }],
      totalVolumeKg: volume,
      totalSets: sets.length,
      isPR,
    });
    if (shareToFeed) {
      addPost(`${workoutTitle} completed! Total volume: ${volume.toLocaleString()} kg.`, "fac_metro_core", {
        id: `stamp_pr_${Date.now()}`,
        type: "lift",
        title: `${exerciseName} top set`,
        primaryMetric: `${maxWeight} kg`,
        isVerified: true,
        isPR,
      });
    }
    setFinishOpen(false);
    setIsTraining(false);
    rest.skip();
    toast.success(isPR ? "PR saved! 🏆" : "Workout saved", shareToFeed ? "Shared to your Sodia feed." : "Added to your training memories.");
  };

  const start = (title?: string, exercises?: ProgramExercise[]) => {
    if (title) setWorkoutTitle(title);
    const first = exercises?.[0];
    if (first) {
      setExerciseName(first.name);
      setSets(Array.from({ length: first.sets }, (_, i) => ({ setNumber: i + 1, weight: first.weightKg, reps: first.reps, isCompleted: false })));
    }
    setStartedAt(Date.now());
    setElapsed(0);
    setIsTraining(true);
    haptics.medium();
  };

  if (!isTraining) {
    return <LiftLaunchpadView workoutTitle={workoutTitle} setWorkoutTitle={setWorkoutTitle} onStartTraining={start} liftSessions={liftSessions} />;
  }

  const header = (
    <View>
      <View style={styles.header}>
        <View style={styles.flex}>
          <TextInput style={[styles.title, { color: colors.textPrimary }]} value={workoutTitle} onChangeText={setWorkoutTitle} accessibilityLabel="Workout name" />
          <Text style={[styles.timer, { color: colors.accentGreen }]} accessibilityLabel={`Elapsed ${clock(elapsed)}`}>{clock(elapsed)} • {volume.toLocaleString()} kg</Text>
        </View>
        <TouchableOpacity onPress={() => setFinishOpen(true)} style={[styles.finish, { backgroundColor: colors.accentGreen }]} accessibilityRole="button" accessibilityLabel="Finish workout">
          <Text style={[styles.finishText, { color: colors.textOnAccent }]}>Finish</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.exerciseHead, { borderColor: colors.borderColor }]}>
        <TextInput style={[styles.exercise, { color: colors.accentText }]} value={exerciseName} onChangeText={setExerciseName} accessibilityLabel="Exercise name" />
        <View style={styles.colHeads}>
          {["SET", "KG", "REPS", "✓"].map((h) => (
            <Text key={h} style={[styles.colHead, { color: colors.textMuted }, h === "SET" && styles.colSet, h === "✓" && styles.colCheck]}>{h}</Text>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <FlashList
        data={sets}
        keyExtractor={(s) => String(s.setNumber)}
        renderItem={({ item, index }) => <SetRow set={item} index={index} onAdjustWeight={adjustWeight} onAdjustReps={adjustReps} onToggle={toggleSet} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListHeaderComponent={header}
        ListFooterComponent={
          <TouchableOpacity onPress={addSet} style={[styles.addSet, { backgroundColor: colors.bgCardSecondary }]} accessibilityRole="button">
            <Plus size={16} color={colors.accentText} />
            <Text style={[styles.addSetText, { color: colors.accentText }]}>Add set</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      />
      {rest.isResting && rest.endsAt !== null ? (
        <RestTimerPill remainingMs={rest.remainingMs} totalMs={rest.totalMs} endsAt={rest.endsAt} onAdjust={rest.adjust} onSkip={rest.skip} />
      ) : null}
      <FinishSessionSheet
        visible={finishOpen}
        completedSets={completed.length}
        volumeKg={volume}
        durationLabel={clock(elapsed)}
        isPR={isPR}
        onClose={() => setFinishOpen(false)}
        onFinish={finish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 200 },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "900", minHeight: 44 },
  timer: { fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  finish: { minHeight: 44, paddingHorizontal: 18, borderRadius: 12, justifyContent: "center" },
  finishText: { fontSize: 14, fontWeight: "900" },
  exerciseHead: { paddingHorizontal: 16, paddingBottom: 6 },
  exercise: { fontSize: 17, fontWeight: "800", minHeight: 44 },
  colHeads: { flexDirection: "row", paddingHorizontal: 10, gap: 8 },
  colHead: { flex: 1, fontSize: 11, fontWeight: "800", textAlign: "center" },
  colSet: { flex: 0, width: 20 },
  colCheck: { flex: 0, width: 44 },
  sep: { height: 6 },
  addSet: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 48, borderRadius: 12, margin: 16 },
  addSetText: { fontSize: 14, fontWeight: "800" },
});
