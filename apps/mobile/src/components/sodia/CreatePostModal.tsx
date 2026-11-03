import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Modal, ScrollView } from "react-native";
import { X, MapPin, Award, Check } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { SODIA_FIELD_LIMITS } from "sodia-core";
import { PostMediaAttachmentBar } from "./PostMediaAttachmentBar";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenStoryCamera?: () => void;
  defaultMode?: "post" | "status";
}

const BG_GRADIENTS = [
  { id: "carbon", color: "#18181B" },
  { id: "crimson", color: "#BE123C" },
  { id: "emerald", color: "#047857" },
  { id: "indigo", color: "#4338CA" },
];

export function CreatePostModal({
  visible,
  onClose,
  onOpenStoryCamera,
  defaultMode = "post",
}: CreatePostModalProps) {
  const { profile, facilities, addPost } = useEcosystemStore();
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<"post" | "status">(defaultMode);
  const [caption, setCaption] = useState("");
  const [selectedBgColor, setSelectedBgColor] = useState(BG_GRADIENTS[0]!.color);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>("fac_metro_core");
  const [hasStampAttached, setHasStampAttached] = useState(true);
  const [attachedMediaUri, setAttachedMediaUri] = useState<string | null>(
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
  );
  const [mediaKind, setMediaKind] = useState<"photo" | "video">("photo");

  const selectedFac = facilities.find((f) => f.id === selectedFacilityId);
  const remainingChars = SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS - caption.length;

  const handleTakePhoto = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
      if (!res.canceled && res.assets[0]?.uri) {
        setAttachedMediaUri(res.assets[0].uri);
        setMediaKind("photo");
      }
    } catch (e) {
      setAttachedMediaUri("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80");
      setMediaKind("photo");
    }
  };

  const handleRecordVideo = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ mediaTypes: ["videos"] });
      if (!res.canceled && res.assets[0]?.uri) {
        setAttachedMediaUri(res.assets[0].uri);
        setMediaKind("video");
      }
    } catch (e) {
      setAttachedMediaUri("https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4");
      setMediaKind("video");
    }
  };

  const handlePickLibrary = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images", "videos"], quality: 0.8 });
      if (!res.canceled && res.assets[0]?.uri) {
        setAttachedMediaUri(res.assets[0].uri);
        setMediaKind(res.assets[0].type === "video" ? "video" : "photo");
      }
    } catch (e) {
      setAttachedMediaUri("https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80");
      setMediaKind("photo");
    }
  };

  const handlePublish = () => {
    if (!caption.trim() && !attachedMediaUri) return;
    if (activeTab === "status") {
      addPost(caption.trim(), selectedFacilityId ?? undefined, undefined, null);
    } else {
      addPost(
        caption.trim() || "Crushing the training block! 🔥",
        selectedFacilityId ?? undefined,
        hasStampAttached ? { id: `stamp_${Date.now()}`, type: "lift", title: "Deadlift 1RM", primaryMetric: "225 kg", isVerified: true, isPR: true } : undefined,
        attachedMediaUri
      );
    }
    setCaption("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}><Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text></TouchableOpacity>
            <View style={[styles.modeTabs, { backgroundColor: colors.bgInput }]}>
              <TouchableOpacity onPress={() => setActiveTab("post")} style={[styles.modeTab, activeTab === "post" && { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.modeTabText, { color: activeTab === "post" ? colors.textPrimary : colors.textMuted }]}>Post</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab("status")} style={[styles.modeTab, activeTab === "status" && { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.modeTabText, { color: activeTab === "status" ? colors.textPrimary : colors.textMuted }]}>Status</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { onClose(); onOpenStoryCamera?.(); }} style={styles.modeTab}>
                <Text style={[styles.modeTabText, { color: "#E11D48" }]}>Story 📷</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handlePublish} disabled={(!caption.trim() && !attachedMediaUri) || remainingChars < 0} style={[styles.publishBtn, (!caption.trim() && !attachedMediaUri) && styles.publishBtnDisabled]}>
              <Text style={styles.publishText}>Post</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            <View style={styles.authorRow}>
              <Image source={{ uri: profile.avatar_url ?? "" }} style={styles.avatar} />
              <View style={styles.authorMeta}>
                <Text style={[styles.authorName, { color: colors.textPrimary }]}>{profile.first_name} {profile.last_name}</Text>
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
                {attachedMediaUri && (
                  <View style={styles.mediaPreviewCard}>
                    <Image source={{ uri: attachedMediaUri }} style={styles.previewImage} />
                    <View style={styles.mediaKindBadge}><Text style={styles.mediaKindText}>{mediaKind.toUpperCase()}</Text></View>
                    <TouchableOpacity onPress={() => setAttachedMediaUri(null)} style={styles.removeMediaBtn}><X size={14} color="#FFF" /></TouchableOpacity>
                  </View>
                )}
                <PostMediaAttachmentBar onTakePhoto={handleTakePhoto} onRecordVideo={handleRecordVideo} onPickLibrary={handlePickLibrary} />
                {hasStampAttached && (
                  <View style={styles.stampCard}>
                    <Award size={16} color="#10B981" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.stampTitle}>VERIFIED LIFT STAMP</Text>
                      <Text style={[styles.stampVal, { color: colors.textPrimary }]}>Conventional Deadlift: 225 kg x 1 rep</Text>
                    </View>
                    <TouchableOpacity onPress={() => setHasStampAttached(false)}><X size={15} color={colors.textMuted} /></TouchableOpacity>
                  </View>
                )}
                {selectedFac && (
                  <View style={styles.venueCard}>
                    <MapPin size={16} color="#E11D48" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.venueName, { color: colors.textPrimary }]}>{selectedFac.name}</Text>
                      <Text style={styles.venueSub}>Auto-attaches Drop-in POS Pill (₱{selectedFac.day_pass_price_php})</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedFacilityId(null)}><X size={15} color={colors.textMuted} /></TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {activeTab === "status" && (
              <View style={styles.statusBox}>
                <View style={[styles.statusCanvas, { backgroundColor: selectedBgColor }]}>
                  <TextInput style={styles.statusTextInput} placeholder="What's on your athletic mind?" placeholderTextColor="rgba(255,255,255,0.6)" multiline value={caption} onChangeText={setCaption} maxLength={200} />
                </View>
                <View style={styles.paletteRow}>
                  {BG_GRADIENTS.map((bg) => (
                    <TouchableOpacity key={bg.id} onPress={() => setSelectedBgColor(bg.color)} style={[styles.colorDot, { backgroundColor: bg.color }, selectedBgColor === bg.color && styles.colorDotActive]}>
                      {selectedBgColor === bg.color && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "88%", padding: 18, borderWidth: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, paddingBottom: 12 },
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
  mediaPreviewCard: { width: "100%", height: 160, borderRadius: 14, overflow: "hidden", position: "relative", marginVertical: 8 },
  previewImage: { width: "100%", height: "100%" },
  mediaKindBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  mediaKindText: { color: "#FFF", fontSize: 9, fontWeight: "800" },
  removeMediaBtn: { position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center" },
  stampCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(16, 185, 129, 0.12)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)", borderRadius: 12, padding: 12, marginVertical: 6 },
  stampTitle: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  stampVal: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  venueCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(225, 29, 72, 0.1)", borderWidth: 1, borderColor: "rgba(225, 29, 72, 0.25)", borderRadius: 12, padding: 12, marginVertical: 6 },
  venueName: { fontSize: 13, fontWeight: "800" },
  venueSub: { color: "#E11D48", fontSize: 11, marginTop: 2 },
  statusBox: { alignItems: "center", marginVertical: 12 },
  statusCanvas: { width: "100%", height: 180, borderRadius: 18, justifyContent: "center", alignItems: "center", padding: 20 },
  statusTextInput: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", textAlign: "center", width: "100%" },
  paletteRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  colorDot: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  colorDotActive: { borderWidth: 2.5, borderColor: "#FAFAFA" },
});
