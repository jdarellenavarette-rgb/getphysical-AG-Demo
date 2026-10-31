import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { Award, Shield, Eye, Settings, Briefcase, UserCheck } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface ProfileHubProps {
  onSwitchToBusinessMode?: () => void;
  onSwitchToCoachDash?: () => void;
}

export function ProfileHub({ onSwitchToBusinessMode, onSwitchToCoachDash }: ProfileHubProps) {
  const { profile, passes, currentRole, setRole } = useEcosystemStore();
  const [activeTab, setActiveTab] = useState<"trophy" | "locker">("trophy");

  const rawMetrics =
    profile.metrics && typeof profile.metrics === "object" && !Array.isArray(profile.metrics)
      ? (profile.metrics as Record<string, number>)
      : {};
  const followersCount = rawMetrics.followers ?? 142;
  const followingCount = rawMetrics.following ?? 89;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* COVER & AVATAR */}
      <Image source={{ uri: profile.cover_url ?? "" }} style={styles.coverPhoto} />
      <View style={styles.profileHeader}>
        <Image source={{ uri: profile.avatar_url ?? "" }} style={styles.avatar} />
        <View style={styles.nameRow}>
          <Text style={styles.fullName}>{profile.first_name} {profile.last_name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* ACTIVE ROSTER (Gym Subscriptions) */}
        <View style={styles.activeRosterRow}>
          <View style={styles.rosterBadgePrimary}>
            <Shield size={12} color="#10B981" />
            <Text style={styles.rosterBadgeText}>Metro Core VIP</Text>
          </View>
          <View style={styles.rosterBadgeSecondary}>
            <Text style={styles.rosterBadgeTextSec}>Nexus Member</Text>
          </View>
        </View>

        {/* METRICS */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{followersCount}</Text>
            <Text style={styles.metricLabel}>Followers</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{followingCount}</Text>
            <Text style={styles.metricLabel}>Following</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>2</Text>
            <Text style={styles.metricLabel}>Active Challenges</Text>
          </View>
        </View>

        {/* ROLE PORTAL SWITCHING */}
        <View style={styles.portalRow}>
          <TouchableOpacity
            onPress={() => {
              setRole(currentRole === "staff" ? "individual" : "staff");
              onSwitchToBusinessMode?.();
            }}
            style={[styles.portalButton, currentRole === "staff" && styles.portalButtonActive]}
          >
            <Briefcase size={14} color={currentRole === "staff" ? "#FFFFFF" : "#FAFAFA"} />
            <Text style={styles.portalButtonText}>
              {currentRole === "staff" ? "In Staff Mode" : "Switch to Business Mode"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRole(currentRole === "coach" ? "individual" : "coach");
              onSwitchToCoachDash?.();
            }}
            style={[styles.portalButton, currentRole === "coach" && styles.portalButtonActive]}
          >
            <UserCheck size={14} color={currentRole === "coach" ? "#FFFFFF" : "#FAFAFA"} />
            <Text style={styles.portalButtonText}>
              {currentRole === "coach" ? "In Coach Mode" : "Switch to Coach Dash"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TABS */}
        <View style={styles.tabsHeader}>
          <TouchableOpacity
            onPress={() => setActiveTab("trophy")}
            style={[styles.tabItem, activeTab === "trophy" && styles.tabItemActive]}
          >
            <Award size={14} color={activeTab === "trophy" ? "#E11D48" : "#71717A"} />
            <Text style={[styles.tabText, activeTab === "trophy" && styles.tabTextActive]}>
              Trophy Case (PRs)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("locker")}
            style={[styles.tabItem, activeTab === "locker" && styles.tabItemActive]}
          >
            <Shield size={14} color={activeTab === "locker" ? "#E11D48" : "#71717A"} />
            <Text style={[styles.tabText, activeTab === "locker" && styles.tabTextActive]}>
              Locker ({passes.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TROPHY CASE CONTENT */}
        {activeTab === "trophy" ? (
          <View style={styles.trophyGrid}>
            <View style={styles.stampCard}>
              <View style={styles.stampHeader}>
                <Text style={styles.stampType}>LIFT STAMP • VERIFIED</Text>
                <Eye size={14} color="#10B981" />
              </View>
              <Text style={styles.stampMetric}>225 KG</Text>
              <Text style={styles.stampSub}>Conventional Deadlift 1RM</Text>
              <Text style={styles.stampDate}>Metro Core Arena • Oct 31</Text>
            </View>

            <View style={styles.stampCard}>
              <View style={styles.stampHeader}>
                <Text style={styles.stampType}>MOVE STAMP • GPS VERIFIED</Text>
                <Eye size={14} color="#10B981" />
              </View>
              <Text style={styles.stampMetric}>21:45</Text>
              <Text style={styles.stampSub}>5.00 km • 4:21 /km pace</Text>
              <Text style={styles.stampDate}>Bonifacio High Street • Oct 28</Text>
            </View>
          </View>
        ) : (
          <View style={styles.lockerList}>
            {passes.map((p) => (
              <View key={p.id} style={styles.lockerRow}>
                <Text style={styles.lockerPassType}>{p.pass_type}</Text>
                <Text style={styles.lockerStatus}>{p.status.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  coverPhoto: { width: "100%", height: 120, backgroundColor: "#18181B" },
  profileHeader: { paddingHorizontal: 16, marginTop: -40 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#09090B" },
  nameRow: { marginTop: 10 },
  fullName: { color: "#FAFAFA", fontSize: 20, fontWeight: "800" },
  username: { color: "#71717A", fontSize: 13, marginTop: 2 },
  bioText: { color: "#A1A1AA", fontSize: 13, marginTop: 6, lineHeight: 18 },
  activeRosterRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  rosterBadgePrimary: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  rosterBadgeText: { color: "#10B981", fontSize: 11, fontWeight: "700" },
  rosterBadgeSecondary: { backgroundColor: "#27272A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  rosterBadgeTextSec: { color: "#FAFAFA", fontSize: 11, fontWeight: "600" },
  metricsRow: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#121215", borderRadius: 12, paddingVertical: 12, marginTop: 16 },
  metricItem: { alignItems: "center" },
  metricVal: { color: "#FAFAFA", fontSize: 16, fontWeight: "800" },
  metricLabel: { color: "#71717A", fontSize: 11, marginTop: 2 },
  portalRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  portalButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#18181B", borderWidth: 1, borderColor: "#27272A", paddingVertical: 10, borderRadius: 10 },
  portalButtonActive: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  portalButtonText: { color: "#FAFAFA", fontSize: 11, fontWeight: "700" },
  tabsHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#18181B", marginTop: 20 },
  tabItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: "#E11D48" },
  tabText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  tabTextActive: { color: "#FAFAFA" },
  trophyGrid: { marginTop: 16, gap: 12 },
  stampCard: { backgroundColor: "#121215", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#27272A" },
  stampHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stampType: { color: "#10B981", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  stampMetric: { color: "#FAFAFA", fontSize: 24, fontWeight: "900", marginTop: 6 },
  stampSub: { color: "#A1A1AA", fontSize: 12, marginTop: 2 },
  stampDate: { color: "#71717A", fontSize: 10, marginTop: 6 },
  lockerList: { marginTop: 16, gap: 8 },
  lockerRow: { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#121215", borderRadius: 8 },
  lockerPassType: { color: "#FAFAFA", fontSize: 13, fontWeight: "600" },
  lockerStatus: { color: "#10B981", fontSize: 11, fontWeight: "700" },
});
