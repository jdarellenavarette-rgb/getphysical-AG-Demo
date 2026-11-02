import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { Award, Shield, Eye, Briefcase, UserCheck, Calendar, CheckCircle2, MessageSquare, UserPlus } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { OrganizerMeetModal } from "./OrganizerMeetModal";

interface ProfileHubProps {
  onSwitchToBusinessMode?: () => void;
  onSwitchToCoachDash?: () => void;
  onOpenMessages?: () => void;
}

export function ProfileHub({ onSwitchToBusinessMode, onSwitchToCoachDash, onOpenMessages }: ProfileHubProps) {
  const { profile, passes, currentRole, setRole } = useEcosystemStore();
  const [activeTab, setActiveTab] = useState<"trophy" | "locker">("trophy");
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      {/* COVER & AVATAR WITH NIKE/META GRADE STYLING */}
      <View style={styles.coverContainer}>
        <Image source={{ uri: profile.cover_url ?? "" }} style={styles.coverPhoto} />
        <View style={styles.coverGradient} />
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatarRow}>
          <Image source={{ uri: profile.avatar_url ?? "" }} style={styles.avatar} />
          <View style={styles.liveTrainingBadge}>
            <View style={styles.liveGreenDot} />
            <Text style={styles.liveTrainingText}>ACTIVE ATHLETE</Text>
          </View>
        </View>

        <View style={styles.nameRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.fullName}>{profile.first_name} {profile.last_name}</Text>
            <CheckCircle2 size={16} color="#38BDF8" fill="#38BDF8" />
          </View>
          <Text style={styles.username}>@{profile.username} • Strength & Hyrox</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* PRO DUAL ACTION BUTTONS (INSPIRATION PHOTO 1: FOLLOW & MESSAGE) */}
        <View style={styles.actionBtnRow}>
          <TouchableOpacity
            onPress={() => setIsFollowing(!isFollowing)}
            style={[styles.primaryActionBtn, isFollowing && styles.followingActive]}
          >
            <UserPlus size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryActionText}>{isFollowing ? "Following" : "Follow Athlete"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onOpenMessages} style={styles.secondaryActionBtn}>
            <MessageSquare size={15} color="#FAFAFA" style={{ marginRight: 6 }} />
            <Text style={styles.secondaryActionText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* STATS STRIP (PHOTO 1 / PHOTO 4) */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>2.3k</Text>
            <Text style={styles.metricLabel}>Followers</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>142</Text>
            <Text style={styles.metricLabel}>Following</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>342</Text>
            <Text style={styles.metricLabel}>Workouts</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>18</Text>
            <Text style={styles.metricLabel}>PR Stamps</Text>
          </View>
        </View>

        {/* ROLE PORTAL SWITCHING */}
        <Text style={styles.portalSectionTitle}>BUSINESS WORKSPACES</Text>
        <View style={styles.portalRow}>
          <TouchableOpacity
            onPress={() => {
              setRole(currentRole === "staff" ? "individual" : "staff");
              onSwitchToBusinessMode?.();
            }}
            style={[styles.portalButton, currentRole === "staff" && styles.portalButtonActive]}
          >
            <Briefcase size={13} color="#FAFAFA" />
            <Text style={styles.portalButtonText}>Staff Scanner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRole("organizer");
              setIsOrganizerModalOpen(true);
            }}
            style={[styles.portalButton, currentRole === "organizer" && styles.portalButtonActive]}
          >
            <Calendar size={13} color="#FAFAFA" />
            <Text style={styles.portalButtonText}>Organizer Pro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRole(currentRole === "coach" ? "individual" : "coach");
              onSwitchToCoachDash?.();
            }}
            style={[styles.portalButton, currentRole === "coach" && styles.portalButtonActive]}
          >
            <UserCheck size={13} color="#FAFAFA" />
            <Text style={styles.portalButtonText}>Coach Roster</Text>
          </TouchableOpacity>
        </View>

        {/* TABS */}
        <View style={styles.tabsHeader}>
          <TouchableOpacity
            onPress={() => setActiveTab("trophy")}
            style={[styles.tabItem, activeTab === "trophy" && styles.tabItemActive]}
          >
            <Award size={15} color={activeTab === "trophy" ? "#E11D48" : "#71717A"} />
            <Text style={[styles.tabText, activeTab === "trophy" && styles.tabTextActive]}>
              Trophy Case
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("locker")}
            style={[styles.tabItem, activeTab === "locker" && styles.tabItemActive]}
          >
            <Shield size={15} color={activeTab === "locker" ? "#E11D48" : "#71717A"} />
            <Text style={[styles.tabText, activeTab === "locker" && styles.tabTextActive]}>
              Locker ({passes.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TROPHY CASE PR STAMPS */}
        {activeTab === "trophy" ? (
          <View style={styles.trophyGrid}>
            <View style={styles.stampCard}>
              <View style={styles.stampHeader}>
                <Text style={styles.stampType}>LIFT STAMP • VERIFIED PR</Text>
                <Eye size={13} color="#10B981" />
              </View>
              <Text style={styles.stampMetric}>225 KG</Text>
              <Text style={styles.stampSub}>Conventional Deadlift 1RM</Text>
              <Text style={styles.stampDate}>Metro Core Arena • Turnstile Validated</Text>
            </View>

            <View style={styles.stampCard}>
              <View style={styles.stampHeader}>
                <Text style={styles.stampType}>MOVE STAMP • GPS VERIFIED</Text>
                <Eye size={13} color="#10B981" />
              </View>
              <Text style={styles.stampMetric}>21:45</Text>
              <Text style={styles.stampSub}>5.00 km Outdoor Pace • 4:21 /km</Text>
              <Text style={styles.stampDate}>BGC Track 30th • Strava Verified</Text>
            </View>
          </View>
        ) : (
          <View style={styles.lockerList}>
            {passes.length === 0 ? (
              <View style={styles.emptyLocker}>
                <Text style={styles.emptyLockerText}>No active passes in locker</Text>
              </View>
            ) : (
              passes.map((p) => (
                <View key={p.id} style={styles.lockerRow}>
                  <Text style={styles.lockerPassType}>{p.pass_type}</Text>
                  <Text style={styles.lockerStatus}>{p.status.toUpperCase()}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      <OrganizerMeetModal
        visible={isOrganizerModalOpen}
        onClose={() => setIsOrganizerModalOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  coverContainer: { position: "relative", width: "100%", height: 130 },
  coverPhoto: { width: "100%", height: "100%" },
  coverGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  profileHeader: { paddingHorizontal: 16, marginTop: -40 },
  avatarRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#09090B" },
  liveTrainingBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)" },
  liveGreenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  liveTrainingText: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  nameRow: { marginTop: 12 },
  fullName: { color: "#FAFAFA", fontSize: 22, fontWeight: "900" },
  username: { color: "#71717A", fontSize: 12, marginTop: 2 },
  bioText: { color: "#D4D4D8", fontSize: 13, marginTop: 6, lineHeight: 18 },
  actionBtnRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  primaryActionBtn: { flex: 1, backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  followingActive: { backgroundColor: "#27272A" },
  primaryActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  secondaryActionBtn: { flex: 1, backgroundColor: "#18181B", borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#27272A" },
  secondaryActionText: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
  metricsRow: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#121215", borderRadius: 14, paddingVertical: 14, marginTop: 16, borderWidth: 1, borderColor: "#18181B" },
  metricItem: { alignItems: "center" },
  metricVal: { color: "#FAFAFA", fontSize: 18, fontWeight: "900" },
  metricLabel: { color: "#71717A", fontSize: 10, fontWeight: "700", marginTop: 2 },
  portalSectionTitle: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 18, marginBottom: 8 },
  portalRow: { flexDirection: "row", gap: 8 },
  portalButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#18181B", borderWidth: 1, borderColor: "#27272A", paddingVertical: 11, borderRadius: 10 },
  portalButtonActive: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  portalButtonText: { color: "#FAFAFA", fontSize: 11, fontWeight: "700" },
  tabsHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#18181B", marginTop: 20 },
  tabItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: "#E11D48" },
  tabText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  tabTextActive: { color: "#FAFAFA" },
  trophyGrid: { marginTop: 14, gap: 10 },
  stampCard: { backgroundColor: "#121215", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#27272A" },
  stampHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stampType: { color: "#10B981", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  stampMetric: { color: "#FAFAFA", fontSize: 24, fontWeight: "900", marginTop: 6 },
  stampSub: { color: "#A1A1AA", fontSize: 12, marginTop: 2 },
  stampDate: { color: "#71717A", fontSize: 10, marginTop: 4 },
  lockerList: { marginTop: 14, gap: 8 },
  emptyLocker: { padding: 24, alignItems: "center" },
  emptyLockerText: { color: "#71717A", fontSize: 13 },
  lockerRow: { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#121215", borderRadius: 10 },
  lockerPassType: { color: "#FAFAFA", fontSize: 13, fontWeight: "600" },
  lockerStatus: { color: "#10B981", fontSize: 11, fontWeight: "700" },
});