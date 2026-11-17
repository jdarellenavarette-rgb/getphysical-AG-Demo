import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, MapPin, Check, Video } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { SODIA_FIELD_LIMITS } from "sodia-core";
import { PostMediaAttachmentBar } from "./PostMediaAttachmentBar";
import { Avatar } from "../common/Avatar";
import { formatClipDuration, usePostMedia } from "../../hooks/usePostMedia";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenStoryCamera?: () => void;
  defaultMode?: "post" | "status";
}

const STATUS_MAX_CHARS = 200;

const BG_GRADIENTS = [
  { id: "carbon", color: "#18181B" },
  { id: "crimson", color: "#BE123C" },
  { id: "emerald", color: "#047857" },
  { id: "indigo", color: "#4338CA" },
];

export function CreatePostModal({ visible, onClose, onOpenStoryCamera, defaultMode = "post" }: CreatePostModalProps) {
  const { profile, facilities, addPost } = useEcosystemStore();
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<"post" | "status">(defaultMode);
  const [caption, setCaption] = useState("");
  const [selectedBgColor, setSelectedBgColor] = useState(BG_GRADIENTS[0]!.color);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const { media, takePhoto, recordVideo, pickFromLibrary, clear: clearMedia } = usePostMedia();

  const selectedFac = facilities.find((f) => f.id === selectedFacilityId);
  const limit = activeTab === "status" ? STATUS_MAX_CHARS : SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS;
  const remainingChars = limit - caption.length;
  const hasText = caption.trim().length > 0;
  // A status is text only; a post needs a caption or media.
  const canPublish = remainingChars >= 0 && (activeTab === "status" ? hasText : hasText || media !== null);

  const reset = () => {
    setCaption("");
    setSelectedFacilityId(null);
    setSelectedBgColor(BG_GRADIENTS[0]!.color);
    setActiveTab(defaultMode);
    clearMedia();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePublish = () => {
    if (!canPublish) return;
    const text = caption.trim();
    if (activeTab === "status") {
      addPost(text, undefined, { type: "status", bgColor: selectedBgColor }, null);
    } else if (media?.kind === "video") {
      addPost(
        text,
        selectedFacilityId ?? undefined,
        {
          type: "reel",
          videoUrl: media.uri,
          duration: formatClipDuration(media.durationSeconds),
          audioTrack: `Original Audio • ${profile.username}`,
          viewsCount: "0",
        },
        media.uri,
      );
    } else {
      addPost(text, selectedFacilityId ?? undefined, undefined, media?.uri ?? null);
    }
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.container, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelBtn} accessibilityRole="button">
              <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={[styles.modeTabs, { backgroundColor: colors.bgInput }]}>
              <TouchableOpacity
                onPress={() => setActiveTab("post")}
                style={[styles.modeTab, activeTab === "post" && { backgroundColor: colors.bgCard }]}
              >
                <Text
                  style={[styles.modeTabText, { color: activeTab === "post" ? colors.textPrimary : colors.textMuted }]}
                >
                  Post
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("status")}
                style={[styles.modeTab, activeTab === "status" && { backgroundColor: colors.bgCard }]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    { color: activeTab === "status" ? colors.textPrimary : colors.textMuted },
                  ]}
                >
                  Status
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleClose();
                  onOpenStoryCamera?.();
                }}
                style={styles.modeTab}
              >
                <Text style={[styles.modeTabText, { color: "#E11D48" }]}>Story 📷</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handlePublish}
              disabled={!canPublish}
              style={[styles.publishBtn, !canPublish && styles.publishBtnDisabled]}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canPublish }}
            >
              <Text style={styles.publishText}>Post</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.authorRow}>
              <Avatar uri={profile.avatar_url} name={profile.name} size={42} style={styles.avatar} />
              <View style={styles.authorMeta}>
                <Text style={[styles.authorName, { color: colors.textPrimary }]}>
                  {profile.first_name} {profile.last_name}
                </Text>
                <Text style={styles.privacyPill}>Public • Sodia Feed</Text>
              </View>
            </View>

            {activeTab === "post" && (
              <>
                <TextInput
                  style={[styles.captionInput, { color: colors.textPrimary }]}
                  placeholder="What did you crush today? Share lift metrics..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  value={caption}
                  onChangeText={setCaption}
                  maxLength={SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS}
                />
                <Text style={[styles.charCount, { color: remainingChars < 20 ? "#E11D48" : colors.textMuted }]}>
                  {remainingChars}
                </Text>
                {media && (
                  <View style={styles.mediaPreviewCard}>
                    {media.kind === "photo" ? (
                      <Image source={{ uri: media.uri }} style={styles.previewImage} />
                    ) : (
                      <View style={[styles.previewImage, styles.videoPlaceholder]}>
                        <Video size={28} color="#FFFFFF" />
                        <Text style={styles.videoPlaceholderText}>
                          Video attached {formatClipDuration(media.durationSeconds)}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={clearMedia}
                      style={styles.removeMediaBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                      accessibilityLabel="Remove attachment"
                    >
                      <X size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}
                <PostMediaAttachmentBar
                  onTakePhoto={() => void takePhoto()}
                  onRecordVideo={() => void recordVideo()}
                  onPickLibrary={() => void pickFromLibrary()}
                />
                {selectedFac ? (
                  <View style={styles.venueCard}>
                    <MapPin size={16} color="#E11D48" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.venueName, { color: colors.textPrimary }]}>{selectedFac.name}</Text>
                      <Text style={styles.venueSub}>Tagged venue</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedFacilityId(null)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      accessibilityRole="button"
                      accessibilityLabel="Remove venue tag"
                    >
                      <X size={15} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.venueChoices}>
                    <Text style={[styles.venueChoicesLabel, { color: colors.textMuted }]}>TAG A VENUE (OPTIONAL)</Text>
                    <View style={styles.venueChipRow}>
                      {facilities.map((fac) => (
                        <TouchableOpacity
                          key={fac.id}
                          onPress={() => setSelectedFacilityId(fac.id)}
                          style={[styles.venueChip, { borderColor: colors.borderColor }]}
                          accessibilityRole="button"
                        >
                          <MapPin size={12} color="#E11D48" />
                          <Text style={[styles.venueChipText, { color: colors.textPrimary }]}>{fac.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}

            {activeTab === "status" && (
              <View style={styles.statusBox}>
                <View style={[styles.statusCanvas, { backgroundColor: selectedBgColor }]}>
                  <TextInput
                    style={styles.statusTextInput}
                    placeholder="What's on your athletic mind?"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    multiline
                    value={caption}
                    onChangeText={setCaption}
                    maxLength={STATUS_MAX_CHARS}
                  />
                </View>
                <View style={styles.paletteRow}>
                  {BG_GRADIENTS.map((bg) => (
                    <TouchableOpacity
                      key={bg.id}
                      onPress={() => setSelectedBgColor(bg.color)}
                      style={[
                        styles.colorDot,
                        { backgroundColor: bg.color },
                        selectedBgColor === bg.color && styles.colorDotActive,
                      ]}
                    >
                      {selectedBgColor === bg.color && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "88%", padding: 18, borderWidth: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 13, fontWeight: "600" },
  modeTabs: { flexDirection: "row", borderRadius: 10, padding: 3, gap: 4 },
  modeTab: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  modeTabText: { fontSize: 12, fontWeight: "700" },
  publishBtn: { backgroundColor: "#E11D48", paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8 },
  publishBtnDisabled: { opacity: 0.5 },
  publishText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  formContent: { flex: 1, marginTop: 14 },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  authorMeta: { marginLeft: 12 },
  authorName: { fontSize: 14, fontWeight: "800" },
  privacyPill: { color: "#10B981", fontSize: 11, marginTop: 2, fontWeight: "600" },
  captionInput: { fontSize: 15, minHeight: 65, textAlignVertical: "top", lineHeight: 22 },
  mediaPreviewCard: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    marginVertical: 8,
  },
  previewImage: { width: "100%", height: "100%" },
  videoPlaceholder: { backgroundColor: "#18181B", alignItems: "center", justifyContent: "center", gap: 8 },
  videoPlaceholderText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  charCount: { fontSize: 11, fontWeight: "700", textAlign: "right" },
  venueChoices: { marginVertical: 6 },
  venueChoicesLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, marginBottom: 8 },
  venueChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  venueChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  venueChipText: { fontSize: 12, fontWeight: "700" },
  removeMediaBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  venueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(225, 29, 72, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.25)",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  venueName: { fontSize: 13, fontWeight: "800" },
  venueSub: { color: "#E11D48", fontSize: 11, marginTop: 2 },
  statusBox: { alignItems: "center", marginVertical: 12 },
  statusCanvas: {
    width: "100%",
    height: 180,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statusTextInput: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", textAlign: "center", width: "100%" },
  paletteRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  colorDot: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  colorDotActive: { borderWidth: 2.5, borderColor: "#FAFAFA" },
});
