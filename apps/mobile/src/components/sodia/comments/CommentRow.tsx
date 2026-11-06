import React, { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Heart, Pin } from "lucide-react-native";
import { MIN_TOUCH_TARGET } from "sodia-core";
import { useColors } from "../../../theme/theme";

export interface SodiaComment {
  readonly id: string;
  readonly author: string;
  readonly avatar: string;
  readonly text: string;
  readonly time: string;
  readonly likes: number;
  readonly isLiked: boolean;
  readonly isPinned: boolean;
}

interface CommentRowProps {
  comment: SodiaComment;
  onToggleLike: (id: string) => void;
  onReply: (author: string) => void;
}

function CommentRowImpl({ comment: c, onToggleLike, onReply }: CommentRowProps) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Image source={{ uri: c.avatar }} style={styles.avatar} />
      <View style={styles.body}>
        {c.isPinned && (
          <View style={styles.pinned}>
            <Pin size={11} color={colors.warning} />
            <Text style={[styles.pinnedText, { color: colors.warning }]}>Pinned by author</Text>
          </View>
        )}
        <View style={styles.authorRow}>
          <Text style={[styles.author, { color: colors.textPrimary }]}>{c.author}</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>{c.time}</Text>
        </View>
        <Text style={[styles.text, { color: colors.textSecondary }]}>{c.text}</Text>
        <TouchableOpacity onPress={() => onReply(c.author)} style={styles.reply} accessibilityRole="button" accessibilityLabel={`Reply to ${c.author}`}>
          <Text style={[styles.replyText, { color: colors.textMuted }]}>Reply</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => onToggleLike(c.id)}
        style={styles.like}
        accessibilityRole="button"
        accessibilityLabel={`Like comment, ${c.likes} likes`}
        accessibilityState={{ selected: c.isLiked }}
      >
        <Heart size={16} color={c.isLiked ? colors.accent : colors.textMuted} fill={c.isLiked ? colors.accent : "none"} />
        {c.likes > 0 && <Text style={[styles.likeCount, { color: c.isLiked ? colors.accentText : colors.textMuted }]}>{c.likes}</Text>}
      </TouchableOpacity>
    </View>
  );
}

export const CommentRow = memo(CommentRowImpl);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 8 },
  avatar: { width: 34, height: 34, borderRadius: 17, marginTop: 2 },
  body: { flex: 1, marginLeft: 12 },
  pinned: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  pinnedText: { fontSize: 11, fontWeight: "700" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  author: { fontSize: 13, fontWeight: "700" },
  time: { fontSize: 11 },
  text: { fontSize: 14, marginTop: 3, lineHeight: 19 },
  reply: { minHeight: 32, justifyContent: "center", alignSelf: "flex-start" },
  replyText: { fontSize: 12, fontWeight: "600" },
  like: { alignItems: "center", width: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, paddingTop: 6 },
  likeCount: { fontSize: 11, marginTop: 2, fontWeight: "600" },
});
