import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from "react-native";
import { Award, Dumbbell, Flame } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { LiftSession } from "../../store/trackingStore";

interface LiftLaunchpadViewProps {
  workoutTitle: string;
  setWorkoutTitle: (t: string) => void;
  onStartTraining: () => void;
  liftSessions: LiftSession[];
}

export function LiftLaunchpadView({
  workoutTitle,
  setWorkoutTitle,
  onStartTraining,
  liftSessions,
}: LiftLaunchpadViewProps) {
  const { colors } = useThemeStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={styles.emptyContent}>
      <View style={styles.prHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Personal Bests (1RM)</Text>
        <View style={styles.verifiedTrophyPill}>
          <Award size={13} color="#10B981" />
          <Text style={styles.verifiedTrophyText}>VERIFIED</Text>
        </View>
      </View>

      <View style={styles.prRingsRow}>
        {[
          { name: "Deadlift", val: "225", unit: "KG" },
          { name: "Bench", val: "145", unit: "KG" },
          { name: "Squat", val: "190", unit: "KG" },
        ].map((pr) => (
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
        <Dumbbell size={32} color="#E11D48" style={{ marginBottom: 10 }} />
        <Text style={[styles.launchpadTitle, { color: colors.textPrimary }]}>Customizable Strength Tracker</Text>
        <TextInput
          style={[styles.customRoutineInput, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]}
          value={workoutTitle}
          onChangeText={setWorkoutTitle}
          placeholder="Routine Title (e.g. Heavy Squat & Pull)"
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity onPress={onStartTraining} style={styles.startWorkoutButton}>
          <Flame size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.startWorkoutText}>Start Heavy Session</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.historyBox, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <Text style={[styles.historyHeaderTitle, { color: colors.textPrimary }]}>Strength Memories & History ({liftSessions.length})</Text>
        {liftSessions.map((session) => (
          <View key={session.id} style={[styles.historyRow, { borderBottomColor: colors.borderColor }]}>
            <View>
              <Text style={[styles.historySessionTitle, { color: colors.textPrimary }]}>{session.title}</Text>
              <Text style={[styles.historySessionSub, { color: colors.textMuted }]}>
                {session.exercises[0]?.name} • {session.totalSets} sets • {session.totalVolumeKg.toLocaleString()} kg vol
              </Text>
            </View>
            {session.isPR && (
              <View style={styles.prBadge}>
                <Text style={styles.prBadgeText}>PR</Text>
              </View>
            )}
          </View>
        ))}
      </View>
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
  prRingsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  prRingItem: { alignItems: "center" },
  prRingCircle: { width: 78, height: 78, borderRadius: 39, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  prRingWeight: { fontSize: 20, fontWeight: "900" },
  prRingUnit: { color: "#8E8E93", fontSize: 10, fontWeight: "800", marginTop: -2 },
  prRingLabel: { fontSize: 12, fontWeight: "700", marginTop: 6 },
  launchpadCard: { borderWidth: 1, borderRadius: 20, padding: 20, alignItems: "center", marginBottom: 16 },
  launchpadTitle: { fontSize: 17, fontWeight: "800", marginBottom: 10 },
  customRoutineInput: { width: "100%", height: 42, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 13, marginBottom: 12 },
  startWorkoutButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#E11D48", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  startWorkoutText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  historyBox: { borderRadius: 18, borderWidth: 1, padding: 16 },
  historyHeaderTitle: { fontSize: 14, fontWeight: "800", marginBottom: 12 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1 },
  historySessionTitle: { fontSize: 13, fontWeight: "800" },
  historySessionSub: { fontSize: 11, marginTop: 2 },
  prBadge: { backgroundColor: "rgba(225,29,72,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  prBadgeText: { color: "#E11D48", fontSize: 10, fontWeight: "900" },
});
