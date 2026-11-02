import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Dumbbell, Footprints, Apple } from "lucide-react-native";
import { LiftTracker } from "./LiftTracker";
import { MoveTrackerView } from "./MoveTrackerView";
import { FoodTrackerView } from "./FoodTrackerView";

type TrackSegment = "lift" | "move" | "food";

export function TrackHub() {
  const [activeSegment, setActiveSegment] = useState<TrackSegment>("lift");

  return (
    <View style={styles.container}>
      {/* TODAY'S SUMMARY STRIP */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>0</Text>
          <Text style={styles.summaryLabel}>Workouts Today</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>2600</Text>
          <Text style={styles.summaryLabel}>Cal Target</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>0.0 km</Text>
          <Text style={styles.summaryLabel}>Today's Move</Text>
        </View>
      </View>

      {/* SEGMENTED TOGGLE (LIFT | MOVE | FOOD) */}
      <View style={styles.toggleBar}>
        <TouchableOpacity
          onPress={() => setActiveSegment("lift")}
          style={[styles.togglePill, activeSegment === "lift" && styles.togglePillActive]}
        >
          <Dumbbell size={14} color={activeSegment === "lift" ? "#FFFFFF" : "#71717A"} />
          <Text style={[styles.toggleText, activeSegment === "lift" && styles.toggleTextActive]}>
            Lift
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment("move")}
          style={[styles.togglePill, activeSegment === "move" && styles.togglePillActive]}
        >
          <Footprints size={14} color={activeSegment === "move" ? "#FFFFFF" : "#71717A"} />
          <Text style={[styles.toggleText, activeSegment === "move" && styles.toggleTextActive]}>
            Move
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment("food")}
          style={[styles.togglePill, activeSegment === "food" && styles.togglePillActive]}
        >
          <Apple size={14} color={activeSegment === "food" ? "#FFFFFF" : "#71717A"} />
          <Text style={[styles.toggleText, activeSegment === "food" && styles.toggleTextActive]}>
            Food
          </Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVE SEGMENT CONTENT */}
      <View style={{ flex: 1 }}>
        {activeSegment === "lift" && <LiftTracker />}
        {activeSegment === "move" && <MoveTrackerView />}
        {activeSegment === "food" && <FoodTrackerView />}
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
  toggleBar: { flexDirection: "row", backgroundColor: "#18181B", margin: 12, borderRadius: 10, padding: 4 },
  togglePill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 8 },
  togglePillActive: { backgroundColor: "#E11D48" },
  toggleText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  toggleTextActive: { color: "#FFFFFF" },
});