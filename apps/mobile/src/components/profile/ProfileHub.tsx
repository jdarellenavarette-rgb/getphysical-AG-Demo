import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { Award, Shield, Eye, CheckCircle2, MessageSquare, UserPlus, ArrowLeft, Grid, Film } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { OrganizerMeetModal } from "./OrganizerMeetModal";

interface ProfileHubProps {
  onBack?: () => void;
  onSwitchToBusinessMode?: () => void;
  onSwitchToCoachDash?: () => void;
  onOpenMessages?: () => void;
}

export function ProfileHub({ onBack, onOpenMessages }: ProfileHubProps) {
  const { profile, passes, posts } = useEcosystemStore();
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<"grid" | "trophy" | "locker">("grid");
  const [isFollowing, setIsFollowing] = useState(false);

  const highlights = [
    { id: "h1", title: "225kg PR", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80" },
    { id: "h2", title: "Hyrox '26", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80" },
    { id: "h3", title: "Court Club", image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=200&q=80" },
    { id: "h4", title: "Nutrition", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=200&q=80" },
  ];

  const gridPhotos = [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80",
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      {/* COVER & HEADER WITH RETURN PILL */}
      <View style={styles.coverContainer}>
        <Image source={{ uri: profile.cover_url ?? "" }} style={styles.coverPhoto} />
        <View style={styles.coverGradient} />
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButtonPill}>
            <ArrowLeft size={16} color="#FAFAFA" />
            <Text style={styles.backButtonText}>Feed</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatarRow}>
          <Image source={{ uri: profile.avatar_url ?? "" }} style={[styles.avatar, { borderColor: colors.bgScreen }]} />
          <View style={styles.liveTrainingBadge}>
            <View style={styles.liveGreenDot} />
            <Text style={styles.liveTrainingText}>ACTIVE ATHLETE</Text>
          </View>
        </View>

        <View style={styles.nameRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={[styles.fullName, { color: colors.textPrimary }]}>{profile.first_name} {profile.last_name}</Text>
            <CheckCircle2 size={16} color="#38BDF8" fill="#38BDF8" />
          </View>
          <Text style={[styles.username, { color: colors.textSecondary }]}>@{profile.username} • Strength & Hyrox</Text>
          <Text style={[styles.bioText, { color: colors.textPrimary }]}>{profile.bio}</Text>
        </View>

        {/* PRO DUAL ACTION BUTTONS */}
        <View style={styles.actionBtnRow}>
          <TouchableOpacity onPress={() => setIsFollowing(!isFollowing)} style={[styles.primaryActionBtn, isFollowing && styles.followingActive]}>
            <UserPlus size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryActionText}>{isFollowing ? "Following" : "Follow Athlete"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenMessages} style={[styles.secondaryActionBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <MessageSquare size={15} color={colors.textPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* STATS STRIP */}
        <View style={[styles.metricsRow, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>2.3k</Text><Text style={styles.metricLabel}>Followers</Text></View>
          <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>142</Text><Text style={styles.metricLabel}>Following</Text></View>
          <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>342</Text><Text style={styles.metricLabel}>Workouts</Text></View>
          <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>18</Text><Text style={styles.metricLabel}>PR Stamps</Text></View>
        </View>

        {/* INSTAGRAM-STYLE STORY HIGHLIGHTS TRAY */}
        <View style={styles.highlightsTray}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightsScroll}>
            {highlights.map((h) => (
              <View key={h.id} style={styles.highlightItem}>
                <View style={[styles.highlightRing, { borderColor: colors.borderColor }]}>
                  <Image source={{ uri: h.image }} style={styles.highlightThumb} />
                </View>
                <Text numberOfLines={1} style={[styles.highlightLabel, { color: colors.textSecondary }]}>{h.title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* INSTAGRAM TABS (GRID / TROPHY CASE / LOCKER) */}
        <View style={[styles.tabsHeader, { borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity onPress={() => setActiveTab("grid")} style={[styles.tabItem, activeTab === "grid" && styles.tabItemActive]}>
            <Grid size={16} color={activeTab === "grid" ? "#E11D48" : "#71717A"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("trophy")} style={[styles.tabItem, activeTab === "trophy" && styles.tabItemActive]}>
            <Award size={16} color={activeTab === "trophy" ? "#E11D48" : "#71717A"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("locker")} style={[styles.tabItem, activeTab === "locker" && styles.tabItemActive]}>
            <Shield size={16} color={activeTab === "locker" ? "#E11D48" : "#71717A"} />
          </TouchableOpacity>
        </View>

        {/* TAB CONTENT: 3-COLUMN INSTAGRAM GRID */}
        {activeTab === "grid" && (
          <View style={styles.photoGrid}>
            {gridPhotos.map((photo, i) => (
              <View key={i} style={styles.gridPhotoWrap}>
                <Image source={{ uri: photo }} style={styles.gridPhoto} />
              </View>
            ))}
          </View>
        )}

        {/* TAB CONTENT: TROPHY CASE */}
        {activeTab === "trophy" && (
          <View style={styles.trophyGrid}>
            <View style={[styles.stampCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              <View style={styles.stampHeader}>
                <Text style={styles.stampType}>LIFT STAMP • VERIFIED PR</Text>
                <Eye size={13} color="#10B981" />
              </View>
              <Text style={[styles.stampMetric, { color: colors.textPrimary }]}>225 KG</Text>
              <Text style={[styles.stampSub, { color: colors.textSecondary }]}>Conventional Deadlift 1RM • Metro Core Arena</Text>
            </View>
            <View style={[styles.stampCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              <View style={styles.stampHeader}>
                <Text style={styles.stampType}>MOVE STAMP • GPS VERIFIED</Text>
                <Eye size={13} color="#10B981" />
              </View>
              <Text style={[styles.stampMetric, { color: colors.textPrimary }]}>21:45</Text>
              <Text style={[styles.stampSub, { color: colors.textSecondary }]}>5.00 km Outdoor Pace • BGC Track 30th</Text>
            </View>
          </View>
        )}

        {/* TAB CONTENT: ATHLETE LOCKER */}
        {activeTab === "locker" && (
          <View style={styles.lockerList}>
            {passes.length === 0 ? (
              <View style={styles.emptyLocker}><Text style={[styles.emptyLockerText, { color: colors.textMuted }]}>No active passes in locker</Text></View>
            ) : (
              passes.map((p) => (
                <View key={p.id} style={[styles.lockerRow, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
                  <Text style={[styles.lockerPassType, { color: colors.textPrimary }]}>{p.pass_type}</Text>
                  <Text style={styles.lockerStatus}>{p.status.toUpperCase()}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverContainer: { position: "relative", width: "100%", height: 130 },
  coverPhoto: { width: "100%", height: "100%" },
  coverGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  backButtonPill: { position: "absolute", top: 12, left: 16, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(9, 9, 11, 0.75)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  backButtonText: { color: "#FAFAFA", fontSize: 12, fontWeight: "700" },
  profileHeader: { paddingHorizontal: 16, marginTop: -40 },
  avatarRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3 },
  liveTrainingBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)" },
  liveGreenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  liveTrainingText: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  nameRow: { marginTop: 12 },
  fullName: { fontSize: 22, fontWeight: "900" },
  username: { fontSize: 12, marginTop: 2 },
  bioText: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  actionBtnRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  primaryActionBtn: { flex: 1, backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  followingActive: { backgroundColor: "#71717A" },
  primaryActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  secondaryActionBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1 },
  secondaryActionText: { fontSize: 13, fontWeight: "800" },
  metricsRow: { flexDirection: "row", justifyContent: "space-around", borderRadius: 14, paddingVertical: 14, marginTop: 16, borderWidth: 1 },
  metricItem: { alignItems: "center" },
  metricVal: { fontSize: 18, fontWeight: "900" },
  metricLabel: { color: "#71717A", fontSize: 10, fontWeight: "700", marginTop: 2 },
  highlightsTray: { marginVertical: 16 },
  highlightsScroll: { gap: 14 },
  highlightItem: { alignItems: "center", width: 64 },
  highlightRing: { width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, padding: 2 },
  highlightThumb: { width: "100%", height: "100%", borderRadius: 27 },
  highlightLabel: { fontSize: 10, fontWeight: "600", marginTop: 4, textAlign: "center" },
  tabsHeader: { flexDirection: "row", borderBottomWidth: 1, marginTop: 4 },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: "#E11D48" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 2, marginTop: 10 },
  gridPhotoWrap: { width: "32.7%", aspectRatio: 1 },
  gridPhoto: { width: "100%", height: "100%" },
  trophyGrid: { marginTop: 14, gap: 10 },
  stampCard: { borderRadius: 14, padding: 14, borderWidth: 1 },
  stampHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stampType: { color: "#10B981", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  stampMetric: { fontSize: 24, fontWeight: "900", marginTop: 6 },
  stampSub: { fontSize: 12, marginTop: 2 },
  lockerList: { marginTop: 14, gap: 8 },
  emptyLocker: { padding: 24, alignItems: "center" },
  emptyLockerText: { fontSize: 13 },
  lockerRow: { flexDirection: "row", justifyContent: "space-between", padding: 12, borderRadius: 10, borderWidth: 1 },
  lockerPassType: { fontSize: 13, fontWeight: "600" },
  lockerStatus: { color: "#10B981", fontSize: 11, fontWeight: "700" },
});
