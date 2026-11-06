import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import { Award, Shield, Eye, CheckCircle2, MessageSquare, QrCode, ArrowLeft, Grid, X, Activity, ChevronRight, Dumbbell } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore } from "../../store/trackingStore";
import { NasmBiometricsModal } from "./NasmBiometricsModal";
import { MyQrModal } from "./MyQrModal";
import { styles } from "./ProfileHub.styles";
import {
  DARELLE_AVATAR,
  DARELLE_PHYSIQUE,
  DARELLE_TENNIS_JUMP,
  DARELLE_TENNIS_RACKET,
  DARELLE_BOXING,
} from "../../constants/darelleAssets";

interface ProfileHubProps {
  onBack?: () => void;
  onSwitchToBusinessMode?: () => void;
  onSwitchToCoachDash?: () => void;
  onOpenMessages?: () => void;
}

export function ProfileHub({ onBack, onOpenMessages }: ProfileHubProps) {
  const { profile, passes } = useEcosystemStore();
  const { colors } = useThemeStore();
  const { userBiometrics } = useTrackingStore();
  const [activeTab, setActiveTab] = useState<"grid" | "trophy" | "locker">("grid");
  const [isMyQrOpen, setIsMyQrOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isNasmOpen, setIsNasmOpen] = useState(false);

  const highlights = [
    { id: "h1", title: "IFBB CPFT", image: DARELLE_AVATAR },
    { id: "h2", title: "Physique", image: DARELLE_PHYSIQUE },
    { id: "h3", title: "Tennis Smash", image: DARELLE_TENNIS_JUMP },
    { id: "h4", title: "Combat", image: DARELLE_BOXING },
    { id: "h5", title: "Court Gear", image: DARELLE_TENNIS_RACKET },
  ];

  const gridPhotos = [
    DARELLE_PHYSIQUE,
    DARELLE_TENNIS_JUMP,
    DARELLE_BOXING,
    DARELLE_TENNIS_RACKET,
    DARELLE_AVATAR,
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80",
  ];

  const avatarUri = profile.avatar_url || DARELLE_AVATAR;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <View style={styles.coverContainer}>
        <Image source={{ uri: profile.cover_url || DARELLE_TENNIS_JUMP }} style={styles.coverPhoto} />
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
          <Image source={{ uri: avatarUri }} style={[styles.avatar, { borderColor: colors.bgScreen }]} />
          <View style={styles.liveTrainingBadge}>
            <View style={styles.liveGreenDot} />
            <Text style={styles.liveTrainingText}>IFBB CERTIFIED TRAINER</Text>
          </View>
        </View>

        <View style={styles.nameRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={[styles.fullName, { color: colors.textPrimary }]}>{profile.first_name} {profile.last_name}</Text>
            <CheckCircle2 size={16} color="#38BDF8" fill="#38BDF8" />
          </View>
          <View style={styles.certBadge}>
            <Dumbbell size={12} color="#E11D48" />
            <Text style={styles.certBadgeText}>IFBB Certified Personal Fitness Trainer</Text>
          </View>
          <Text style={[styles.username, { color: colors.textSecondary }]}>@{profile.username} • Strength & Physique • Racket & Combat</Text>
          <Text style={[styles.bioText, { color: colors.textPrimary }]}>{profile.bio}</Text>
        </View>

        <View style={styles.actionBtnRow}>
          <TouchableOpacity onPress={() => setIsMyQrOpen(true)} style={styles.primaryActionBtn} accessibilityLabel="Show my QR code">
            <QrCode size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryActionText}>My QR</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenMessages} style={[styles.secondaryActionBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <MessageSquare size={15} color={colors.textPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>Message</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.metricsRow, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>3.8k</Text><Text style={styles.metricLabel}>Followers</Text></View>
          <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>215</Text><Text style={styles.metricLabel}>Following</Text></View>
          <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>540</Text><Text style={styles.metricLabel}>Workouts</Text></View>
          <View style={styles.metricItem}><Text style={[styles.metricVal, { color: colors.textPrimary }]}>24</Text><Text style={styles.metricLabel}>PR Stamps</Text></View>
        </View>

        <TouchableOpacity onPress={() => setIsNasmOpen(true)} style={[styles.nasmBanner, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={styles.nasmBannerLeft}>
            <Activity size={15} color="#E11D48" />
            <View>
              <Text style={[styles.nasmBannerTitle, { color: colors.textPrimary }]}>
                NASM Biometrics: {userBiometrics.heightCm}cm • {userBiometrics.weightKg}kg • {userBiometrics.goal.toUpperCase().replace("_", " ")}
              </Text>
              <Text style={[styles.nasmBannerSub, { color: colors.textMuted }]}>
                BMR {userBiometrics.bmr} • TDEE {userBiometrics.tdee} kcal • BMI {userBiometrics.bmi}
              </Text>
            </View>
          </View>
          <ChevronRight size={15} color="#E11D48" />
        </TouchableOpacity>

        <View style={styles.highlightsTray}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightsScroll}>
            {highlights.map((h) => (
              <TouchableOpacity key={h.id} onPress={() => setSelectedPhoto(h.image)} style={styles.highlightItem}>
                <View style={[styles.highlightRing, { borderColor: colors.borderColor }]}>
                  <Image source={{ uri: h.image }} style={styles.highlightThumb} />
                </View>
                <Text numberOfLines={1} style={[styles.highlightLabel, { color: colors.textSecondary }]}>{h.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

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

        {activeTab === "grid" && (
          <View style={styles.photoGrid}>
            {gridPhotos.map((photo, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedPhoto(photo)} style={styles.gridPhotoWrap}>
                <Image source={{ uri: photo }} style={styles.gridPhoto} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === "trophy" && (
          <View style={styles.trophyGrid}>
            <View style={[styles.stampCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              <View style={styles.stampHeader}>
                <Text style={styles.stampType}>IFBB CPFT • VERIFIED STRENGTH PR</Text>
                <Eye size={13} color="#10B981" />
              </View>
              <Text style={[styles.stampMetric, { color: colors.textPrimary }]}>225 KG</Text>
              <Text style={[styles.stampSub, { color: colors.textSecondary }]}>Conventional Deadlift 1RM • Metro Core Arena</Text>
            </View>
            <View style={[styles.stampCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              <View style={styles.stampHeader}>
                <Text style={styles.stampType}>RACKET SPEED • VERIFIED OVERHEAD</Text>
                <Eye size={13} color="#10B981" />
              </View>
              <Text style={[styles.stampMetric, { color: colors.textPrimary }]}>172 KM/H</Text>
              <Text style={[styles.stampSub, { color: colors.textSecondary }]}>Tennis Overhead Smash Peak Velocity • Court Club</Text>
            </View>
          </View>
        )}

        {activeTab === "locker" && (
          <View style={styles.lockerList}>
            {passes.length === 0 ? (
              <View style={styles.emptyLocker}>
                <Text style={[styles.emptyLockerText, { color: colors.textMuted }]}>No active passes. Explore facilities to unlock VIP access.</Text>
              </View>
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

      <Modal visible={!!selectedPhoto} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
        <View style={styles.photoModalOverlay}>
          <TouchableOpacity onPress={() => setSelectedPhoto(null)} style={styles.closePhotoBtn}><X size={22} color="#FFF" /></TouchableOpacity>
          {selectedPhoto && <Image source={{ uri: selectedPhoto }} style={styles.fullPhoto} resizeMode="contain" />}
        </View>
      </Modal>
      <NasmBiometricsModal visible={isNasmOpen} onClose={() => setIsNasmOpen(false)} />
      <MyQrModal visible={isMyQrOpen} onClose={() => setIsMyQrOpen(false)} />
    </ScrollView>
  );
}
