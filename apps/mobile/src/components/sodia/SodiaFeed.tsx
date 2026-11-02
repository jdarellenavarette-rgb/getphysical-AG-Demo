import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { Heart, MessageCircle, Bookmark, Plus, Bell, Search, MapPin, MoreHorizontal, Flame } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
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
  const { posts, profile, loadDemoData } = useEcosystemStore();
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const stories = [
    { id: "s0", name: "Your Story", isMe: true, image: profile.avatar_url },
    { id: "s1", name: "Metro Core", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80" },
    { id: "s2", name: "Nexus Club", image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=200&q=80" },
    { id: "s3", name: "Coach Miguel", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
    { id: "s4", name: "Tina Smash", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  ];

  const feedState =
    posts.length === 0
      ? createEmptyState(
          "Your community feed is quiet. Share your first workout or load demo posts.",
          "+ Share First Workout"
        )
      : createSuccessState(posts);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. TOP STREAK PILL (INSPIRATION PHOTO 1: DAILY HUSTLE) */}
      <View style={styles.streakPillRow}>
        <View style={styles.streakPill}>
          <Image source={{ uri: profile.avatar_url ?? "" }} style={styles.streakAvatar} />
          <View style={styles.streakMeta}>
            <Text style={styles.streakName}>{profile.name ?? "Adam Arête"}</Text>
            <View style={styles.streakCountRow}>
              <Flame size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.streakCountText}>Weekly Streak: 5 days</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onOpenCreatePost} style={styles.streakIconBtn}>
            <Plus size={16} color="#FAFAFA" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. ROUNDED RECTANGLE STORIES ROW (PHOTO 1) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
        {stories.map((st, idx) => (
          <TouchableOpacity
            key={st.id}
            onPress={() => (st.isMe ? onOpenCreatePost?.() : onOpenStory?.(idx - 1))}
            style={styles.storyCard}
          >
            <View style={[styles.storyBorder, st.isMe && styles.storyBorderMe]}>
              <Image source={{ uri: st.image ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }} style={styles.storyImage} />
              {st.isMe && (
                <View style={styles.storyPlusBadge}>
                  <Plus size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </View>
            <Text numberOfLines={1} style={styles.storyName}>{st.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 3. FEED CONTENT OR EMPTY STATE */}
      <TenStateView state={feedState} onRetry={onOpenCreatePost}>
        {() => (
          <View style={styles.postsList}>
            {posts.map((post) => {
              const liked = likedPosts[post.id] ?? false;
              const facTag = post.facility_tag && typeof post.facility_tag === "object" && !Array.isArray(post.facility_tag)
                ? (post.facility_tag as Record<string, string | number>)
                : null;
              const likes = post.likes_count ?? 0;
              const comments = post.comments_count ?? 0;

              return (
                <View key={post.id} style={styles.postCard}>
                  {/* POST HEADER */}
                  <View style={styles.postHeader}>
                    <Image source={{ uri: post.author_avatar ?? profile.avatar_url ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }} style={styles.authorAvatar} />
                    <View style={styles.authorMeta}>
                      <Text style={styles.authorName}>{post.author_name}</Text>
                      <Text style={styles.postTime}>Posted 2h ago</Text>
                    </View>
                    <TouchableOpacity style={styles.meatballBtn}>
                      <MoreHorizontal size={18} color="#71717A" />
                    </TouchableOpacity>
                  </View>

                  {/* MEDIA IMAGE */}
                  <Image source={{ uri: post.media_url ?? "" }} style={styles.postMedia} resizeMode="cover" />

                  {/* VENUE AFFILIATION TAG */}
                  {facTag && (
                    <TouchableOpacity
                      onPress={() => onPressFacilityCTA?.(String(facTag.id ?? ""))}
                      style={styles.venueTagBox}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <MapPin size={12} color="#10B981" />
                        <Text style={styles.venueTagName}>@{facTag.name}</Text>
                      </View>
                      <Text style={styles.venueTagCta}>{facTag.actionCTA} • ₱{facTag.price}</Text>
                    </TouchableOpacity>
                  )}

                  {/* CAPTION */}
                  <Text style={styles.postCaption}>{post.content}</Text>

                  {/* REACTION CAPSULE PILLS (INSPIRATION PHOTO 1) */}
                  <View style={styles.reactionsRow}>
                    <TouchableOpacity onPress={() => toggleLike(post.id)} style={[styles.reactionPill, liked && styles.reactionPillLiked]}>
                      <Heart size={15} color={liked ? "#E11D48" : "#71717A"} fill={liked ? "#E11D48" : "none"} />
                      <Text style={[styles.reactionCount, liked && { color: "#E11D48" }]}>{liked ? likes + 1 : likes}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onOpenComments} style={styles.reactionPill}>
                      <MessageCircle size={15} color="#71717A" />
                      <Text style={styles.reactionCount}>{comments}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.reactionPill}>
                      <Bookmark size={15} color="#71717A" />
                      <Text style={styles.reactionCount}>99</Text>
                    </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: "#09090B" },
  contentContainer: { paddingBottom: 110 },
  streakPillRow: { paddingHorizontal: 16, paddingTop: 6, marginBottom: 14 },
  streakPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#18181B", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "#27272A" },
  streakAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: "#E11D48" },
  streakMeta: { flex: 1, marginLeft: 10 },
  streakName: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
  streakCountRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  streakCountText: { color: "#F59E0B", fontSize: 11, fontWeight: "700" },
  streakIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#27272A", alignItems: "center", justifyContent: "center" },
  storiesScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 14 },
  storyCard: { alignItems: "center", width: 68 },
  storyBorder: { width: 64, height: 86, borderRadius: 16, borderWidth: 2, borderColor: "rgba(225, 29, 72, 0.6)", padding: 2, position: "relative" },
  storyBorderMe: { borderColor: "#27272A", borderStyle: "dashed" },
  storyImage: { width: "100%", height: "100%", borderRadius: 12 },
  storyPlusBadge: { position: "absolute", bottom: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#09090B" },
  storyName: { color: "#FAFAFA", fontSize: 10, fontWeight: "600", marginTop: 4, textAlign: "center" },
  postsList: { paddingHorizontal: 16, gap: 16 },
  postCard: { backgroundColor: "#FFFFFF", borderRadius: 24, overflow: "hidden", paddingBottom: 14 },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  authorAvatar: { width: 38, height: 38, borderRadius: 19 },
  authorMeta: { flex: 1, marginLeft: 10 },
  authorName: { color: "#09090B", fontSize: 14, fontWeight: "800" },
  postTime: { color: "#71717A", fontSize: 11 },
  meatballBtn: { padding: 4 },
  postMedia: { width: "100%", height: 220, backgroundColor: "#18181B" },
  venueTagBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F4F4F5", marginHorizontal: 12, marginTop: 10, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  venueTagName: { color: "#09090B", fontSize: 11, fontWeight: "800" },
  venueTagCta: { color: "#E11D48", fontSize: 11, fontWeight: "700" },
  postCaption: { color: "#18181B", fontSize: 13, lineHeight: 18, paddingHorizontal: 14, marginTop: 10 },
  reactionsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 12, marginTop: 12 },
  reactionPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F4F4F5", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  reactionPillLiked: { backgroundColor: "rgba(225, 29, 72, 0.1)" },
  reactionCount: { color: "#18181B", fontSize: 12, fontWeight: "700" },
});