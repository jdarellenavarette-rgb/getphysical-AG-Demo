import React, { memo, useMemo } from "react";
import { Image, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BadgeCheck, MoreHorizontal } from "lucide-react-native";
import { MIN_TOUCH_TARGET, type SodiaPostRow } from "sodia-core";
import { useColors } from "../../theme/theme";
import { overlays } from "../../navigation/overlayStore";
import { toPostView } from "./feed/postModel";
import { PostMedia } from "./feed/PostMedia";
import { PostActions } from "./feed/PostActions";
import { AdCallout, ChallengeCallout, challengeFromView } from "./feed/PostCallouts";

interface SodiaPostCardProps {
  post: SodiaPostRow;
  profileAvatar?: string | null;
  isLiked: boolean;
  isSaved: boolean;
  isShared: boolean;
  onToggleLike: (id: string) => void;
  /** Double-tap only ever likes (never un-likes), matching Instagram. */
  onLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onShare: (id: string) => void;
  onOpenComments?: (postId: string) => void;
  onPressFacilityCTA?: (facilityId: string) => void;
  onPressAuthor?: (userId: string, name: string, avatar?: string | null) => void;
}

function SodiaPostCardImpl(props: SodiaPostCardProps) {
  const { post, profileAvatar, isLiked } = props;
  const colors = useColors();
  const view = useMemo(() => toPostView(post), [post]);
  const isAd = view.kind === "ad";
  const likeCount = (post.likes_count ?? 0) + (isLiked ? 1 : 0);
  const author = post.author_name ?? "Athlete";
  const openComments = () => props.onOpenComments?.(post.id);

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => props.onPressAuthor?.(post.user_id ?? "", author, post.author_avatar)}
          style={styles.authorTouch}
          accessibilityRole="button"
          accessibilityLabel={`${author}, view profile`}
        >
          <View style={[styles.avatarRing, { borderColor: isAd ? colors.warning : colors.accent }]}>
            <Image source={{ uri: post.author_avatar ?? profileAvatar ?? "" }} style={styles.avatar} />
          </View>
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{author}</Text>
              {isAd ? (
                <View style={[styles.sponsored, { backgroundColor: colors.bgCardTertiary }]}>
                  <Text style={[styles.sponsoredText, { color: colors.warning }]}>SPONSORED</Text>
                </View>
              ) : (
                <BadgeCheck size={14} color={colors.verified} accessibilityLabel="Verified" />
              )}
            </View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {view.facilityTag ? String(view.facilityTag.name) : "Metro Manila"} • {isAd ? "Promoted" : "2h ago"}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Share.share({ message: `${author} on Sodia: ${post.content ?? ""}` }).catch(() => undefined);
          }}
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel="Post options"
        >
          <MoreHorizontal size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <PostMedia post={post} view={view} onDoubleTapLike={() => props.onLike(post.id)} onPressFacility={props.onPressFacilityCTA} />

      {view.kind === "challenge" && (
        <ChallengeCallout
          challenge={challengeFromView(post.id, view)}
          onOpen={() => overlays.open({ kind: "challenge", challenge: challengeFromView(post.id, view) })}
        />
      )}
      {isAd && <AdCallout onClaim={() => props.onPressFacilityCTA?.(String(view.facilityTag?.id ?? "fac_metro_core"))} />}

      <PostActions
        authorName={author}
        caption={post.content}
        showCaption={view.kind !== "status"}
        likeCount={likeCount}
        commentCount={post.comments_count ?? 0}
        isLiked={isLiked}
        isSaved={props.isSaved}
        isShared={props.isShared}
        onToggleLike={() => props.onToggleLike(post.id)}
        onToggleSave={() => props.onToggleSave(post.id)}
        onShare={() => props.onShare(post.id)}
        onOpenComments={openComments}
      />
    </View>
  );
}

export const SodiaPostCard = memo(SodiaPostCardImpl);

const styles = StyleSheet.create({
  card: { borderTopWidth: 1, borderBottomWidth: 1 },
  topBar: { flexDirection: "row", alignItems: "center", paddingLeft: 14, paddingVertical: 6 },
  authorTouch: { flexDirection: "row", alignItems: "center", flex: 1, minHeight: MIN_TOUCH_TARGET },
  avatarRing: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, padding: 1 },
  avatar: { width: "100%", height: "100%", borderRadius: 18 },
  authorInfo: { flex: 1, marginLeft: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { fontSize: 13, fontWeight: "800", flexShrink: 1 },
  subtitle: { fontSize: 11, marginTop: 1 },
  sponsored: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sponsoredText: { fontSize: 11, fontWeight: "900", letterSpacing: 0.4 },
  moreBtn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
});
