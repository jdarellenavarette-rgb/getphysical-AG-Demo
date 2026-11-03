import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { Heart, MessageCircle, Bookmark, Plus, MapPin, MoreHorizontal, Send, CheckCircle2, Award } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { TenStateView } from "../common/TenStateView";
import { createSuccessState, createEmptyState } from "sodia-core";

interface SodiaFeedProps {
  onPressFacilityCTA?: (facilityId: string) => void;
  onOpenCreatePost?: () => void;
  onOpenStory?: (index: number) => void;
  onOpenComments?: () => void;
}

export function SodiaFeed({
  onPressFacilityCTA,
  onOpenCreatePost,
  onOpenStory,
  onOpenComments,
}: SodiaFeedProps) {
  const { posts, profile, userStory } = useEcosystemStore();
  const { colors } = useThemeStore();
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [sharedPosts, setSharedPosts] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleSave = (id: string) => setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));

  const stories = [
    { id: "s0", name: "Your Story", isMe: true, hasStory: !!userStory, image: profile.avatar_url },
    { id: "s1", name: "Metro Core", hasStory: true, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80" },
    { id: "s2", name: "Nexus Club", hasStory: true, image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=200&q=80" },
    { id: "s3", name: "Coach Miguel", hasStory: true, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
    { id: "s4", name: "Tina Smash", hasStory: true, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  ];

  const feedState = posts.length === 0
    ? createEmptyState("Your community feed is quiet. Share your first workout or status.", "+ Create Post")
    : createSuccessState(posts);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. STORIES TRAY */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.storiesContainer, { borderBottomColor: colors.borderColor }]}>
        {stories.map((st, idx) => (
          <TouchableOpacity
            key={st.id}
            onPress={() => {
              if (st.isMe && !st.hasStory) {
                onOpenCreatePost?.();
              } else {
                onOpenStory?.(st.isMe ? 0 : idx - 1);
              }
            }}
            style={styles.storyItem}
          >
            <View style={[styles.storyRing, { borderColor: colors.borderColor }, st.hasStory && styles.storyRingActive, st.isMe && !st.hasStory && { borderColor: colors.borderLight }]}>
              <Image source={{ uri: st.image ?? "" }} style={styles.storyAvatar} />
              {st.isMe && !st.hasStory && (
                <View style={[styles.storyAddBadge, { borderColor: colors.bgScreen }]}>
                  <Plus size={11} color="#FFFFFF" strokeWidth={3.5} />
                </View>
              )}
            </View>
            <Text numberOfLines={1} style={[styles.storyLabel, { color: colors.textSecondary }]}>{st.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 2. FEED POSTS */}
      <TenStateView state={feedState} onRetry={onOpenCreatePost}>
        {() => (
          <View style={styles.feedList}>
            {posts.map((post) => {
              const isLiked = likedPosts[post.id] ?? false;
              const isSaved = savedPosts[post.id] ?? false;
              const facTag = post.facility_tag && typeof post.facility_tag === "object" && !Array.isArray(post.facility_tag)
                ? (post.facility_tag as Record<string, string | number>)
                : null;
              const stampObj = post.stamp && typeof post.stamp === "object" && !Array.isArray(post.stamp)
                ? (post.stamp as Record<string, string | boolean>)
                : null;
              const likes = (post.likes_count ?? 0) + (isLiked ? 1 : 0);
              const isStatusPost = !post.media_url;

              return (
                <View key={post.id} style={[styles.postCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
                  {/* AUTHOR ROW */}
                  <View style={styles.postTopBar}>
                    <View style={styles.authorAvatarRing}>
                      <Image source={{ uri: post.author_avatar ?? profile.avatar_url ?? "" }} style={styles.postAvatar} />
                    </View>
                    <View style={styles.postAuthorInfo}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <Text style={[styles.postAuthorName, { color: colors.textPrimary }]}>{post.author_name}</Text>
                        <CheckCircle2 size={12} color="#38BDF8" fill="#38BDF8" />
                      </View>
                      <Text style={[styles.postSubtitle, { color: colors.textMuted }]}>
                        {facTag ? String(facTag.name) : "Metro Manila"} • 2h ago
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => Alert.alert("Post Options", "Post link copied to clipboard.")} style={styles.moreBtn}>
                      <MoreHorizontal size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* MEDIA OR STATUS POST */}
                  {isStatusPost ? (
                    <View style={styles.statusPostCard}>
                      <Text style={styles.statusPostText}>{post.content}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity activeOpacity={0.9} onPress={() => toggleLike(post.id)} style={styles.mediaContainer}>
                      <Image source={{ uri: post.media_url ?? "" }} style={styles.mediaPhoto} resizeMode="cover" />
                      {stampObj && (
                        <View style={styles.floatingStamp}>
                          <Award size={13} color="#10B981" />
                          <Text style={styles.floatingStampText}>{String(stampObj.primaryMetric ?? "VERIFIED PR")}</Text>
                        </View>
                      )}
                      {facTag && (
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

                  {/* ACTION BAR */}
                  <View style={styles.postFooter}>
                    <View style={styles.interactionRow}>
                      <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                        <TouchableOpacity onPress={() => toggleLike(post.id)}>
                          <Heart size={22} color={isLiked ? "#E11D48" : colors.textPrimary} fill={isLiked ? "#E11D48" : "none"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onOpenComments}>
                          <MessageCircle size={22} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setSharedPosts((p) => ({ ...p, [post.id]: true })); Alert.alert("Sent", "Shared to athlete direct message."); }}>
                          <Send size={20} color={sharedPosts[post.id] ? "#3B82F6" : colors.textPrimary} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => toggleSave(post.id)}>
                        <Bookmark size={22} color={isSaved ? "#F59E0B" : colors.textPrimary} fill={isSaved ? "#F59E0B" : "none"} />
                      </TouchableOpacity>
                    </View>

                    {/* LIKES & CAPTION BLOCK */}
                    <Text style={[styles.likesCountText, { color: colors.textPrimary }]}>Liked by coach.miguel and {likes} others</Text>
                    {!isStatusPost && (
                      <Text style={[styles.captionBody, { color: colors.textPrimary }]}>
                        <Text style={[styles.captionAuthor, { color: colors.textPrimary }]}>{post.author_name} </Text>
                        {post.content}
                      </Text>
                    )}
                    <TouchableOpacity onPress={onOpenComments} style={styles.commentTeaserRow}>
                      <Text style={[styles.commentTeaserText, { color: colors.textMuted }]}>View all {post.comments_count ?? 4} comments</Text>
                    </TouchableOpacity>
                    <Text style={[styles.timestampText, { color: colors.textMuted }]}>2 HOURS AGO</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </TenStateView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 110, paddingTop: 10 },
  storiesContainer: { paddingHorizontal: 16, gap: 14, paddingBottom: 14, borderBottomWidth: 1 },
  storyItem: { alignItems: "center", width: 68 },
  storyRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, padding: 2, alignItems: "center", justifyContent: "center", position: "relative" },
  storyRingActive: { borderColor: "#E11D48" },
  storyAvatar: { width: "100%", height: "100%", borderRadius: 28 },
  storyAddBadge: { position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center", borderWidth: 2 },
  storyLabel: { fontSize: 11, fontWeight: "600", marginTop: 5, textAlign: "center" },
  feedList: { gap: 18, marginTop: 12 },
  postCard: { borderTopWidth: 1, borderBottomWidth: 1 },
  postTopBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
  authorAvatarRing: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: "#E11D48", padding: 1 },
  postAvatar: { width: "100%", height: "100%", borderRadius: 18 },
  postAuthorInfo: { flex: 1, marginLeft: 10 },
  postAuthorName: { fontSize: 13, fontWeight: "800" },
  postSubtitle: { fontSize: 11, marginTop: 1 },
  moreBtn: { minWidth: 36, minHeight: 36, alignItems: "center", justifyContent: "center" },
  mediaContainer: { position: "relative", width: "100%", height: 320, backgroundColor: "#18181B" },
  mediaPhoto: { width: "100%", height: "100%" },
  floatingStamp: { position: "absolute", top: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(9,9,11,0.85)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: "#10B981" },
  floatingStampText: { color: "#10B981", fontSize: 10, fontWeight: "900" },
  venueFloatingPill: { position: "absolute", bottom: 12, left: 12, right: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(9, 9, 11, 0.88)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)" },
  venueFloatingName: { color: "#FAFAFA", fontSize: 12, fontWeight: "800", flex: 1, marginLeft: 6 },
  venuePillCta: { backgroundColor: "#E11D48", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  venuePillCtaText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  statusPostCard: { backgroundColor: "#BE123C", padding: 28, minHeight: 180, justifyContent: "center", alignItems: "center" },
  statusPostText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", textAlign: "center", lineHeight: 28 },
  postFooter: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14 },
  interactionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  likesCountText: { fontSize: 13, fontWeight: "800", marginBottom: 6 },
  captionBody: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  captionAuthor: { fontWeight: "800" },
  commentTeaserRow: { marginTop: 3 },
  commentTeaserText: { fontSize: 12, fontWeight: "600" },
  timestampText: { fontSize: 10, fontWeight: "700", marginTop: 6, letterSpacing: 0.5 },
});
