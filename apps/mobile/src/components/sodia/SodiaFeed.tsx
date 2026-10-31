import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Heart, MessageCircle, Repeat2, Share2, Plus, Sparkles, MapPin } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import type { SodiaPostRow } from "sodia-core";

interface SodiaFeedProps {
  onPressFacilityCTA?: (facilityId: string) => void;
  onOpenCreatePost?: () => void;
  onOpenStory?: () => void;
  onOpenComments?: (postId: string) => void;
}

export function SodiaFeed({
  onPressFacilityCTA,
  onOpenCreatePost,
  onOpenStory,
  onOpenComments,
}: SodiaFeedProps) {
  const { posts, profile } = useEcosystemStore();

  const renderHeader = () => (
    <View style={styles.storiesContainer}>
      <TouchableOpacity onPress={onOpenCreatePost} style={styles.storyAvatarWrap}>
        <View style={styles.myStoryCircle}>
          <Image source={{ uri: profile.avatar_url ?? "" }} style={styles.storyImg} />
          <View style={styles.addStoryBadge}>
            <Plus size={12} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.storyLabel}>Your Story</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onOpenStory} style={styles.storyAvatarWrap}>
        <View style={[styles.storyCircle, styles.unseenBorder]}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80" }}
            style={styles.storyImg}
          />
        </View>
        <Text style={styles.storyLabel}>Metro Core</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onOpenStory} style={styles.storyAvatarWrap}>
        <View style={[styles.storyCircle, styles.seenBorder]}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" }}
            style={styles.storyImg}
          />
        </View>
        <Text style={styles.storyLabel}>Coach Ramos</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPost = ({ item }: { item: SodiaPostRow }) => {
    const isDiscovery = item.id.includes("discovery");
    const facilityTag =
      item.facility_tag &&
      typeof item.facility_tag === "object" &&
      !Array.isArray(item.facility_tag)
        ? (item.facility_tag as {
            id?: string;
            name?: string;
            actionCTA?: string;
            price?: number;
          })
        : null;
    return (
      <View style={styles.postCard}>
        {isDiscovery && (
          <View style={styles.discoveryHeader}>
            <Sparkles size={12} color="#F59E0B" />
            <Text style={styles.discoveryText}>SUGGESTED BY WRE ALGORITHM</Text>
          </View>
        )}

        <View style={styles.postHeader}>
          <Image source={{ uri: item.author_avatar ?? "" }} style={styles.authorAvatar} />
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{item.author_name}</Text>
            {facilityTag?.name && (
              <View style={styles.locationRow}>
                <MapPin size={11} color="#A1A1AA" />
                <Text style={styles.facilityTagText}>{facilityTag.name}</Text>
              </View>
            )}
          </View>

          {facilityTag && (
            <TouchableOpacity
              onPress={() => onPressFacilityCTA?.(facilityTag.id ?? "")}
              style={styles.ctaPill}
            >
              <Text style={styles.ctaPillText}>{facilityTag.actionCTA ?? "Drop In"} • ₱{facilityTag.price ?? 250}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Image source={{ uri: item.media_url ?? "" }} style={styles.postMedia} />

        <View style={styles.postBody}>
          <Text style={styles.postCaption}>{item.content}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionItem}>
              <Heart size={18} color="#FAFAFA" />
              <Text style={styles.actionCount}>{item.likes_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onOpenComments?.(item.id)}
              style={styles.actionItem}
            >
              <MessageCircle size={18} color="#FAFAFA" />
              <Text style={styles.actionCount}>{item.comments_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Repeat2 size={18} color="#FAFAFA" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Share2 size={18} color="#FAFAFA" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={posts}
        renderItem={renderPost}
        estimatedItemSize={360}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  storiesContainer: { flexDirection: "row", padding: 12, borderBottomWidth: 1, borderBottomColor: "#18181B", gap: 14 },
  storyAvatarWrap: { alignItems: "center", width: 68 },
  myStoryCircle: { width: 56, height: 56, borderRadius: 28, position: "relative" },
  storyCircle: { width: 56, height: 56, borderRadius: 28, padding: 2, borderWidth: 2 },
  unseenBorder: { borderColor: "#E11D48" },
  seenBorder: { borderColor: "#27272A" },
  storyImg: { width: "100%", height: "100%", borderRadius: 26 },
  addStoryBadge: { position: "absolute", bottom: -2, right: -2, backgroundColor: "#E11D48", borderRadius: 10, width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  storyLabel: { color: "#A1A1AA", fontSize: 10, marginTop: 4, fontWeight: "600" },
  postCard: { marginBottom: 16, backgroundColor: "#121215", borderBottomWidth: 1, borderBottomColor: "#18181B" },
  discoveryHeader: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(245, 158, 11, 0.12)", paddingHorizontal: 16, paddingVertical: 6 },
  discoveryText: { color: "#F59E0B", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20 },
  authorMeta: { flex: 1, marginLeft: 10 },
  authorName: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  facilityTagText: { color: "#A1A1AA", fontSize: 11 },
  ctaPill: { backgroundColor: "#E11D48", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  ctaPillText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  postMedia: { width: "100%", height: 260, backgroundColor: "#18181B" },
  postBody: { padding: 12 },
  postCaption: { color: "#FAFAFA", fontSize: 13, lineHeight: 18 },
  actionRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 18 },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionCount: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
});
