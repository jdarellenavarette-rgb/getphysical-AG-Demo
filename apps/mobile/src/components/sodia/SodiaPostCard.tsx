import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { Heart, MessageCircle, Bookmark, Send, MapPin, MoreHorizontal, CheckCircle2, Award, Play, Trophy, Sparkles, Tag } from "lucide-react-native";
import type { SodiaPostRow } from "sodia-core";
import { useThemeStore } from "../../theme/theme";
import { PlayableVideoView } from "./PlayableVideoView";

interface SodiaPostCardProps {
  post: SodiaPostRow;
  profileAvatar?: string | null;
  isLiked: boolean;
  isSaved: boolean;
  isShared: boolean;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onShare: (id: string) => void;
  onOpenComments?: () => void;
  onPressFacilityCTA?: (facilityId: string) => void;
  onPressAuthor?: (userId: string, name: string, avatar?: string | null) => void;
}

export function SodiaPostCard({
  post,
  profileAvatar,
  isLiked,
  isSaved,
  isShared,
  onToggleLike,
  onToggleSave,
  onShare,
  onOpenComments,
  onPressFacilityCTA,
  onPressAuthor,
}: SodiaPostCardProps) {
  const { colors } = useThemeStore();

  const facTag = post.facility_tag && typeof post.facility_tag === "object" && !Array.isArray(post.facility_tag)
    ? (post.facility_tag as Record<string, string | number>)
    : null;
  const stampObj = post.stamp && typeof post.stamp === "object" && !Array.isArray(post.stamp)
    ? (post.stamp as Record<string, string | number | boolean>)
    : null;

  const postType = (stampObj?.type as string) || (post.media_url ? "photo" : "status");
  const isReel = postType === "reel";
  const isChallenge = postType === "challenge";
  const isAd = postType === "ad";
  const isStatus = postType === "status" || !post.media_url;
  const likes = (post.likes_count ?? 0) + (isLiked ? 1 : 0);

  return (
    <View style={[styles.postCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
      {/* 1. AUTHOR ROW */}
      <View style={styles.postTopBar}>
        <TouchableOpacity
          onPress={() => onPressAuthor?.(post.user_id ?? "", post.author_name ?? "Athlete", post.author_avatar)}
          style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
        >
          <View style={[styles.authorAvatarRing, isAd && { borderColor: "#F59E0B" }]}>
            <Image source={{ uri: post.author_avatar ?? profileAvatar ?? "" }} style={styles.postAvatar} />
          </View>
          <View style={styles.postAuthorInfo}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={[styles.postAuthorName, { color: colors.textPrimary }]}>{post.author_name}</Text>
              {isAd ? (
                <View style={styles.sponsoredBadge}><Text style={styles.sponsoredText}>SPONSORED</Text></View>
              ) : (
                <CheckCircle2 size={12} color="#38BDF8" fill="#38BDF8" />
              )}
            </View>
            <Text style={[styles.postSubtitle, { color: colors.textMuted }]}>
              {facTag ? String(facTag.name) : "Metro Manila"} • {isAd ? "Promoted" : "2h ago"}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("Post Options", "Post link copied to clipboard.")} style={styles.moreBtn}>
          <MoreHorizontal size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* 2. MEDIA / CONTENT BODY */}
      {isStatus ? (
        <View style={styles.statusPostCard}>
          <Text style={styles.statusPostText}>"{post.content}"</Text>
          <Text style={styles.statusAuthorSign}>— {post.author_name}</Text>
        </View>
      ) : isReel ? (
        <View style={[styles.mediaContainer, styles.reelMediaContainer]}>
          <PlayableVideoView
            videoUrl={String(stampObj?.videoUrl ?? "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4")}
            posterUrl={post.media_url ?? undefined}
            autoPlay={false}
          />
          <View style={styles.reelBadge}>
            <Play size={11} color="#FFF" fill="#FFF" />
            <Text style={styles.reelBadgeText}>REEL • {String(stampObj?.duration ?? "0:38")}</Text>
          </View>
          <View style={styles.reelAudioTicker}>
            <Text style={styles.reelAudioText}>{String(stampObj?.audioTrack ?? "Original Audio • sofia.pilates")}</Text>
            <Text style={styles.reelViewsText}>• {String(stampObj?.viewsCount ?? "14.8k")} views</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity activeOpacity={0.9} onPress={() => onToggleLike(post.id)} style={styles.mediaContainer}>
          <Image source={{ uri: post.media_url ?? "" }} style={styles.mediaPhoto} resizeMode="cover" />

          {/* PR CHALLENGE FLOATING BADGE */}
          {isChallenge && (
            <View style={styles.challengeFloatingStamp}>
              <Trophy size={13} color="#F59E0B" />
              <Text style={styles.challengeFloatingText}>{String(stampObj?.metric ?? "VERIFIED BENCHMARK")}</Text>
            </View>
          )}

          {/* GYM AD PROMO PILL */}
          {isAd && (
            <View style={styles.adFloatingPill}>
              <Tag size={12} color="#10B981" />
              <Text style={styles.adPromoText}>Code: {String(stampObj?.promoCode ?? "SODIA2026")}</Text>
            </View>
          )}

          {/* VENUE PILL */}
          {facTag && !isAd && (
            <TouchableOpacity onPress={() => onPressFacilityCTA?.(String(facTag.id ?? ""))} style={styles.venueFloatingPill}>
              <MapPin size={12} color="#10B981" />
              <Text style={styles.venueFloatingName}>@{facTag.name}</Text>
              <View style={styles.venuePillCta}>
                <Text style={styles.venuePillCtaText}>{facTag.actionCTA} • ₱{facTag.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      )}

      {/* 3. CHALLENGE BANNER CALLOUT (FOR PR CHALLENGE POSTS) */}
      {isChallenge && (
        <View style={[styles.challengeBanner, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.challengeBannerTitle, { color: colors.textPrimary }]}>
              🏆 {String(stampObj?.title ?? "PR Challenge")}
            </Text>
            <Text style={[styles.challengeBannerMeta, { color: colors.textMuted }]}>
              {String(stampObj?.benchmark ?? "Benchmark")} • {String(stampObj?.participantsCount ?? 40)} Athletes • {String(stampObj?.daysLeft ?? 5)} Days Left
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert("Challenge Joined!", "You're registered! Record and upload your lift video to submit.")}
            style={styles.challengeJoinBtn}
          >
            <Text style={styles.challengeJoinBtnText}>Join Challenge</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. AD ACTION BANNER (FOR GYM AD POSTS) */}
      {isAd && (
        <View style={[styles.adCtaBanner, { backgroundColor: colors.bgCardSecondary, borderTopColor: colors.borderColor }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.adCtaTitle, { color: colors.textPrimary }]}>7-Day VIP Guest Pass</Text>
            <Text style={[styles.adCtaSub, { color: colors.textMuted }]}>Olympic platforms, sauna, & cold plunge</Text>
          </View>
          <TouchableOpacity
            onPress={() => onPressFacilityCTA?.(String(facTag?.id ?? "fac_metro_core"))}
            style={styles.adClaimBtn}
          >
            <Text style={styles.adClaimBtnText}>Claim Offer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5. ACTION & INTERACTION BAR */}
      <View style={styles.postFooter}>
        <View style={styles.interactionRow}>
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            <TouchableOpacity onPress={() => onToggleLike(post.id)}>
              <Heart size={22} color={isLiked ? "#E11D48" : colors.textPrimary} fill={isLiked ? "#E11D48" : "none"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenComments}>
              <MessageCircle size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onShare(post.id)}>
              <Send size={20} color={isShared ? "#3B82F6" : colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => onToggleSave(post.id)}>
            <Bookmark size={22} color={isSaved ? "#F59E0B" : colors.textPrimary} fill={isSaved ? "#F59E0B" : "none"} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.likesCountText, { color: colors.textPrimary }]}>Liked by coach.miguel and {likes} others</Text>
        {!isStatus && (
          <Text style={[styles.captionBody, { color: colors.textPrimary }]}>
            <Text style={[styles.captionAuthor, { color: colors.textPrimary }]}>{post.author_name} </Text>
            {post.content}
          </Text>
        )}
        <TouchableOpacity onPress={onOpenComments} style={styles.commentTeaserRow}>
          <Text style={[styles.commentTeaserText, { color: colors.textMuted }]}>View all {post.comments_count ?? 4} comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: { borderTopWidth: 1, borderBottomWidth: 1 },
  postTopBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
  authorAvatarRing: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: "#E11D48", padding: 1 },
  postAvatar: { width: "100%", height: "100%", borderRadius: 18 },
  postAuthorInfo: { flex: 1, marginLeft: 10 }, postAuthorName: { fontSize: 13, fontWeight: "800" },
  postSubtitle: { fontSize: 11, marginTop: 1 },
  sponsoredBadge: { backgroundColor: "rgba(245,158,11,0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sponsoredText: { color: "#F59E0B", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  moreBtn: { minWidth: 36, minHeight: 36, alignItems: "center", justifyContent: "center" },
  mediaContainer: { position: "relative", width: "100%", height: 310 },
  reelMediaContainer: { height: 380 },
  mediaPhoto: { width: "100%", height: "100%" },
  reelBadge: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(0,0,0,0.75)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  reelBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  reelCenterPlay: { position: "absolute", top: "42%", left: "44%" },
  playIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFF" },
  reelAudioTicker: { position: "absolute", bottom: 12, left: 12, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  reelAudioText: { color: "#FFF", fontSize: 10, fontWeight: "700" }, reelViewsText: { color: "#94A3B8", fontSize: 10, marginLeft: 4 },
  challengeFloatingStamp: { position: "absolute", top: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(9,9,11,0.85)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: "#F59E0B" },
  challengeFloatingText: { color: "#FBBF24", fontSize: 10, fontWeight: "900" },
  adFloatingPill: { position: "absolute", top: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(9,9,11,0.85)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: "#10B981" },
  adPromoText: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  venueFloatingPill: { position: "absolute", bottom: 12, left: 12, right: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(9, 9, 11, 0.88)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)" },
  venueFloatingName: { color: "#FAFAFA", fontSize: 12, fontWeight: "800", flex: 1, marginLeft: 6 },
  venuePillCta: { backgroundColor: "#E11D48", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  venuePillCtaText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  statusPostCard: { backgroundColor: "#881337", padding: 26, minHeight: 180, justifyContent: "center", alignItems: "center" },
  statusPostText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800", textAlign: "center", lineHeight: 26 },
  statusAuthorSign: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700", marginTop: 10 },
  challengeBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderTopWidth: 0 },
  challengeBannerTitle: { fontSize: 13, fontWeight: "800" }, challengeBannerMeta: { fontSize: 11, marginTop: 2 },
  challengeJoinBtn: { backgroundColor: "#E11D48", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  challengeJoinBtnText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  adCtaBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1 },
  adCtaTitle: { fontSize: 13, fontWeight: "800" }, adCtaSub: { fontSize: 11, marginTop: 2 },
  adClaimBtn: { backgroundColor: "#10B981", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  adClaimBtnText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  postFooter: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14 },
  interactionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  likesCountText: { fontSize: 13, fontWeight: "800", marginBottom: 6 },
  captionBody: { fontSize: 13, lineHeight: 18, marginBottom: 4 }, captionAuthor: { fontWeight: "800" },
  commentTeaserRow: { marginTop: 3 }, commentTeaserText: { fontSize: 12, fontWeight: "600" },
});
