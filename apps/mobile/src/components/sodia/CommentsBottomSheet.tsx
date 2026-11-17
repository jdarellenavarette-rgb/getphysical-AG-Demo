import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Heart } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { useFeedStore } from "../../store/feedStore";
import { formatTimeAgo } from "../../services/messagingService";
import { SODIA_FIELD_LIMITS } from "sodia-core";

interface CommentsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** The post whose comments are shown. */
  postId: string | null;
}

export function CommentsBottomSheet({ visible, onClose, postId }: CommentsBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { profile } = useEcosystemStore();
  const { colors } = useThemeStore();
  const { commentsByPost, addComment, toggleCommentLike } = useFeedStore();
  const [commentText, setCommentText] = useState("");
  const comments = postId ? (commentsByPost[postId] ?? []) : [];

  const handlePost = () => {
    const text = commentText.trim();
    if (!text || !postId) return;
    addComment(postId, {
      author: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
      avatar: profile.avatar_url ?? "",
      text,
    });
    setCommentText("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderColor,
              borderWidth: 1,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* HEADER */}
          <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
            <View style={[styles.dragPill, { backgroundColor: colors.borderColor }]} />
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Comments ({comments.length})</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Close comments"
              >
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* COMMENTS LIST */}
          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {comments.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No comments yet. Be the first.</Text>
            )}
            {comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <Image source={{ uri: c.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentBody}>
                  <View style={styles.authorRow}>
                    <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>{c.author}</Text>
                    <Text style={[styles.commentTime, { color: colors.textMuted }]}>{formatTimeAgo(c.createdAt)}</Text>
                  </View>
                  <Text style={[styles.commentText, { color: colors.textSecondary }]}>{c.text}</Text>
                  <TouchableOpacity onPress={() => setCommentText(`@${c.author} `)} style={styles.replyTrigger}>
                    <Text style={[styles.replyText, { color: colors.textMuted }]}>Reply</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => postId && toggleCommentLike(postId, c.id)}
                  style={styles.likeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel={c.isLiked ? "Unlike comment" : "Like comment"}
                >
                  <Heart
                    size={14}
                    color={c.isLiked ? "#E11D48" : colors.textMuted}
                    fill={c.isLiked ? "#E11D48" : "none"}
                  />
                  {c.likes > 0 && (
                    <Text style={[styles.likeCount, { color: colors.textMuted }, c.isLiked && styles.likeCountActive]}>
                      {c.likes}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* EMOJI SHORTCUT STRIP */}
          <View style={[styles.emojiRow, { borderTopColor: colors.borderColor }]}>
            {["🔥", "💪", "👏", "❤️", "⚡"].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => setCommentText((prev) => prev + emoji)}
                style={styles.emojiBtn}
              >
                <Text style={styles.emojiChar}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* INPUT BAR */}
          <View style={styles.inputBar}>
            <Image source={{ uri: profile.avatar_url ?? "" }} style={styles.inputAvatar} />
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.bgInput, color: colors.textPrimary }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={handlePost}
              returnKeyType="send"
              maxLength={SODIA_FIELD_LIMITS.COMMENT_MAX_CHARS}
              accessibilityLabel="Comment"
            />
            {commentText.trim().length > 0 && (
              <TouchableOpacity onPress={handlePost} style={styles.postBtn}>
                <Text style={styles.postBtnText}>Post</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheetContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "75%", paddingBottom: 20 },
  header: { alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  dragPill: { width: 36, height: 4, borderRadius: 2, marginBottom: 10 },
  titleRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: { fontSize: 14, fontWeight: "800" },
  closeBtn: { padding: 4 },
  commentsList: { padding: 16 },
  emptyText: { textAlign: "center", fontSize: 13, paddingVertical: 24 },
  commentItem: { flexDirection: "row", marginBottom: 16, alignItems: "flex-start" },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, marginTop: 2 },
  commentBody: { flex: 1, marginLeft: 12 },
  pinnedRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  pinnedText: { color: "#F59E0B", fontSize: 10, fontWeight: "700" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentAuthor: { fontSize: 13, fontWeight: "700" },
  commentTime: { fontSize: 11 },
  commentText: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  replyTrigger: { marginTop: 4 },
  replyText: { fontSize: 11, fontWeight: "600" },
  likeBtn: { alignItems: "center", paddingHorizontal: 6, paddingTop: 6 },
  likeCount: { fontSize: 10, marginTop: 2, fontWeight: "600" },
  likeCountActive: { color: "#E11D48" },
  emojiRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 8, borderTopWidth: 1 },
  emojiBtn: { padding: 6 },
  emojiChar: { fontSize: 18 },
  inputBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 6, gap: 10 },
  inputAvatar: { width: 32, height: 32, borderRadius: 16 },
  textInput: { flex: 1, height: 38, borderRadius: 19, paddingHorizontal: 14, fontSize: 13 },
  postBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  postBtnText: { color: "#E11D48", fontSize: 13, fontWeight: "800" },
});
