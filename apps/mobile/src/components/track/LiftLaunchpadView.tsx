import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from "react-native";
import { Award, Dumbbell, Flame, Plus, ChevronRight, BookOpen } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore, type LiftSession, type ProgramDay, type ProgramExercise } from "../../store/trackingStore";
import { CreateProgramModal } from "./CreateProgramModal";

interface LiftLaunchpadViewProps {
  workoutTitle: string;
  setWorkoutTitle: (t: string) => void;
  onStartTraining: (title?: string, exercises?: ProgramExercise[]) => void;
  liftSessions: LiftSession[];
}

export function LiftLaunchpadView({
  workoutTitle,
  setWorkoutTitle,
  onStartTraining,
  liftSessions,
}: LiftLaunchpadViewProps) {
  const { colors } = useThemeStore();
  const { savedPrograms } = useTrackingStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProgId, setSelectedProgId] = useState<string>(savedPrograms[0]?.id ?? "");

  const activeProg = savedPrograms.find((p) => p.id === selectedProgId) ?? savedPrograms[0];

  const handleLaunchDay = (day: ProgramDay) => {
    onStartTraining(`${activeProg?.title ?? "Program"}: ${day.dayName}`, day.exercises);
  };

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
        <Dumbbell size={28} color="#E11D48" style={{ marginBottom: 6 }} />
        <Text style={[styles.launchpadTitle, { color: colors.textPrimary }]}>Quick Strength Session</Text>
        <TextInput
          style={[styles.customRoutineInput, { backgroundColor: colors.bgCardSecondary, color: colors.textPrimary, borderColor: colors.borderColor }]}
          value={workoutTitle}
          onChangeText={setWorkoutTitle}
          placeholder="Routine Title (e.g. Heavy Squat & Pull)"
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity onPress={() => onStartTraining()} style={styles.startWorkoutButton}>
          <Flame size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.startWorkoutText}>Start Heavy Session</Text>
        </TouchableOpacity>
      </View>

      {/* Training Programs Vault */}
      <View style={styles.programsSectionHeader}>
        <View style={styles.headerLeft}>
          <BookOpen size={16} color="#E11D48" />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Training Programs Vault</Text>
        </View>
        <TouchableOpacity onPress={() => setIsCreateOpen(true)} style={styles.createProgBtn}>
          <Plus size={13} color="#E11D48" />
          <Text style={styles.createProgText}>+ New Program</Text>
        </TouchableOpacity>
      </View>

      {/* Program Selector Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.progTabsRow} contentContainerStyle={{ gap: 8 }}>
        {savedPrograms.map((prog) => {
          const isSelected = prog.id === activeProg?.id;
          return (
            <TouchableOpacity
              key={prog.id}
              onPress={() => setSelectedProgId(prog.id)}
              style={[
                styles.progTabPill,
                { backgroundColor: isSelected ? "#E11D48" : colors.bgCard, borderColor: isSelected ? "#E11D48" : colors.borderColor },
              ]}
            >
              <Text style={[styles.progTabTitle, { color: isSelected ? "#FFFFFF" : colors.textPrimary }]}>{prog.title}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Active Program Card */}
      {activeProg && (
        <View style={[styles.activeProgCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Text style={[styles.activeProgDesc, { color: colors.textMuted }]}>{activeProg.description}</Text>
          <View style={styles.daysList}>
            {activeProg.days.map((day) => (
              <TouchableOpacity
                key={day.id}
                onPress={() => handleLaunchDay(day)}
                style={[styles.dayItemRow, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dayItemName, { color: colors.textPrimary }]}>{day.dayName}</Text>
                  <Text style={[styles.dayItemMeta, { color: colors.textMuted }]}>
                    {day.exercises.map((e) => e.name).join(" • ")}
                  </Text>
                </View>
                <View style={styles.launchDayBtn}>
                  <Text style={styles.launchDayText}>Start Day</Text>
                  <ChevronRight size={14} color="#E11D48" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* History */}
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

      <CreateProgramModal visible={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
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
  launchpadCard: { borderWidth: 1, borderRadius: 18, padding: 16, alignItems: "center", marginBottom: 16 },
  launchpadTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  customRoutineInput: { width: "100%", borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 13, fontWeight: "600", marginBottom: 10, textAlign: "center" },
  startWorkoutButton: { backgroundColor: "#E11D48", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "center" },
  startWorkoutText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  programsSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 4 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  createProgBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: "rgba(225,29,72,0.1)" },
  createProgText: { color: "#E11D48", fontSize: 11, fontWeight: "800" },
  progTabsRow: { marginBottom: 12 },
  progTabPill: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  progTabTitle: { fontSize: 12, fontWeight: "800" },
  activeProgCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16 },
  activeProgDesc: { fontSize: 12, fontWeight: "600", marginBottom: 10 },
  daysList: { gap: 8 },
  dayItemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 10, padding: 10, borderWidth: 1 },
  dayItemName: { fontSize: 13, fontWeight: "800", marginBottom: 2 },
  dayItemMeta: { fontSize: 11 },
  launchDayBtn: { flexDirection: "row", alignItems: "center", gap: 2, paddingLeft: 8 },
  launchDayText: { color: "#E11D48", fontSize: 11, fontWeight: "800" },
  historyBox: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16 },
  historyHeaderTitle: { fontSize: 14, fontWeight: "800", marginBottom: 10 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1 },
  historySessionTitle: { fontSize: 13, fontWeight: "700" },
  historySessionSub: { fontSize: 11, marginTop: 2 },
  prBadge: { backgroundColor: "#10B981", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  prBadgeText: { color: "#000000", fontSize: 10, fontWeight: "900" },
});
