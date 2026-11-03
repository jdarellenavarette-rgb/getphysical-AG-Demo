import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Flame, Activity, Trophy, Calendar, Sparkles, TrendingUp, ChevronRight } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

export function JourneyView() {
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<"active" | "recovery">("active");
  const [showAllActivities, setShowAllActivities] = useState(false);

  const weeklyBars = [
    { day: "Sun", height: 45, isPeak: false },
    { day: "Mon", height: 75, isPeak: false },
    { day: "Tue", height: 60, isPeak: false },
    { day: "Wed", height: 95, isPeak: true },
    { day: "Thu", height: 50, isPeak: false },
    { day: "Fri", height: 80, isPeak: false },
    { day: "Sat", height: 35, isPeak: false },
  ];

  const activities = [
    {
      id: "act_1",
      title: "Doubles Match",
      venue: "Nexus Pickleball Club",
      duration: "2 hours",
      time: "Today • 4:30 PM",
      cals: "420 kcal",
      badge: "🎾 Pickleball",
    },
    {
      id: "act_2",
      title: "Leg Day (Squats & RDLs)",
      venue: "Twins Fitness SJDM",
      duration: "1 hour 30 Mins",
      time: "Today • 11:00 AM",
      cals: "510 kcal",
      badge: "🏋️ Strength",
    },
    {
      id: "act_3",
      title: "BGC Greenway 5K Run",
      venue: "BGC Track 30th",
      duration: "28 mins",
      time: "Yesterday • 6:30 AM",
      cals: "340 kcal",
      badge: "🏃 Move",
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. MY JOURNEY HERO HEADER (Photo 2 Right Screen) */}
      <View style={[styles.heroCard, { backgroundColor: colors.bgCard, borderColor: colors.borderLight, borderWidth: 1 }]}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>My Journey</Text>
            <View style={styles.progressSubtitleRow}>
              <Sparkles size={13} color="#E11D48" />
              <Text style={styles.progressSubtitle}>Personal Progress</Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={13} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.streakBadgeText}>5d Streak</Text>
          </View>
        </View>

        {/* KCAL TOTAL BURNED */}
        <View style={styles.calHeroBlock}>
          <Text style={styles.calUnit}>Kcal </Text>
          <Text style={[styles.calValue, { color: colors.textPrimary }]}>873.67</Text>
        </View>
        <Text style={[styles.calSublabel, { color: colors.textSecondary }]}>Total Calories Burned Today</Text>

        {/* WEEKLY BAR CHART (Photo 2 Right Screen) */}
        <View style={styles.chartWrapper}>
          <View style={styles.barsContainer}>
            {weeklyBars.map((bar) => (
              <View key={bar.day} style={styles.barColumn}>
                <View style={[styles.barTrack, { backgroundColor: colors.bgCardSecondary }]}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${bar.height}%`, backgroundColor: colors.borderLight },
                      bar.isPeak && styles.barFillPeak,
                    ]}
                  />
                </View>
                <Text style={[styles.barDayText, { color: colors.textMuted }, bar.isPeak && styles.barDayTextPeak]}>
                  {bar.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ACTIVE / RECOVERY PILLS */}
        <View style={[styles.pillsRow, { backgroundColor: colors.bgCardSecondary }]}>
          <TouchableOpacity
            onPress={() => setActiveTab("active")}
            style={[styles.modePill, activeTab === "active" && [styles.modePillActive, { backgroundColor: colors.bgCard }]]}
          >
            <Text style={[styles.modePillText, { color: colors.textSecondary }, activeTab === "active" && [styles.modePillTextActive, { color: colors.textPrimary }]]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("recovery")}
            style={[styles.modePill, activeTab === "recovery" && [styles.modePillActive, { backgroundColor: colors.bgCard }]]}
          >
            <Text style={[styles.modePillText, { color: colors.textSecondary }, activeTab === "recovery" && [styles.modePillTextActive, { color: colors.textPrimary }]]}>
              Recovery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. ACTIVITY HISTORY LIST */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACTIVITY HISTORY</Text>
        <TouchableOpacity onPress={() => setShowAllActivities(!showAllActivities)}>
          <Text style={styles.viewAllText}>{showAllActivities ? "Show Less" : "View All"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activitiesList}>
        {activities.map((act) => (
          <View key={act.id} style={[styles.activityCard, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
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
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 110 },
  heroCard: { borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, marginBottom: 20 },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroTitle: { fontSize: 20, fontWeight: "900" },
  progressSubtitleRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  progressSubtitle: { color: "#E11D48", fontSize: 12, fontWeight: "700" },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(245,158,11,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  streakBadgeText: { color: "#D97706", fontSize: 11, fontWeight: "800" },
  calHeroBlock: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", marginTop: 18 },
  calUnit: { color: "#E11D48", fontSize: 20, fontWeight: "800" },
  calValue: { fontSize: 40, fontWeight: "900", letterSpacing: -1 },
  calSublabel: { textAlign: "center", fontSize: 12, fontWeight: "600", marginTop: 2 },
  chartWrapper: { marginTop: 22, marginBottom: 18 },
  barsContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 120, paddingHorizontal: 6 },
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
  activityCard: { flexDirection: "row", justifyContent: "space-between", padding: 14, borderRadius: 16, borderWidth: 1 },
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
