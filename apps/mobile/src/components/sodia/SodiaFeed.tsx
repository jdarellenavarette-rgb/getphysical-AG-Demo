import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Plus } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { useFeedStore } from "../../store/feedStore";
import { OWN_STORY_ID } from "../../lib/stories";
import { Avatar } from "../common/Avatar";
import { useRequireAccount } from "../../hooks/useRequireAccount";
import { TenStateView } from "../common/TenStateView";
import { createSuccessState, createEmptyState } from "sodia-core";
import { SodiaPostCard } from "./SodiaPostCard";

interface SodiaFeedProps {
  onPressFacilityCTA?: (facilityId: string) => void;
  onOpenCreatePost?: () => void;
  onOpenStoryCamera?: () => void;
  onOpenStory?: (storyId: string) => void;
  onOpenComments?: (postId: string) => void;
  onPressAuthor?: (userId: string, name: string, avatar?: string | null) => void;
}

export function SodiaFeed({
  onPressFacilityCTA,
  onOpenCreatePost,
  onOpenStoryCamera,
  onOpenStory,
  onOpenComments,
  onPressAuthor,
}: SodiaFeedProps) {
  const { posts, profile, userStory, deletePost } = useEcosystemStore();
  const { colors } = useThemeStore();
  const { likedPostIds, joinedChallengeIds, commentsByPost, toggleLike, toggleChallenge, forgetPost } = useFeedStore();

  const requireAccount = useRequireAccount();
  const likePost = (id: string) => {
    if (requireAccount("like posts")) toggleLike(id);
  };
  const joinChallenge = (id: string) => {
    if (requireAccount("join a challenge")) toggleChallenge(id);
  };

  const handleDelete = (id: string) => {
    deletePost(id);
    forgetPost(id);
  };

  // Other people's stories will come from the server; for now the tray holds only your own.
  const stories = [
    { id: OWN_STORY_ID, name: "Your Story", isMe: true, hasStory: !!userStory, image: profile.avatar_url },
  ];

  const feedState =
    posts.length === 0
      ? createEmptyState("No posts yet. Share your first workout or status.", "Create Post")
      : createSuccessState(posts);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgScreen }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. STORIES TRAY */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.storiesContainer, { borderBottomColor: colors.borderColor }]}
      >
        {stories.map((st) => (
          <TouchableOpacity
            key={st.id}
            onPress={() => {
              if (st.isMe && !st.hasStory) {
                onOpenStoryCamera?.();
              } else {
                onOpenStory?.(st.id);
              }
            }}
            style={styles.storyItem}
          >
            <View
              style={[
                styles.storyRing,
                { borderColor: colors.borderColor },
                st.hasStory && styles.storyRingActive,
                st.isMe && !st.hasStory && { borderColor: colors.borderLight },
              ]}
            >
              <Avatar uri={st.image} name={profile.name} size={58} style={styles.storyAvatar} />
              {st.isMe && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onOpenStoryCamera?.();
                  }}
                  style={[styles.storyAddBadge, { borderColor: colors.bgScreen }]}
                >
                  <Plus size={11} color="#FFFFFF" strokeWidth={3.5} />
                </TouchableOpacity>
              )}
            </View>
            <Text numberOfLines={1} style={[styles.storyLabel, { color: colors.textSecondary }]}>
              {st.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 2. FEED POSTS */}
      <TenStateView state={feedState} onRetry={onOpenCreatePost}>
        {() => (
          <View style={styles.feedList}>
            {posts.map((post) => (
              <SodiaPostCard
                key={post.id}
                post={post}
                profileAvatar={profile.avatar_url}
                isLiked={likedPostIds[post.id] ?? false}
                isOwn={post.user_id === profile.id}
                isChallengeJoined={
                  joinedChallengeIds[String((post.stamp as { challengeId?: string } | null)?.challengeId ?? post.id)] ??
                  false
                }
                commentCount={commentsByPost[post.id]?.length ?? 0}
                onToggleLike={likePost}
                onToggleChallenge={joinChallenge}
                onDelete={handleDelete}
                onOpenComments={onOpenComments}
                onPressFacilityCTA={onPressFacilityCTA}
                onPressAuthor={onPressAuthor}
              />
            ))}
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
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  storyRingActive: { borderColor: "#E11D48" },
  storyAvatar: { width: "100%", height: "100%", borderRadius: 28 },
  storyAddBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E11D48",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  storyLabel: { fontSize: 11, fontWeight: "600", marginTop: 5, textAlign: "center" },
  feedList: { gap: 18, marginTop: 12 },
});
