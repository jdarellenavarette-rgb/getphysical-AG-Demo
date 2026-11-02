import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Heart, MessageCircle, Send, Bookmark, Sparkles, Plus, Compass } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { TenStateView } from "../common/TenStateView";
import { createSuccessState, createEmptyState } from "sodia-core";

interface SodiaFeedProps {
  onPressFacilityCTA?: (facilityId: string) => void;
  onOpenCreatePost?: () => void;
  onOpenStory?: (index: number) => void;
  onOpenComments?: () => void;
  onSwitchToDiscover?: () => void;
}

export function SodiaFeed({ onOpenCreatePost, onOpenComments, onSwitchToDiscover }: SodiaFeedProps) {
  const { posts } = useEcosystemStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const feedState =
    posts.length === 0
      ? createEmptyState(
          "Your community feed is quiet. Share your first workout or explore nearby clubs.",
          "+ Share First Workout"
        )
      : createSuccessState(posts);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const activePost = posts[0];

  return (
    <TenStateView state={feedState} onRetry={onOpenCreatePost}>
      {() => (
        <View style={styles.container}>
          {/* Active Post Media */}
          <Image
            source={{ uri: activePost?.media_url ?? "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80" }}
            style={styles.fullscreenImage}
            resizeMode="cover"
          />

          <View style={styles.darkGradient} />

          {/* Right Action Rail */}
          <View style={styles.rightActionRail}>
            <TouchableOpacity onPress={toggleLike} style={styles.actionButton}>
              <Heart
                size={28}
                color={isLiked ? "#EC4899" : "#FFFFFF"}
                fill={isLiked ? "#EC4899" : "none"}
                strokeWidth={1.8}
              />
              <Text style={styles.actionLabel}>{likesCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onOpenComments} style={styles.actionButton}>
              <MessageCircle size={28} color="#FFFFFF" strokeWidth={1.8} />
              <Text style={styles.actionLabel}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Send size={26} color="#FFFFFF" strokeWidth={1.8} />
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSaved(!isSaved)} style={styles.actionButton}>
              <Bookmark
                size={26}
                color={isSaved ? "#F59E0B" : "#FFFFFF"}
                fill={isSaved ? "#F59E0B" : "none"}
                strokeWidth={1.8}
              />
              <Text style={styles.actionLabel}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Creator Overlay */}
          <View style={styles.creatorOverlay}>
            <View style={styles.creatorHeader}>
              <Image
                source={{ uri: activePost?.author_avatar ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }}
                style={styles.creatorAvatar}
              />
              <View>
                <Text style={styles.creatorName}>{activePost?.author_name ?? "Athlete"}</Text>
                <Text style={styles.creatorHandle}>@{activePost?.author_role ?? "athlete"}</Text>
              </View>
            </View>
            <Text style={styles.captionText}>{activePost?.content}</Text>
          </View>
        </View>
      )}
    </TenStateView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000", position: "relative" },
  fullscreenImage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  darkGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" },
  rightActionRail: { position: "absolute", right: 14, bottom: 90, alignItems: "center", gap: 16, zIndex: 30 },
  actionButton: { alignItems: "center", gap: 2 },
  actionLabel: { fontSize: 11, fontWeight: "700", color: "#FFFFFF", textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  creatorOverlay: { position: "absolute", left: 16, right: 70, bottom: 75, zIndex: 30 },
  creatorHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  creatorAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "rgba(255,255,255,0.7)" },
  creatorName: { fontSize: 16, fontWeight: "900", color: "#FFFFFF", letterSpacing: -0.3 },
  creatorHandle: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 },
  captionText: { fontSize: 13, color: "rgba(255,255,255,0.95)", lineHeight: 18 },
});
