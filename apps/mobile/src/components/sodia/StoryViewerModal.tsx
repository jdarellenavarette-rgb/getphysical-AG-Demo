import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, MapPin } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useCrmMessagingStore } from "../../store/crmMessagingStore";
import { OWN_STORY_ID, type StoryItem } from "../../lib/stories";
import { formatTimeAgo } from "../../services/messagingService";

interface StoryViewerModalProps {
  visible: boolean;
  /** Story to open on; defaults to the first one. */
  initialStoryId: string | null;
  onClose: () => void;
  onTapLocationTag?: (facilityId: string) => void;
}

const STORY_SECONDS = 5;
const TICK_MS = 100;

export function StoryViewerModal({ visible, initialStoryId, onClose, onTapLocationTag }: StoryViewerModalProps) {
  const insets = useSafeAreaInsets();
  const { userStory, profile } = useEcosystemStore();
  const { ensureThread, sendMessage } = useCrmMessagingStore();
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sentNote, setSentNote] = useState<string | null>(null);

  const stories = useMemo<StoryItem[]>(() => {
    // Other people's stories will come from the server; for now the tray holds only your own.
    if (!userStory) return [];
    const own: StoryItem = {
      id: OWN_STORY_ID,
      shortName: "Your Story",
      name: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
      avatar: profile.avatar_url ?? "",
      mediaUrl: userStory.image,
      caption: userStory.text ?? "",
      createdAt: userStory.createdAt,
    };
    return [own];
  }, [userStory, profile.first_name, profile.last_name, profile.avatar_url]);

  const current = stories[activeStoryIdx] ?? stories[0];
  const isOwn = current?.id === OWN_STORY_ID;

  // Each open starts on the story that was tapped.
  useEffect(() => {
    if (!visible) return;
    const start = stories.findIndex((s) => s.id === initialStoryId);
    setActiveStoryIdx(start >= 0 ? start : 0);
    setProgress(0);
    setReplyText("");
    setSentNote(null);
    // Only when the viewer opens; later edits to the list must not jump the story.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialStoryId]);

  // Advance the bar; paused while the viewer is typing a reply.
  useEffect(() => {
    if (!visible || isTyping) return;
    const timer = setInterval(
      () => setProgress((prev) => Math.min(100, prev + (100 * TICK_MS) / (STORY_SECONDS * 1000))),
      TICK_MS,
    );
    return () => clearInterval(timer);
  }, [visible, isTyping, activeStoryIdx]);

  useEffect(() => {
    if (!visible || progress < 100) return;
    if (activeStoryIdx < stories.length - 1) {
      setActiveStoryIdx(activeStoryIdx + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [visible, progress, activeStoryIdx, stories.length, onClose]);

  /** Replies and reactions are real direct messages to the story's author. */
  const sendToAuthor = (text: string) => {
    if (!current) return;
    const thread = ensureThread({
      id: `thread_${current.id}`,
      name: current.name,
      avatar: current.avatar,
      lastMessage: "",
      timeAgo: "",
      unreadCount: 0,
      type: "direct",
    });
    void sendMessage(thread.id, text);
    setSentNote(`Sent to ${current.name}`);
  };

  const handleReply = () => {
    const text = replyText.trim();
    if (!text) return;
    sendToAuthor(`Replied to your story: ${text}`);
    setReplyText("");
  };

  const handleNext = () => {
    if (activeStoryIdx < stories.length - 1) {
      setActiveStoryIdx((i) => i + 1);
      setProgress(0);
      setSentNote(null);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (activeStoryIdx > 0) {
      setActiveStoryIdx((i) => i - 1);
      setProgress(0);
    }
  };

  if (!current) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Image source={{ uri: current.mediaUrl }} style={styles.bgMedia} resizeMode="cover" />
        <View style={styles.darkGradientOverlay} />

        {/* TAP ZONES */}
        <TouchableOpacity onPress={handlePrev} style={styles.leftTapZone} />
        <TouchableOpacity onPress={handleNext} style={styles.rightTapZone} />

        {/* SEGMENTED PROGRESS BARS */}
        <View style={[styles.progressRow, { paddingTop: Math.max(insets.top, 48) + 6 }]}>
          {stories.map((s, i) => (
            <View key={s.id} style={styles.segmentTrack}>
              <View
                style={[
                  styles.segmentFill,
                  { width: i < activeStoryIdx ? "100%" : i === activeStoryIdx ? `${progress}%` : "0%" },
                ]}
              />
            </View>
          ))}
        </View>

        {/* STORY HEADER (USER INFO & CLOSE) */}
        <View style={styles.topBar}>
          <View style={styles.authorRow}>
            <Text style={styles.handleText}>{isOwn ? "Your story" : current.name}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(current.createdAt)}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.topIconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close story"
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* CAPTION & LOCATION PILL */}
        <View style={styles.storyContentZone}>
          {current.locationTag ? (
            <TouchableOpacity
              onPress={() => current.locationTag && onTapLocationTag?.(current.locationTag.id)}
              style={styles.locationPill}
              accessibilityRole="button"
            >
              <MapPin size={11} color="#10B981" />
              <Text style={styles.locationText}>{current.locationTag.name}</Text>
            </TouchableOpacity>
          ) : null}
          {current.caption ? <Text style={styles.captionText}>{current.caption}</Text> : null}
        </View>

        {/* REPLY BAR (not shown on your own story) */}
        {!isOwn && (
          <View style={[styles.bottomReplyBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            {sentNote ? <Text style={styles.sentNote}>{sentNote}</Text> : null}
            <View style={styles.replyInputWrap}>
              <TextInput
                style={styles.replyInput}
                placeholder={`Reply to ${current.name}...`}
                placeholderTextColor="#A1A1AA"
                value={replyText}
                onChangeText={setReplyText}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                onSubmitEditing={handleReply}
                returnKeyType="send"
                accessibilityLabel="Reply to story"
              />
            </View>
            <View style={styles.quickEmojisRow}>
              {["🔥", "💪", "👏", "❤️"].map((emo) => (
                <TouchableOpacity
                  key={emo}
                  onPress={() => sendToAuthor(emo)}
                  style={styles.emojiBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`React with ${emo}`}
                >
                  <Text style={styles.emojiText}>{emo}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sentNote: { color: "#10B981", fontSize: 12, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  overlay: { flex: 1, backgroundColor: "#000000", position: "relative" },
  bgMedia: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  darkGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  leftTapZone: { position: "absolute", left: 0, top: 100, bottom: 120, width: "35%", zIndex: 10 },
  rightTapZone: { position: "absolute", right: 0, top: 100, bottom: 120, width: "65%", zIndex: 10 },
  progressRow: { flexDirection: "row", paddingHorizontal: 12, gap: 5, zIndex: 20 },
  segmentTrack: { flex: 1, height: 2.5, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" },
  segmentFill: { height: "100%", backgroundColor: "#FFFFFF" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 20,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  handleText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  timeAgo: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginLeft: 4 },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  storyContentZone: { position: "absolute", bottom: 95, left: 16, right: 16, zIndex: 20 },
  locationPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(9,9,11,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  locationText: { color: "#FAFAFA", fontSize: 11, fontWeight: "800" },
  captionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    textShadowColor: "#000",
    textShadowRadius: 4,
  },
  bottomReplyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    zIndex: 25,
  },
  replyInputWrap: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  replyInput: { color: "#FAFAFA", fontSize: 13 },
  quickEmojisRow: { flexDirection: "row", gap: 8 },
  emojiBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: { fontSize: 16 },
});
