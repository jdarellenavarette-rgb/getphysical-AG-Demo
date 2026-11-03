import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { Plus } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { TenStateView } from "../common/TenStateView";
import { createSuccessState, createEmptyState } from "sodia-core";
import { SodiaPostCard } from "./SodiaPostCard";

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
  const handleShare = (id: string) => {
    setSharedPosts((p) => ({ ...p, [id]: true }));
    Alert.alert("Sent", "Shared to athlete direct message.");
  };

  const stories = [
    { id: "s0", name: "Your Story", isMe: true, hasStory: !!userStory, image: profile.avatar_url },
    { id: "s1", name: "Metro Core", hasStory: true, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80" },
    { id: "s2", name: "Nexus Club", hasStory: true, image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=200&q=80" },
    { id: "s3", name: "Coach Miguel", hasStory: true, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
    { id: "s4", name: "Coach Sofia", hasStory: true, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
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
            {posts.map((post) => (
              <SodiaPostCard
                key={post.id}
                post={post}
                profileAvatar={profile.avatar_url}
                isLiked={likedPosts[post.id] ?? false}
                isSaved={savedPosts[post.id] ?? false}
                isShared={sharedPosts[post.id] ?? false}
                onToggleLike={toggleLike}
                onToggleSave={toggleSave}
                onShare={handleShare}
                onOpenComments={onOpenComments}
                onPressFacilityCTA={onPressFacilityCTA}
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
  storyRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, padding: 2, alignItems: "center", justifyContent: "center", position: "relative" },
  storyRingActive: { borderColor: "#E11D48" },
  storyAvatar: { width: "100%", height: "100%", borderRadius: 28 },
  storyAddBadge: { position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center", borderWidth: 2 },
  storyLabel: { fontSize: 11, fontWeight: "600", marginTop: 5, textAlign: "center" },
  feedList: { gap: 18, marginTop: 12 },
});
