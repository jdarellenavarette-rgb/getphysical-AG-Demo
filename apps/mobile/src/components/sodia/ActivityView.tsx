import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Heart, MessageCircle, Award, UserPlus, Flame } from "lucide-react-native";

interface ActivityViewProps {
  onBack: () => void;
  onNavigateToLift?: () => void;
}

export function ActivityView({ onBack, onNavigateToLift }: ActivityViewProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [acceptedChallenge, setAcceptedChallenge] = useState(false);

  const activities = [
    {
      id: "act_1",
      type: "challenge_alert",
      title: "Leaderboard Alert",
      text: "Dave passed your 225kg Deadlift score with 230kg on the BGC Leaderboard!",
      time: "25m ago",
      section: "Today",
      urgent: true,
    },
    {
      id: "act_2",
      type: "like",
      user: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      text: "liked your post with Metro Core Arena tag.",
      time: "2h ago",
      section: "Today",
    },
    {
      id: "act_3",
      type: "follow",
      user: "Coach Miguel Ramos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      text: "started following you.",
      time: "1d ago",
      section: "This Week",
      hasFollowBack: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER WITH SAFE NOTCH INSET */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 50) + 6, height: Math.max(insets.top, 50) + 54 }]}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#FAFAFA" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* SEGMENTED TABS */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("all")}
          style={[styles.tabItem, activeTab === "all" && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
            All Activity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("requests")}
          style={[styles.tabItem, activeTab === "requests" && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === "requests" && styles.tabTextActive]}>
            Follow Requests (1)
          </Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVITY LIST */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>TODAY</Text>
        {activities
          .filter((a) => a.section === "Today")
          .map((a) => (
            <View
              key={a.id}
              style={[styles.activityRow, a.urgent && styles.urgentCard]}
            >
              {a.type === "challenge_alert" ? (
                <View style={styles.alertIcon}>
                  <Flame size={16} color="#F97316" />
                </View>
              ) : (
                <Image source={{ uri: a.avatar }} style={styles.avatar} />
              )}

              <View style={styles.meta}>
                <Text style={styles.titleText}>
                  {a.user ? <Text style={styles.userName}>{a.user} </Text> : null}
                  {a.text}
                </Text>
                <Text style={styles.timeText}>{a.time}</Text>
              </View>

              {a.type === "challenge_alert" && (
                <TouchableOpacity
                  onPress={() => {
                    setAcceptedChallenge(true);
                    onNavigateToLift?.();
                  }}
                  style={[styles.viewChallengeBtn, acceptedChallenge && { backgroundColor: "#10B981" }]}
                >
                  <Text style={styles.viewChallengeText}>
                    {acceptedChallenge ? "Accepted ✓" : "Defend PR"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>THIS WEEK</Text>
        {activities
          .filter((a) => a.section === "This Week")
          .map((a) => (
            <View key={a.id} style={styles.activityRow}>
              <Image source={{ uri: a.avatar }} style={styles.avatar} />
              <View style={styles.meta}>
                <Text style={styles.titleText}>
                  <Text style={styles.userName}>{a.user} </Text>
                  {a.text}
                </Text>
                <Text style={styles.timeText}>{a.time}</Text>
              </View>
              {a.hasFollowBack && (
                <TouchableOpacity
                  onPress={() => setFollowedMap((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
                  style={[styles.followBackBtn, followedMap[a.id] && { backgroundColor: "#27272A" }]}
                >
                  <Text style={styles.followBackText}>
                    {followedMap[a.id] ? "Following" : "Follow Back"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FAFAFA", fontSize: 16, fontWeight: "800" },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#18181B", gap: 16 },
  tabItem: { paddingVertical: 12 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: "#E11D48" },
  tabText: { color: "#71717A", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#FAFAFA", fontWeight: "700" },
  list: { flex: 1, padding: 16 },
  sectionHeader: { color: "#71717A", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 12 },
  activityRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  urgentCard: { backgroundColor: "rgba(249, 115, 22, 0.12)", borderWidth: 1, borderColor: "rgba(249, 115, 22, 0.3)", borderRadius: 12, padding: 12 },
  alertIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(249, 115, 22, 0.2)", alignItems: "center", justifyContent: "center" },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  meta: { flex: 1, marginLeft: 12 },
  titleText: { color: "#D4D4D8", fontSize: 12, lineHeight: 17 },
  userName: { color: "#FAFAFA", fontWeight: "700" },
  timeText: { color: "#71717A", fontSize: 10, marginTop: 2 },
  viewChallengeBtn: { backgroundColor: "#E11D48", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  viewChallengeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  followBackBtn: { backgroundColor: "#27272A", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  followBackText: { color: "#FAFAFA", fontSize: 11, fontWeight: "700" },
});
