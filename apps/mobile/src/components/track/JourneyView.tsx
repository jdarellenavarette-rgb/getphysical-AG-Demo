import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { TrendingUp } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore } from "../../store/trackingStore";
import { MemoryDetailModal, type JourneyMemoryItem } from "./MemoryDetailModal";
import { EmptyState } from "../common/EmptyState";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Rough energy cost of lifting: about 6.5 kcal a minute. */
const liftCalories = (durationSeconds: number): number => Math.round((durationSeconds / 60) * 6.5);

function formatDay(iso: string): string {
  const date = new Date(iso);
  if (date.toDateString() === new Date().toDateString()) return "Today";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function JourneyView() {
  const { colors } = useThemeStore();
  const { liftSessions, moveActivities, foodMeals } = useTrackingStore();
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<JourneyMemoryItem | null>(null);

  // Calories burned per day for the last seven days, ending today.
  const burnedEntries = [
    ...moveActivities.map((a) => ({ date: a.date, kcal: a.caloriesBurned })),
    ...liftSessions.map((l) => ({ date: l.date, kcal: liftCalories(l.durationSeconds) })),
  ];
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - i));
    const key = day.toDateString();
    const kcal = burnedEntries.filter((e) => new Date(e.date).toDateString() === key).reduce((s, e) => s + e.kcal, 0);
    return { label: DAY_LABELS[day.getDay()]!, kcal, isToday: i === 6 };
  });
  const weekBurned = week.reduce((s, d) => s + d.kcal, 0);
  const weekMax = Math.max(...week.map((d) => d.kcal), 1);
  const weekSessions = burnedEntries.filter(
    (e) => today.getTime() - new Date(e.date).getTime() < 7 * 86_400_000,
  ).length;

  const memories: (JourneyMemoryItem & { date: string })[] = [
    ...moveActivities.map((m) => ({
      id: m.id,
      date: m.date,
      title: m.title,
      venue: `${m.distanceKm.toFixed(2)} km`,
      duration: `${Math.floor(m.durationSeconds / 60)} min`,
      time: formatDay(m.date),
      cals: `${m.caloriesBurned} kcal`,
      badge: m.sport.toUpperCase(),
    })),
    ...liftSessions.map((l) => ({
      id: l.id,
      date: l.date,
      title: l.title,
      venue: `${l.exercises[0]?.name || "Strength"} • ${l.totalVolumeKg.toLocaleString()} kg`,
      duration: `${Math.floor(l.durationSeconds / 60)} min`,
      time: formatDay(l.date),
      cals: `${liftCalories(l.durationSeconds)} kcal`,
      badge: "STRENGTH",
    })),
    ...foodMeals.map((f) => ({
      id: f.id,
      date: f.date,
      title: f.name,
      venue: `P ${f.totalP} g • C ${f.totalC} g • F ${f.totalF} g`,
      duration: `${f.items.length} ${f.items.length === 1 ? "item" : "items"}`,
      time: formatDay(f.date),
      cals: `${f.totalCal} kcal`,
      badge: "MEAL",
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const displayedMemories = showAllActivities ? memories : memories.slice(0, 4);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgScreen }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[styles.heroCard, { backgroundColor: colors.bgCard, borderColor: colors.borderLight, borderWidth: 1 }]}
      >
        <Text style={[styles.heroEyebrow, { color: colors.textMuted }]}>LAST 7 DAYS</Text>
        <View style={styles.calHeroBlock}>
          <Text style={[styles.calValue, { color: colors.textPrimary }]}>{weekBurned.toLocaleString()}</Text>
          <Text style={[styles.calUnit, { color: colors.textSecondary }]}> kcal burned</Text>
        </View>
        <Text style={[styles.calSublabel, { color: colors.textSecondary }]}>
          {weekSessions === 0
            ? "Log a workout or a run to start your week."
            : `${weekSessions} ${weekSessions === 1 ? "session" : "sessions"} this week`}
        </Text>

        <View style={styles.chartWrapper} accessibilityLabel="Calories burned per day this week">
          <View style={styles.barsContainer}>
            {week.map((day, i) => (
              <View key={`${day.label}_${i}`} style={styles.barColumn}>
                <View style={[styles.barTrack, { backgroundColor: colors.bgCardSecondary }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.round((day.kcal / weekMax) * 100)}%`,
                        backgroundColor: day.isToday ? colors.accent : colors.textMuted,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barDayText,
                    { color: day.isToday ? colors.accent : colors.textMuted },
                    day.isToday && { fontWeight: "800" },
                  ]}
                >
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>HISTORY</Text>
        {memories.length > 4 && (
          <TouchableOpacity
            onPress={() => setShowAllActivities(!showAllActivities)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
          >
            <Text style={styles.viewAllText}>{showAllActivities ? "Show less" : "View all"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {memories.length === 0 && (
        <EmptyState
          compact
          icon={TrendingUp}
          title="No activity yet"
          body="Workouts, runs and meals you log will appear here."
        />
      )}

      <View style={styles.activitiesList}>
        {displayedMemories.map((act) => (
          <TouchableOpacity
            key={act.id}
            onPress={() => setSelectedMemory(act)}
            activeOpacity={0.8}
            style={[styles.activityCard, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}
          >
            <View style={styles.actLeft}>
              <View style={[styles.actBadge, { backgroundColor: colors.bgCardSecondary }]}>
                <Text style={[styles.actBadgeText, { color: colors.textPrimary }]}>{act.badge}</Text>
              </View>
              <Text style={[styles.actTitle, { color: colors.textPrimary }]}>{act.title}</Text>
              <Text style={[styles.actVenue, { color: colors.textSecondary }]}>{act.venue}</Text>
            </View>
            <View style={styles.actRight}>
              <Text style={styles.actDuration}>{act.duration}</Text>
              <Text style={[styles.actTime, { color: colors.textMuted }]}>{act.time}</Text>
              <Text style={styles.actCals}>{act.cals}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <MemoryDetailModal visible={!!selectedMemory} item={selectedMemory} onClose={() => setSelectedMemory(null)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroEyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 110 },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroTitle: { fontSize: 20, fontWeight: "900" },
  progressSubtitleRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  progressSubtitle: { color: "#E11D48", fontSize: 12, fontWeight: "700" },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  streakBadgeText: { color: "#D97706", fontSize: 11, fontWeight: "800" },
  calHeroBlock: { flexDirection: "row", alignItems: "baseline", marginTop: 6 },
  calUnit: { fontSize: 15, fontWeight: "600" },
  calValue: { fontSize: 40, fontWeight: "900", letterSpacing: -1 },
  calSublabel: { fontSize: 13, marginTop: 2 },
  chartWrapper: { marginTop: 22, marginBottom: 18 },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: 6,
  },
  barColumn: { alignItems: "center", width: 34 },
  barTrack: { width: 28, height: 96, borderRadius: 14, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 14 },
  barFillPeak: { backgroundColor: "#E11D48" },
  barDayText: { fontSize: 11, fontWeight: "700", marginTop: 6 },
  barDayTextPeak: { color: "#E11D48", fontWeight: "900" },
  pillsRow: { flexDirection: "row", borderRadius: 999, padding: 3 },
  modePill: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 999 },
  modePillActive: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  modePillText: { fontSize: 12, fontWeight: "700" },
  modePillTextActive: { fontWeight: "800" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 0.6 },
  viewAllText: { color: "#E11D48", fontSize: 12, fontWeight: "700" },
  activitiesList: { gap: 10 },
  activityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  actLeft: { flex: 1 },
  actBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  actBadgeText: { fontSize: 10, fontWeight: "700" },
  actTitle: { fontSize: 14, fontWeight: "800" },
  actVenue: { fontSize: 11, marginTop: 2 },
  actRight: { alignItems: "flex-end", justifyContent: "center" },
  actDuration: { color: "#10B981", fontSize: 12, fontWeight: "800" },
  actTime: { fontSize: 10, marginTop: 2 },
  actCals: { color: "#E11D48", fontSize: 11, fontWeight: "700", marginTop: 2 },
});
