import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react-native";
import { MIN_TOUCH_TARGET, MOTION } from "sodia-core";
import { useColors } from "../../../theme/theme";

interface PostActionsProps {
  authorName: string;
  caption: string | null;
  showCaption: boolean;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isShared: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onShare: () => void;
  onOpenComments: () => void;
}

function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function PostActions(p: PostActionsProps) {
  const colors = useColors();
  const pop = useSharedValue(1);

  useEffect(() => {
    if (p.isLiked) pop.value = withSequence(withTiming(1.25, { duration: 90 }), withSpring(1, MOTION.spring));
  }, [p.isLiked, pop]);

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <View style={styles.footer}>
      <View style={styles.row}>
        <View style={styles.left}>
          <TouchableOpacity
            onPress={p.onToggleLike}
            style={styles.icon}
            accessibilityRole="button"
            accessibilityLabel="Like"
            accessibilityState={{ selected: p.isLiked }}
          >
            <Animated.View style={heartStyle}>
              <Heart size={24} color={p.isLiked ? colors.accent : colors.textPrimary} fill={p.isLiked ? colors.accent : "none"} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={p.onOpenComments} style={styles.icon} accessibilityRole="button" accessibilityLabel={`Comments, ${p.commentCount}`}>
            <MessageCircle size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={p.onShare} style={styles.icon} accessibilityRole="button" accessibilityLabel="Share to direct message" accessibilityState={{ selected: p.isShared }}>
            <Send size={22} color={p.isShared ? colors.info : colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={p.onToggleSave} style={styles.icon} accessibilityRole="button" accessibilityLabel="Save post" accessibilityState={{ selected: p.isSaved }}>
          <Bookmark size={24} color={p.isSaved ? colors.warning : colors.textPrimary} fill={p.isSaved ? colors.warning : "none"} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.likes, { color: colors.textPrimary }]} accessibilityLiveRegion="polite">
        {formatCount(p.likeCount)} {p.likeCount === 1 ? "like" : "likes"}
      </Text>
      {p.showCaption && p.caption ? (
        <Text style={[styles.caption, { color: colors.textPrimary }]}>
          <Text style={styles.captionAuthor}>{p.authorName} </Text>
          {p.caption}
        </Text>
      ) : null}
      <TouchableOpacity onPress={p.onOpenComments} style={styles.teaser} accessibilityRole="button">
        <Text style={[styles.teaserText, { color: colors.textMuted }]}>
          {p.commentCount > 0 ? `View all ${p.commentCount} comments` : "Add a comment…"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: 6, paddingBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  left: { flexDirection: "row", alignItems: "center" },
  icon: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  likes: { fontSize: 13, fontWeight: "800", marginBottom: 4, paddingHorizontal: 8, fontVariant: ["tabular-nums"] },
  caption: { fontSize: 13, lineHeight: 18, marginBottom: 2, paddingHorizontal: 8 },
  captionAuthor: { fontWeight: "800" },
  teaser: { minHeight: 32, justifyContent: "center", paddingHorizontal: 8 },
  teaserText: { fontSize: 13, fontWeight: "600" },
});
