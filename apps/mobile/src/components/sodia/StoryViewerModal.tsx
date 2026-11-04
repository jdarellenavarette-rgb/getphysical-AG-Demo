import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Camera, Heart, MessageCircle, Send, CheckCircle2, Sparkles } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface StoryViewerModalProps {
  visible: boolean;
  onClose: () => void;
  onTapLocationTag?: (facilityId: string) => void;
  onOpenComments?: () => void;
  onOpenCreatePost?: () => void;
}

export function StoryViewerModal({ visible, onClose, onTapLocationTag, onOpenComments, onOpenCreatePost }: StoryViewerModalProps) {
  const insets = useSafeAreaInsets();
  const { userStory, profile } = useEcosystemStore();
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");

  const defaultStories = [
    {
      id: "story_1",
      handle: "@miguel_cpt",
      name: "Miguel Ramos",
      mediaUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
      caption: "Heavy deadlift triples at Metro Core. Peak week prep underway! 🏋️‍♂️💪",
      locationTag: { id: "fac_metro_core", name: "Metro Core Arena" },
    },
    {
      id: "story_2",
      handle: "@alexeala",
      name: "Alex Eala",
      mediaUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&q=80",
      caption: "Grinding on the clay today! 🔥 Always striving for that next shot.",
      locationTag: { id: "fac_nexus_club", name: "Nexus Court Club" },
    },
  ];

  const stories = userStory
    ? [{ id: "user_story", handle: `@${profile.username}`, name: `${profile.first_name} ${profile.last_name}`, mediaUrl: userStory.image, caption: userStory.text ?? "Live session in BGC ⚡", locationTag: { id: "fac_metro_core", name: "Metro Core Arena" } }, ...defaultStories]
    : defaultStories;

  const current = stories[activeStoryIdx] ?? stories[0]!;

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIdx < stories.length - 1) {
            setActiveStoryIdx((i) => i + 1);
            return 0;
          } else {
            onClose();
            return 0;
          }
        }
        return prev + 4;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [visible, activeStoryIdx, stories.length, onClose]);

  const handleNext = () => {
    if (activeStoryIdx < stories.length - 1) {
      setActiveStoryIdx((i) => i + 1);
      setProgress(0);
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

  const handleSendReaction = (emoji: string) => {
    Alert.alert("Reaction Sent", `Sent ${emoji} to ${current.name}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Image source={{ uri: current.mediaUrl }} style={styles.bgMedia} resizeMode="cover" />
        <View style={styles.darkGradientOverlay} />

        {/* TAP ZONES */}
        <TouchableOpacity onPress={handlePrev} style={styles.leftTapZone} />
        <TouchableOpacity onPress={handleNext} style={styles.rightTapZone} />

        {/* SEGMENTED PROGRESS BARS */}
        <View style={[styles.progressRow, { paddingTop: Math.max(insets.top, 48) + 6 }]}>
          {stories.map((s, i) => (
            <View key={s.id} style={styles.segmentTrack}>
              <View style={[styles.segmentFill, { width: i < activeStoryIdx ? "100%" : i === activeStoryIdx ? `${progress}%` : "0%" }]} />
            </View>
          ))}
        </View>

        {/* STORY HEADER (USER INFO & CLOSE) */}
        <View style={styles.topBar}>
          <View style={styles.authorRow}>
            <Text style={styles.handleText}>{current.name}</Text>
            <CheckCircle2 size={13} color="#38BDF8" fill="#38BDF8" />
            <Text style={styles.timeAgo}>3h ago</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.topIconBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* CAPTION & LOCATION PILL */}
        <View style={styles.storyContentZone}>
          {current.locationTag && (
            <TouchableOpacity onPress={() => onTapLocationTag?.(current.locationTag.id)} style={styles.locationPill}>
              <Sparkles size={11} color="#10B981" />
              <Text style={styles.locationText}>@{current.locationTag.name}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.captionText}>{current.caption}</Text>
        </View>

        {/* INSTAGRAM-STYLE STORY REPLY BAR */}
        <View style={[styles.bottomReplyBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.replyInputWrap}>
            <TextInput
              style={styles.replyInput}
              placeholder={`Send message to ${current.name}...`}
              placeholderTextColor="#A1A1AA"
              value={replyText}
              onChangeText={setReplyText}
              onSubmitEditing={() => {
                if (replyText.trim()) {
                  Alert.alert("Message Sent", `Delivered to ${current.name}'s inbox.`);
                  setReplyText("");
                }
              }}
            />
          </View>
          <View style={styles.quickEmojisRow}>
            {["🔥", "💪", "👏", "❤️"].map((emo) => (
              <TouchableOpacity key={emo} onPress={() => handleSendReaction(emo)} style={styles.emojiBtn}>
                <Text style={styles.emojiText}>{emo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#000000", position: "relative" },
  bgMedia: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  darkGradientOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" },
  leftTapZone: { position: "absolute", left: 0, top: 100, bottom: 120, width: "35%", zIndex: 10 },
  rightTapZone: { position: "absolute", right: 0, top: 100, bottom: 120, width: "65%", zIndex: 10 },
  progressRow: { flexDirection: "row", paddingHorizontal: 12, gap: 5, zIndex: 20 },
  segmentTrack: { flex: 1, height: 2.5, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" },
  segmentFill: { height: "100%", backgroundColor: "#FFFFFF" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 10, zIndex: 20 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  handleText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  timeAgo: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginLeft: 4 },
  topIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  storyContentZone: { position: "absolute", bottom: 95, left: 16, right: 16, zIndex: 20 },
  locationPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(9,9,11,0.75)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  locationText: { color: "#FAFAFA", fontSize: 11, fontWeight: "800" },
  captionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", lineHeight: 20, textShadowColor: "#000", textShadowRadius: 4 },
  bottomReplyBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10, zIndex: 25 },
  replyInputWrap: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: 14 },
  replyInput: { color: "#FAFAFA", fontSize: 13 },
  quickEmojisRow: { flexDirection: "row", gap: 8 },
  emojiBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  emojiText: { fontSize: 16 },
});
