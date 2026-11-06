import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { AppModal } from "../common/AppModal";
import { X, CheckCircle2, UserPlus, MessageSquare, Award, Grid, Shield, ArrowLeft } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

export interface AthleteProfileData {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  coverUrl?: string;
  bio: string;
  specialty: string;
  isVerified?: boolean;
  followersCount: string;
  workoutsCount: string;
  prStamp?: { title: string; metric: string; venue: string };
  photos: string[];
}

interface AthleteProfileModalProps {
  visible: boolean;
  athlete: AthleteProfileData | null;
  onClose: () => void;
  onMessageAthlete?: (athlete: AthleteProfileData) => void;
}

export function AthleteProfileModal({
  visible,
  athlete,
  onClose,
  onMessageAthlete,
}: AthleteProfileModalProps) {
  const { colors } = useThemeStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"grid" | "pr">("grid");

  if (!visible || !athlete) return null;

  return (
    <AppModal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <FlashList
        style={[styles.container, { backgroundColor: colors.bgScreen }]}
        contentContainerStyle={styles.content}
        data={activeTab === "grid" ? athlete.photos : []}
        numColumns={3}
        keyExtractor={(url, i) => `${i}_${url}`}
        ListHeaderComponent={
          <View>
        {/* COVER PHOTO & TOP BAR */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: athlete.coverUrl ?? "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80" }}
            style={styles.coverPhoto}
          />
          <View style={styles.coverOverlay} />
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back to feed">
            <ArrowLeft size={20} color="#FFFFFF" />
            <Text style={styles.backBtnText}>Feed</Text>
          </TouchableOpacity>
        </View>

        {/* PROFILE HEADER */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarRow}>
            <Image source={{ uri: athlete.avatar }} style={[styles.avatar, { borderColor: colors.bgScreen }]} />
            <View style={styles.onlinePill}>
              <View style={styles.greenDot} />
              <Text style={styles.onlineText}>ACTIVE ATHLETE</Text>
            </View>
          </View>

          <View style={styles.nameRow}>
            <View style={styles.fullNameRow}>
              <Text style={[styles.fullName, { color: colors.textPrimary }]}>{athlete.name}</Text>
              {athlete.isVerified && <CheckCircle2 size={16} color="#38BDF8" fill="#38BDF8" />}
            </View>
            <Text style={[styles.username, { color: colors.textSecondary }]}>@{athlete.username} • {athlete.specialty}</Text>
            <Text style={[styles.bioText, { color: colors.textPrimary }]}>{athlete.bio}</Text>
          </View>

          {/* DUAL ACTION BUTTONS */}
          <View style={styles.actionBtnRow}>
            <TouchableOpacity onPress={() => setIsFollowing(!isFollowing)} style={[styles.followBtn, isFollowing && styles.followingBtn]}>
              <UserPlus size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.followBtnText}>{isFollowing ? "Following" : "Follow Athlete"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onClose();
                onMessageAthlete?.(athlete);
              }}
              style={[styles.msgBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
            >
              <MessageSquare size={15} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.msgBtnText, { color: colors.textPrimary }]}>Message</Text>
            </TouchableOpacity>
          </View>

          {/* ATHLETIC STATS */}
          <View style={[styles.metricsRow, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>{athlete.followersCount}</Text><Text style={styles.metricLabel}>Followers</Text></View>
            <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>{athlete.workoutsCount}</Text><Text style={styles.metricLabel}>Workouts</Text></View>
            <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>12</Text><Text style={styles.metricLabel}>PR Stamps</Text></View>
          </View>

          {/* TABS */}
          <View style={[styles.tabsHeader, { borderBottomColor: colors.borderColor }]}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Photos" onPress={() => setActiveTab("grid")} style={[styles.tabItem, activeTab === "grid" && styles.tabItemActive]}>
              <Grid size={16} color={activeTab === "grid" ? colors.accent : colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Verified PRs" onPress={() => setActiveTab("pr")} style={[styles.tabItem, activeTab === "pr" && styles.tabItemActive]}>
              <Award size={16} color={activeTab === "pr" ? colors.accent : colors.textMuted} />
            </TouchableOpacity>
          </View>

        </View>
          </View>
        }
        ListFooterComponent={
          <View>
        <View style={styles.profileHeader}>
          {/* TAB 2: VERIFIED PR STAMP */}
          {activeTab === "pr" && (
            <View style={styles.prContainer}>
              <View style={[styles.prStampCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
                <View style={styles.prStampHeader}>
                  <Text style={styles.prStampBadge}>LIFT STAMP • VERIFIED PR</Text>
                  <Award size={14} color={colors.accentGreen} />
                </View>
                <Text style={[styles.prMetric, { color: colors.textPrimary }]}>{athlete.prStamp?.metric ?? "225 KG"}</Text>
                <Text style={[styles.prTitle, { color: colors.textSecondary }]}>{athlete.prStamp?.title ?? "Deadlift 1RM"} • {athlete.prStamp?.venue ?? "Metro Core Arena"}</Text>
              </View>
            </View>
          )}
        </View>
          </View>
        }
        renderItem={({ item: url }) => (
          <View style={styles.photoWrap}>
            <Image source={{ uri: url }} style={styles.gridImg} accessibilityIgnoresInvertColors />
          </View>
        )}
      />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 60 },
  coverContainer: { position: "relative", width: "100%", height: 140 },
  coverPhoto: { width: "100%", height: "100%" },
  coverOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" },
  backBtn: { position: "absolute", top: 48, left: 16, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  backBtnText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  profileHeader: { paddingHorizontal: 16, marginTop: -40 },
  avatarRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3 },
  onlinePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  onlineText: { color: "#10B981", fontSize: 11, fontWeight: "800" },
  nameRow: { marginTop: 12 },
  fullNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  fullName: { fontSize: 20, fontWeight: "900" },
  username: { fontSize: 12, marginTop: 2 },
  bioText: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  actionBtnRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  followBtn: { flex: 1, backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  followingBtn: { backgroundColor: "#71717A" },
  followBtnText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  msgBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1 },
  msgBtnText: { fontSize: 13, fontWeight: "800" },
  metricsRow: { flexDirection: "row", justifyContent: "space-around", borderRadius: 14, paddingVertical: 14, marginTop: 16, borderWidth: 1 },
  metricItem: { alignItems: "center" },
  metricVal: { fontSize: 18, fontWeight: "900" },
  metricLabel: { color: "#71717A", fontSize: 11, fontWeight: "700", marginTop: 2 },
  tabsHeader: { flexDirection: "row", borderBottomWidth: 1, marginTop: 16 },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: "#E11D48" },
  photoWrap: { flex: 1, aspectRatio: 1, padding: 1 },
  gridImg: { width: "100%", height: "100%" },
  prContainer: { marginTop: 14 },
  prStampCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
  prStampHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  prStampBadge: { color: "#10B981", fontSize: 11, fontWeight: "800" },
  prMetric: { fontSize: 26, fontWeight: "900", marginTop: 6 },
  prTitle: { fontSize: 12, marginTop: 2 },
});
