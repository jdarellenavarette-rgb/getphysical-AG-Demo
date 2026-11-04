import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Dumbbell, Footprints, Apple, TrendingUp, Zap } from "lucide-react-native";
import { LiftTracker } from "./LiftTracker";
import { MoveTrackerView } from "./MoveTrackerView";
import { FoodTrackerView } from "./FoodTrackerView";
import { JourneyView } from "./JourneyView";
import { NasmBiometricsModal } from "../profile/NasmBiometricsModal";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore } from "../../store/trackingStore";

type TrackSegment = "lift" | "move" | "food" | "journey";

export function TrackHub() {
  const [activeSegment, setActiveSegment] = useState<TrackSegment>("lift");
  const [isNasmOpen, setIsNasmOpen] = useState(false);
  const { colors } = useThemeStore();
  const { liftSessions, moveActivities, dailyTargets } = useTrackingStore();

  const totalWorkouts = liftSessions.length + moveActivities.length;
  const totalBurned =
    moveActivities.reduce((s, a) => s + a.caloriesBurned, 0) +
    liftSessions.reduce((s, l) => s + Math.round((l.durationSeconds / 60) * 6.5), 0);
  const totalGpsKm = moveActivities.reduce((s, a) => s + a.distanceKm, 0).toFixed(2);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      {/* TODAY'S DYNAMIC SUMMARY STRIP */}
      <View style={[styles.summaryStrip, { backgroundColor: colors.bgCard, borderBottomColor: colors.borderColor }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>{totalWorkouts}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Workouts</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>{totalBurned || 873} kcal</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Burned</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>{totalGpsKm} km</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>GPS Move</Text>
        </View>
        <TouchableOpacity onPress={() => setIsNasmOpen(true)} style={styles.summaryItem}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>{dailyTargets.calories}</Text>
            <Zap size={11} color="#E11D48" />
          </View>
          <Text style={[styles.summaryLabel, { color: "#E11D48", fontWeight: "700" }]}>NASM Goal</Text>
        </TouchableOpacity>
      </View>

      {/* 4-SEGMENT DOCK (LIFT | MOVE | FOOD | JOURNEY) */}
      <View style={[styles.toggleBar, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
        <TouchableOpacity
          onPress={() => setActiveSegment("lift")}
          style={[styles.togglePill, activeSegment === "lift" && styles.togglePillActive]}
        >
          <Dumbbell size={13} color={activeSegment === "lift" ? "#FFFFFF" : colors.textMuted} />
          <Text style={[styles.toggleText, { color: colors.textMuted }, activeSegment === "lift" && styles.toggleTextActive]}>
            Lift
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment("move")}
          style={[styles.togglePill, activeSegment === "move" && styles.togglePillActive]}
        >
          <Footprints size={13} color={activeSegment === "move" ? "#FFFFFF" : colors.textMuted} />
          <Text style={[styles.toggleText, { color: colors.textMuted }, activeSegment === "move" && styles.toggleTextActive]}>
            Move
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment("food")}
          style={[styles.togglePill, activeSegment === "food" && styles.togglePillActive]}
        >
          <Apple size={13} color={activeSegment === "food" ? "#FFFFFF" : colors.textMuted} />
          <Text style={[styles.toggleText, { color: colors.textMuted }, activeSegment === "food" && styles.toggleTextActive]}>
            Food
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment("journey")}
          style={[styles.togglePill, activeSegment === "journey" && styles.togglePillActive]}
        >
          <TrendingUp size={13} color={activeSegment === "journey" ? "#FFFFFF" : colors.textMuted} />
          <Text style={[styles.toggleText, { color: colors.textMuted }, activeSegment === "journey" && styles.toggleTextActive]}>
            Journey
          </Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVE SEGMENT CONTENT */}
      <View style={{ flex: 1 }}>
        {activeSegment === "lift" && <LiftTracker />}
        {activeSegment === "move" && <MoveTrackerView />}
        {activeSegment === "food" && <FoodTrackerView />}
        {activeSegment === "journey" && <JourneyView />}
      </View>
      <NasmBiometricsModal visible={isNasmOpen} onClose={() => setIsNasmOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryStrip: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 10, borderBottomWidth: 1 },
  summaryItem: { alignItems: "center" },
  summaryVal: { fontSize: 13, fontWeight: "800" },
  summaryLabel: { fontSize: 10, marginTop: 2 },
  toggleBar: { flexDirection: "row", marginHorizontal: 12, marginVertical: 8, borderRadius: 12, padding: 3, borderWidth: 1 },
  togglePill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 10 },
  togglePillActive: { backgroundColor: "#E11D48" },
  toggleText: { fontSize: 11, fontWeight: "700" },
  toggleTextActive: { color: "#FFFFFF" },
});
