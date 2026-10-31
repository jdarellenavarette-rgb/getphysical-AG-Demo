import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Modal, ScrollView } from "react-native";
import { X, Heart, Pin, Send } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface CommentsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  postId?: string;
}

export function CommentsBottomSheet({ visible, onClose, postId }: CommentsBottomSheetProps) {
  const { profile } = useEcosystemStore();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    {
      id: "c1",
      author: "Coach Miguel Ramos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      text: "Textbook hip hinge on that final rep. Rest up for the Saturday ladder!",
      time: "2h ago",
      likes: 12,
      isLiked: false,
      isPinned: true,
    },
    {
      id: "c2",
      author: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      text: "Insane pull! Which rack at Metro Core was this on?",
      time: "45m ago",
      likes: 4,
      isLiked: true,
      isPinned: false,
    },
  ]);

  const handlePost = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        author: `${profile.first_name} ${profile.last_name}`,
        avatar: profile.avatar_url ?? "",
        text: commentText.trim(),
        time: "Just now",
        likes: 0,
        isLiked: false,
        isPinned: false,
      },
    ]);
    setCommentText("");
  };

  const toggleLike = (id: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 } : c
      )
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.dragPill} />
            <View style={styles.titleRow}>
              <Text style={styles.title}>Comments ({comments.length})</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#A1A1AA" />
              </TouchableOpacity>
            </View>
          </View>

          {/* COMMENTS LIST */}
          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <Image source={{ uri: c.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentBody}>
                  {c.isPinned && (
                    <View style={styles.pinnedRow}>
                      <Pin size={10} color="#F59E0B" />
                      <Text style={styles.pinnedText}>Pinned by author</Text>
                    </View>
                  )}
                  <View style={styles.authorRow}>
                    <Text style={styles.commentAuthor}>{c.author}</Text>
                    <Text style={styles.commentTime}>{c.time}</Text>
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                  <TouchableOpacity style={styles.replyTrigger}>
                    <Text style={styles.replyText}>Reply</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => toggleLike(c.id)} style={styles.likeBtn}>
                  <Heart size={14} color={c.isLiked ? "#E11D48" : "#71717A"} />
                  {c.likes > 0 && (
                    <Text style={[styles.likeCount, c.isLiked && styles.likeCountActive]}>
                      {c.likes}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* EMOJI SHORTCUT STRIP */}
          <View style={styles.emojiRow}>
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
              style={styles.textInput}
              placeholder="Add a comment for the athlete..."
              placeholderTextColor="#71717A"
              value={commentText}
              onChangeText={setCommentText}
            />
            {commentText.trim().length > 0 && (
              <TouchableOpacity onPress={handlePost} style={styles.postBtn}>
                <Text style={styles.postBtnText}>Post</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheetContainer: { backgroundColor: "#18181B", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "75%", paddingBottom: 20 },
  header: { alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#27272A" },
  dragPill: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#3F3F46", marginBottom: 10 },
  titleRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 },
  title: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  closeBtn: { padding: 4 },
  commentsList: { padding: 16 },
  commentItem: { flexDirection: "row", marginBottom: 16, alignItems: "flex-start" },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, marginTop: 2 },
  commentBody: { flex: 1, marginLeft: 12 },
  pinnedRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  pinnedText: { color: "#F59E0B", fontSize: 10, fontWeight: "700" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentAuthor: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  commentTime: { color: "#71717A", fontSize: 11 },
  commentText: { color: "#D4D4D8", fontSize: 13, marginTop: 4, lineHeight: 18 },
  replyTrigger: { marginTop: 4 },
  replyText: { color: "#71717A", fontSize: 11, fontWeight: "600" },
  likeBtn: { alignItems: "center", paddingHorizontal: 6, paddingTop: 6 },
  likeCount: { color: "#71717A", fontSize: 10, marginTop: 2, fontWeight: "600" },
  likeCountActive: { color: "#E11D48" },
  emojiRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#27272A" },
  emojiBtn: { padding: 6 },
  emojiChar: { fontSize: 18 },
  inputBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 6, gap: 10 },
  inputAvatar: { width: 32, height: 32, borderRadius: 16 },
  textInput: { flex: 1, height: 38, backgroundColor: "#27272A", borderRadius: 19, paddingHorizontal: 14, color: "#FAFAFA", fontSize: 13 },
  postBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  postBtnText: { color: "#E11D48", fontSize: 13, fontWeight: "800" },
});
