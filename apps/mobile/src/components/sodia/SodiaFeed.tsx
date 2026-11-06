import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Users } from "lucide-react-native";
import type { SodiaPostRow } from "sodia-core";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useColors } from "../../theme/theme";
import { TenStateView } from "../common/TenStateView";
import { SkeletonList } from "../states/Skeleton";
import { SodiaPostCard } from "./SodiaPostCard";
import { StoriesTray, type StoryBubble } from "./feed/StoriesTray";
import { useFeedQuery } from "../../hooks/useFeedQuery";
import { haptics } from "../../lib/haptics";
import { toast } from "../../feedback/toastStore";

interface SodiaFeedProps {
  onPressFacilityCTA?: (facilityId: string) => void;
  onOpenCreatePost?: () => void;
  onOpenStoryCamera?: () => void;
  onOpenStory?: (index: number) => void;
  onOpenComments?: (postId?: string) => void;
  onPressAuthor?: (userId: string, name: string, avatar?: string | null) => void;
}

const FOLLOWED_STORIES: readonly StoryBubble[] = [
  { id: "s1", name: "Metro Core", hasStory: true, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80" },
  { id: "s2", name: "Nexus Club", hasStory: true, image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=200&q=80" },
  { id: "s3", name: "Coach Miguel", hasStory: true, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { id: "s4", name: "Coach Sofia", hasStory: true, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
];

type FlagMap = Readonly<Record<string, boolean>>;

export function SodiaFeed({ onPressFacilityCTA, onOpenCreatePost, onOpenStoryCamera, onOpenStory, onOpenComments, onPressAuthor }: SodiaFeedProps) {
  const profileAvatar = useEcosystemStore((s) => s.profile.avatar_url);
  const userStory = useEcosystemStore((s) => s.userStory);
  const colors = useColors();
  const { state, refetch, isRefetching } = useFeedQuery();
  const [liked, setLiked] = useState<FlagMap>({});
  const [saved, setSaved] = useState<FlagMap>({});
  const [shared, setShared] = useState<FlagMap>({});

  // Optimistic local toggles; counts derive from these immediately.
  const toggleLike = useCallback((id: string) => {
    haptics.light();
    setLiked((p) => ({ ...p, [id]: !p[id] }));
  }, []);
  const like = useCallback((id: string) => {
    haptics.light();
    setLiked((p) => (p[id] ? p : { ...p, [id]: true }));
  }, []);
  const toggleSave = useCallback((id: string) => {
    setSaved((p) => {
      const next = !p[id];
      toast.show({ tone: "info", title: next ? "Saved to collection" : "Removed from saved", durationMs: 1800 });
      return { ...p, [id]: next };
    });
  }, []);
  const share = useCallback((id: string) => {
    setShared((p) => ({ ...p, [id]: true }));
    toast.show({
      tone: "success",
      title: "Shared to direct message",
      action: { label: "Undo", onPress: () => setShared((p) => ({ ...p, [id]: false })) },
    });
  }, []);

  const stories = useMemo<readonly StoryBubble[]>(
    () => [{ id: "s0", name: "Your Story", isMe: true, hasStory: !!userStory, image: profileAvatar }, ...FOLLOWED_STORIES],
    [userStory, profileAvatar]
  );

  const header = (
    <StoriesTray stories={stories} onOpenStory={(i) => onOpenStory?.(i)} onOpenCamera={() => onOpenStoryCamera?.()} />
  );

  const onRefresh = useCallback(() => {
    haptics.selection();
    refetch().catch(() => undefined);
  }, [refetch]);

  const renderPost = ({ item }: { item: SodiaPostRow }) => (
    <SodiaPostCard
      post={item}
      profileAvatar={profileAvatar}
      isLiked={liked[item.id] ?? false}
      isSaved={saved[item.id] ?? false}
      isShared={shared[item.id] ?? false}
      onToggleLike={toggleLike}
      onLike={like}
      onToggleSave={toggleSave}
      onShare={share}
      onOpenComments={onOpenComments}
      onPressFacilityCTA={onPressFacilityCTA}
      onPressAuthor={onPressAuthor}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <TenStateView
        state={state}
        skeleton={() => (
          <View>
            {header}
            <SkeletonList variant="post" count={2} />
          </View>
        )}
        emptyIcon={Users}
        emptyTitle="Welcome to Sodia"
        onPrimaryAction={onOpenCreatePost}
        onRetry={onRefresh}
      >
        {(posts) => (
          <FlashList
            data={posts}
            keyExtractor={(p) => p.id}
            renderItem={renderPost}
            ListHeaderComponent={header}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            extraData={{ liked, saved, shared }}
            getItemType={(p) => (p.media_url ? "media" : "status")}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
          />
        )}
      </TenStateView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 110 },
  sep: { height: 14 },
});
