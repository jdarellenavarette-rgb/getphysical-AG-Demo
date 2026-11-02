import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Dumbbell, Footprints, Apple, TrendingUp } from "lucide-react-native";
import { LiftTracker } from "./LiftTracker";
import { MoveTrackerView } from "./MoveTrackerView";
import { FoodTrackerView } from "./FoodTrackerView";
import { JourneyView } from "./JourneyView";

type TrackSegment = "lift" | "move" | "food" | "journey";

export function TrackHub() {
  const [activeSegment, setActiveSegment] = useState<TrackSegment>("lift");

  return (
    <View style={styles.container}>
      {/* TODAY'S SUMMARY STRIP */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>1</Text>
          <Text style={styles.summaryLabel}>Workouts</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>873.6 kcal</Text>
          <Text style={styles.summaryLabel}>Burned</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>4.02 km</Text>
          <Text style={styles.summaryLabel}>GPS Move</Text>
        </View>
      </View>

      {/* 4-SEGMENT DOCK (LIFT | MOVE | FOOD | JOURNEY) */}
      <View style={styles.toggleBar}>
        <TouchableOpacity
          onPress={() => setActiveSegment("lift")}
          style={[styles.togglePill, activeSegment === "lift" && styles.togglePillActive]}
        >
          <Dumbbell size={13} color={activeSegment === "lift" ? "#FFFFFF" : "#71717A"} />
          <Text style={[styles.toggleText, activeSegment === "lift" && styles.toggleTextActive]}>
            Lift
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment("move")}
          style={[styles.togglePill, activeSegment === "move" && styles.togglePillActive]}
        >
          <Footprints size={13} color={activeSegment === "move" ? "#FFFFFF" : "#71717A"} />
          <Text style={[styles.toggleText, activeSegment === "move" && styles.toggleTextActive]}>
            Move
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment("food")}
          style={[styles.togglePill, activeSegment === "food" && styles.togglePillActive]}
        >
          <Apple size={13} color={activeSegment === "food" ? "#FFFFFF" : "#71717A"} />
          <Text style={[styles.toggleText, activeSegment === "food" && styles.toggleTextActive]}>
            Food
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment("journey")}
          style={[styles.togglePill, activeSegment === "journey" && styles.togglePillActive]}
        >
          <TrendingUp size={13} color={activeSegment === "journey" ? "#FFFFFF" : "#71717A"} />
          <Text style={[styles.toggleText, activeSegment === "journey" && styles.toggleTextActive]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  summaryStrip: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#121215", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  summaryItem: { alignItems: "center" },
  summaryVal: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
  summaryLabel: { color: "#71717A", fontSize: 10, marginTop: 2 },
  toggleBar: { flexDirection: "row", backgroundColor: "#18181B", marginHorizontal: 12, marginVertical: 8, borderRadius: 12, padding: 3 },
  togglePill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 10 },
  togglePillActive: { backgroundColor: "#E11D48" },
  toggleText: { color: "#71717A", fontSize: 11, fontWeight: "700" },
  toggleTextActive: { color: "#FFFFFF" },
});
