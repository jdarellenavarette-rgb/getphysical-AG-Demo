import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { Heart, MessageCircle, Bookmark, Plus, MapPin, MoreHorizontal, Flame, CheckCircle2, Send } from "lucide-react-native";
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
  const { posts, profile } = useEcosystemStore();
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
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
      {/* 1. TOP ATHLETE STREAK BAR */}
      <View style={styles.streakRow}>
        <View style={styles.streakCard}>
          <Image source={{ uri: profile.avatar_url ?? "" }} style={styles.streakAvatar} />
          <View style={styles.streakMeta}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.streakName}>{profile.name ?? "Adam Arête"}</Text>
              <CheckCircle2 size={13} color="#38BDF8" fill="#38BDF8" />
            </View>
            <View style={styles.streakBadgeRow}>
              <Flame size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.streakBadgeText}>5-DAY STREAK • 3/3 WEEKLY GOAL MET</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onOpenCreatePost} style={styles.streakActionBtn}>
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. GRADIENT-RING STORIES BAR (META GRADE) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesContainer}>
        {stories.map((st, idx) => (
          <TouchableOpacity
            key={st.id}
            onPress={() => (st.isMe ? onOpenCreatePost?.() : onOpenStory?.(idx - 1))}
            style={styles.storyItem}
          >
            <View style={[styles.storyRing, st.isMe && styles.storyRingMe]}>
              <Image
                source={{ uri: st.image ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }}
                style={styles.storyThumb}
              />
              {st.isMe && (
                <View style={styles.storyAddIcon}>
                  <Plus size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </View>
            <Text numberOfLines={1} style={styles.storyLabel}>{st.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 3. FEED POSTS */}
      <TenStateView state={feedState} onRetry={onOpenCreatePost}>
        {() => (
          <View style={styles.feedList}>
            {posts.map((post) => {
              const isLiked = likedPosts[post.id] ?? false;
              const isSaved = savedPosts[post.id] ?? false;
              const facTag = post.facility_tag && typeof post.facility_tag === "object" && !Array.isArray(post.facility_tag)
                ? (post.facility_tag as Record<string, string | number>)
                : null;
              const likes = (post.likes_count ?? 0) + (isLiked ? 1 : 0);

              return (
                <View key={post.id} style={styles.postCard}>
                  {/* AUTHOR ROW */}
                  <View style={styles.postTopBar}>
                    <Image
                      source={{ uri: post.author_avatar ?? profile.avatar_url ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }}
                      style={styles.postAvatar}
                    />
                    <View style={styles.postAuthorInfo}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <Text style={styles.postAuthorName}>{post.author_name}</Text>
                        <CheckCircle2 size={12} color="#38BDF8" fill="#38BDF8" />
                      </View>
                      <Text style={styles.postSubtitle}>BGC Athlete • 2h ago</Text>
                    </View>
                    <TouchableOpacity style={styles.moreBtn}>
                      <MoreHorizontal size={18} color="#71717A" />
                    </TouchableOpacity>
                  </View>

                  {/* POST MEDIA */}
                  <View style={styles.mediaContainer}>
                    <Image source={{ uri: post.media_url ?? "" }} style={styles.mediaPhoto} resizeMode="cover" />
                    {facTag && (
                      <TouchableOpacity
                        onPress={() => onPressFacilityCTA?.(String(facTag.id ?? ""))}
                        style={styles.venueFloatingPill}
                      >
                        <MapPin size={12} color="#10B981" />
                        <Text style={styles.venueFloatingName}>@{facTag.name}</Text>
                        <View style={styles.venuePillCta}>
                          <Text style={styles.venuePillCtaText}>{facTag.actionCTA} • ₱{facTag.price}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* REACTION BAR & CAPTION */}
                  <View style={styles.postFooter}>
                    <View style={styles.interactionRow}>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity onPress={() => toggleLike(post.id)} style={[styles.reactionCapsule, isLiked && styles.reactionCapsuleLiked]}>
                          <Heart size={16} color={isLiked ? "#E11D48" : "#27272A"} fill={isLiked ? "#E11D48" : "none"} />
                          <Text style={[styles.reactionText, isLiked && { color: "#E11D48" }]}>{likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onOpenComments} style={styles.reactionCapsule}>
                          <MessageCircle size={16} color="#27272A" />
                          <Text style={styles.reactionText}>{post.comments_count ?? 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.reactionCapsule}>
                          <Send size={15} color="#27272A" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity onPress={() => toggleSave(post.id)} style={styles.reactionCapsule}>
                        <Bookmark size={16} color={isSaved ? "#F59E0B" : "#27272A"} fill={isSaved ? "#F59E0B" : "none"} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.captionBody}>
                      <Text style={styles.captionAuthor}>{post.author_name} </Text>
                      {post.content}
                    </Text>
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
  streakRow: { paddingHorizontal: 16, paddingTop: 4, marginBottom: 12 },
  streakCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#141418", borderRadius: 16, padding: 10, borderWidth: 1, borderColor: "#27272A" },
  streakAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: "#E11D48" },
  streakMeta: { flex: 1, marginLeft: 10 },
  streakName: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
  streakBadgeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  streakBadgeText: { color: "#F59E0B", fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  streakActionBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center" },
  storiesContainer: { paddingHorizontal: 16, gap: 12, paddingBottom: 14 },
  storyItem: { alignItems: "center", width: 68 },
  storyRing: { width: 64, height: 86, borderRadius: 16, borderWidth: 2, borderColor: "#E11D48", padding: 2, position: "relative" },
  storyRingMe: { borderColor: "#3F3F46", borderStyle: "dashed" },
  storyThumb: { width: "100%", height: "100%", borderRadius: 12 },
  storyAddIcon: { position: "absolute", bottom: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#09090B" },
  storyLabel: { color: "#A1A1AA", fontSize: 10, fontWeight: "600", marginTop: 4, textAlign: "center" },
  feedList: { paddingHorizontal: 14, gap: 16 },
  postCard: { backgroundColor: "#FFFFFF", borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 8 },
  postTopBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  postAvatar: { width: 40, height: 40, borderRadius: 20 },
  postAuthorInfo: { flex: 1, marginLeft: 10 },
  postAuthorName: { color: "#09090B", fontSize: 14, fontWeight: "800" },
  postSubtitle: { color: "#71717A", fontSize: 11, marginTop: 1 },
  moreBtn: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  mediaContainer: { position: "relative", width: "100%", height: 260, backgroundColor: "#18181B" },
  mediaPhoto: { width: "100%", height: "100%" },
  venueFloatingPill: { position: "absolute", bottom: 12, left: 12, right: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(9, 9, 11, 0.88)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)" },
  venueFloatingName: { color: "#FAFAFA", fontSize: 12, fontWeight: "800", flex: 1, marginLeft: 6 },
  venuePillCta: { backgroundColor: "#E11D48", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  venuePillCtaText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  postFooter: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14 },
  interactionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  reactionCapsule: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F4F4F5", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  reactionCapsuleLiked: { backgroundColor: "rgba(225, 29, 72, 0.12)" },
  reactionText: { color: "#09090B", fontSize: 12, fontWeight: "800" },
  captionBody: { color: "#18181B", fontSize: 13, lineHeight: 18 },
  captionAuthor: { fontWeight: "800", color: "#09090B" },
});