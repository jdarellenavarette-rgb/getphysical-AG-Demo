import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Flame, Activity, Trophy, Calendar, Sparkles, TrendingUp, ChevronRight } from "lucide-react-native";

export function JourneyView() {
  const [activeTab, setActiveTab] = useState<"active" | "recovery">("active");

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. MY JOURNEY HERO HEADER (Photo 2 Right Screen) */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroTitle}>My Journey</Text>
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
          <Text style={styles.calValue}>873.67</Text>
        </View>
        <Text style={styles.calSublabel}>Total Calories Burned Today</Text>

        {/* WEEKLY BAR CHART (Photo 2 Right Screen) */}
        <View style={styles.chartWrapper}>
          <View style={styles.barsContainer}>
            {weeklyBars.map((bar) => (
              <View key={bar.day} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${bar.height}%` },
                      bar.isPeak && styles.barFillPeak,
                    ]}
                  />
                </View>
                <Text style={[styles.barDayText, bar.isPeak && styles.barDayTextPeak]}>
                  {bar.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ACTIVE / RECOVERY PILLS */}
        <View style={styles.pillsRow}>
          <TouchableOpacity
            onPress={() => setActiveTab("active")}
            style={[styles.modePill, activeTab === "active" && styles.modePillActive]}
          >
            <Text style={[styles.modePillText, activeTab === "active" && styles.modePillTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("recovery")}
            style={[styles.modePill, activeTab === "recovery" && styles.modePillActive]}
          >
            <Text style={[styles.modePillText, activeTab === "recovery" && styles.modePillTextActive]}>
              Recovery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. ACTIVITY HISTORY LIST */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>ACTIVITY HISTORY</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activitiesList}>
        {activities.map((act) => (
          <View key={act.id} style={styles.activityCard}>
            <View style={styles.actLeft}>
              <View style={styles.actBadge}>
                <Text style={styles.actBadgeText}>{act.badge}</Text>
              </View>
              <Text style={styles.actTitle}>{act.title}</Text>
              <Text style={styles.actVenue}>{act.venue}</Text>
            </View>
            <View style={styles.actRight}>
              <Text style={styles.actDuration}>{act.duration}</Text>
              <Text style={styles.actTime}>{act.time}</Text>
              <Text style={styles.actCals}>{act.cals}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  content: { padding: 16, paddingBottom: 110 },
  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6, marginBottom: 20 },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroTitle: { color: "#09090B", fontSize: 20, fontWeight: "900" },
  progressSubtitleRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  progressSubtitle: { color: "#E11D48", fontSize: 12, fontWeight: "700" },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(245,158,11,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  streakBadgeText: { color: "#D97706", fontSize: 11, fontWeight: "800" },
  calHeroBlock: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", marginTop: 18 },
  calUnit: { color: "#E11D48", fontSize: 20, fontWeight: "800" },
  calValue: { color: "#09090B", fontSize: 40, fontWeight: "900", letterSpacing: -1 },
  calSublabel: { textAlign: "center", color: "#71717A", fontSize: 12, fontWeight: "600", marginTop: 2 },
  chartWrapper: { marginTop: 22, marginBottom: 18 },
  barsContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 120, paddingHorizontal: 6 },
  barColumn: { alignItems: "center", width: 34 },
  barTrack: { width: 28, height: 96, backgroundColor: "#F4F4F5", borderRadius: 14, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", backgroundColor: "#E4E4E7", borderRadius: 14 },
  barFillPeak: { backgroundColor: "#E11D48" },
  barDayText: { color: "#A1A1AA", fontSize: 11, fontWeight: "700", marginTop: 6 },
  barDayTextPeak: { color: "#E11D48", fontWeight: "900" },
  pillsRow: { flexDirection: "row", backgroundColor: "#F4F4F5", borderRadius: 999, padding: 3 },
  modePill: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 999 },
  modePillActive: { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  modePillText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  modePillTextActive: { color: "#09090B", fontWeight: "800" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { color: "#FAFAFA", fontSize: 12, fontWeight: "800", letterSpacing: 0.6 },
  viewAllText: { color: "#E11D48", fontSize: 12, fontWeight: "700" },
  activitiesList: { gap: 10 },
  activityCard: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#141418", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#27272A" },
  actLeft: { flex: 1 },
  actBadge: { alignSelf: "flex-start", backgroundColor: "#27272A", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  actBadgeText: { color: "#FAFAFA", fontSize: 10, fontWeight: "700" },
  actTitle: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  actVenue: { color: "#71717A", fontSize: 11, marginTop: 2 },
  actRight: { alignItems: "flex-end", justifyContent: "center" },
  actDuration: { color: "#10B981", fontSize: 12, fontWeight: "800" },
  actTime: { color: "#71717A", fontSize: 10, marginTop: 2 },
  actCals: { color: "#E11D48", fontSize: 11, fontWeight: "700", marginTop: 2 },
});
