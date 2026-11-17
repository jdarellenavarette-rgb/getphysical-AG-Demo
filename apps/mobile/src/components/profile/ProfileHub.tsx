import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import { Award, Shield, MessageSquare, QrCode, ArrowLeft, Grid, X, Activity, ChevronRight } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore } from "../../store/trackingStore";
import { useFeedStore } from "../../store/feedStore";
import { passStatusLabel } from "../../lib/passDisplay";
import { Avatar } from "../common/Avatar";
import { SheetBackdrop } from "../common/SheetParts";
import { useSwipeDownAnywhere } from "../../hooks/useDismissGestures";
import { NasmBiometricsModal } from "./NasmBiometricsModal";
import { MyQrModal } from "./MyQrModal";
import { styles } from "./ProfileHub.styles";

interface ProfileHubProps {
  onBack?: () => void;
  onOpenMessages?: () => void;
}

/** Follower counts stored on the profile row; zero until the server fills them in. */
function metric(metrics: unknown, key: string): number {
  const value = metrics && typeof metrics === "object" ? (metrics as Record<string, unknown>)[key] : undefined;
  return typeof value === "number" ? value : 0;
}

/** The signed-in person's own profile. Everything shown comes from their account. */
export function ProfileHub({ onBack, onOpenMessages }: ProfileHubProps) {
  const { profile, passes, posts } = useEcosystemStore();
  const { colors } = useThemeStore();
  const { userBiometrics, hasSetBiometrics, liftSessions, moveActivities } = useTrackingStore();
  const { followedUserIds } = useFeedStore();
  const [activeTab, setActiveTab] = useState<"grid" | "trophy" | "locker">("grid");
  const [isMyQrOpen, setIsMyQrOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isNasmOpen, setIsNasmOpen] = useState(false);
  const photoSwipe = useSwipeDownAnywhere(() => setSelectedPhoto(null));

  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Guest";
  const myPhotos = posts
    .filter((p) => p.user_id === profile.id && p.media_url && (p.stamp as { type?: string } | null)?.type !== "reel")
    .map((p) => p.media_url as string);
  const personalBests = liftSessions.filter((session) => session.isPR);
  const followingCount = Math.max(
    metric(profile.metrics, "following"),
    Object.values(followedUserIds).filter(Boolean).length,
  );

  const stats = [
    { label: "Followers", value: metric(profile.metrics, "followers") },
    { label: "Following", value: followingCount },
    { label: "Workouts", value: liftSessions.length + moveActivities.length },
    { label: "Personal bests", value: personalBests.length },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgScreen }]}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.coverContainer, { backgroundColor: colors.bgCardSecondary }]}>
        {profile.cover_url ? <Image source={{ uri: profile.cover_url }} style={styles.coverPhoto} /> : null}
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButtonPill}
            accessibilityRole="button"
            accessibilityLabel="Back to feed"
          >
            <ArrowLeft size={16} color="#FAFAFA" />
            <Text style={styles.backButtonText}>Feed</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatarRow}>
          <Avatar
            uri={profile.avatar_url}
            name={fullName}
            size={84}
            style={[styles.avatar, { borderColor: colors.bgScreen }]}
          />
        </View>

        <View style={styles.nameRow}>
          <Text style={[styles.fullName, { color: colors.textPrimary }]}>{fullName}</Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>@{profile.username}</Text>
          {profile.bio ? <Text style={[styles.bioText, { color: colors.textPrimary }]}>{profile.bio}</Text> : null}
        </View>

        <View style={styles.actionBtnRow}>
          <TouchableOpacity
            onPress={() => setIsMyQrOpen(true)}
            style={styles.primaryActionBtn}
            accessibilityRole="button"
            accessibilityLabel="Show my QR code"
          >
            <QrCode size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryActionText}>My QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onOpenMessages}
            style={[styles.secondaryActionBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
            accessibilityRole="button"
          >
            <MessageSquare size={15} color={colors.textPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>Messages</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.metricsRow, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{stat.value.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setIsNasmOpen(true)}
          style={[styles.nasmBanner, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
          accessibilityRole="button"
        >
          <View style={styles.nasmBannerLeft}>
            <Activity size={15} color="#E11D48" />
            <View>
              <Text style={[styles.nasmBannerTitle, { color: colors.textPrimary }]}>
                {hasSetBiometrics
                  ? `${userBiometrics.heightCm} cm • ${userBiometrics.weightKg} kg • ${userBiometrics.goal.replace("_", " ")}`
                  : "Set up your body metrics"}
              </Text>
              <Text style={[styles.nasmBannerSub, { color: colors.textMuted }]}>
                {hasSetBiometrics
                  ? `BMR ${userBiometrics.bmr} • TDEE ${userBiometrics.tdee} kcal • BMI ${userBiometrics.bmi}`
                  : "Height, weight and goal set your daily calorie and macro targets."}
              </Text>
            </View>
          </View>
          <ChevronRight size={15} color="#E11D48" />
        </TouchableOpacity>

        <View style={[styles.tabsHeader, { borderBottomColor: colors.borderColor }]}>
          {(
            [
              { id: "grid", label: "Photos", Icon: Grid },
              { id: "trophy", label: "Personal bests", Icon: Award },
              { id: "locker", label: "Passes", Icon: Shield },
            ] as const
          ).map(({ id, label, Icon }) => (
            <TouchableOpacity
              key={id}
              onPress={() => setActiveTab(id)}
              style={[styles.tabItem, activeTab === id && styles.tabItemActive]}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: activeTab === id }}
            >
              <Icon size={16} color={activeTab === id ? "#E11D48" : "#71717A"} />
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "grid" &&
          (myPhotos.length === 0 ? (
            <View style={styles.emptyLocker}>
              <Text style={[styles.emptyLockerText, { color: colors.textMuted }]}>
                No photos yet. Posts you share with a photo appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {myPhotos.map((photo, i) => (
                <TouchableOpacity
                  key={`${photo}_${i}`}
                  onPress={() => setSelectedPhoto(photo)}
                  style={styles.gridPhotoWrap}
                  accessibilityRole="imagebutton"
                >
                  <Image source={{ uri: photo }} style={styles.gridPhoto} />
                </TouchableOpacity>
              ))}
            </View>
          ))}

        {activeTab === "trophy" && (
          <View style={styles.trophyGrid}>
            {personalBests.length === 0 ? (
              <View style={styles.emptyLocker}>
                <Text style={[styles.emptyLockerText, { color: colors.textMuted }]}>
                  No personal bests yet. Beat a previous lift and it will be recorded here.
                </Text>
              </View>
            ) : (
              personalBests.map((session) => {
                const top = session.exercises
                  .flatMap((exercise) => exercise.sets.map((set) => ({ ...set, name: exercise.name })))
                  .reduce((best, set) => (set.weight > best.weight ? set : best));
                return (
                  <View
                    key={session.id}
                    style={[styles.stampCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
                  >
                    <Text style={styles.stampType}>{top.name.toUpperCase()}</Text>
                    <Text style={[styles.stampMetric, { color: colors.textPrimary }]}>
                      {top.weight} KG × {top.reps}
                    </Text>
                    <Text style={[styles.stampSub, { color: colors.textSecondary }]}>
                      {new Date(session.date).toLocaleDateString()}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === "locker" && (
          <View style={styles.lockerList}>
            {passes.length === 0 ? (
              <View style={styles.emptyLocker}>
                <Text style={[styles.emptyLockerText, { color: colors.textMuted }]}>
                  No passes yet. Passes you buy appear here and in your wallet.
                </Text>
              </View>
            ) : (
              passes.map((p) => (
                <View
                  key={p.id}
                  style={[styles.lockerRow, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
                >
                  <Text style={[styles.lockerPassType, { color: colors.textPrimary }]}>{p.pass_type}</Text>
                  <Text style={styles.lockerStatus}>{passStatusLabel(p)}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      <Modal visible={!!selectedPhoto} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
        <View style={styles.photoModalOverlay} {...photoSwipe}>
          <SheetBackdrop onPress={() => setSelectedPhoto(null)} />
          <TouchableOpacity
            onPress={() => setSelectedPhoto(null)}
            style={styles.closePhotoBtn}
            accessibilityRole="button"
            accessibilityLabel="Close photo"
          >
            <X size={22} color="#FFF" />
          </TouchableOpacity>
          {selectedPhoto && <Image source={{ uri: selectedPhoto }} style={styles.fullPhoto} resizeMode="contain" />}
        </View>
      </Modal>
      <NasmBiometricsModal visible={isNasmOpen} onClose={() => setIsNasmOpen(false)} />
      <MyQrModal visible={isMyQrOpen} onClose={() => setIsMyQrOpen(false)} />
    </ScrollView>
  );
}
