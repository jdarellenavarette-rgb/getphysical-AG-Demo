import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Modal, ScrollView } from "react-native";
import { X, MapPin, Award, Image as ImageIcon, Flame, Sparkles, ChevronRight, Check } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { SODIA_FIELD_LIMITS, type UserRole } from "sodia-core";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  defaultMode?: "post" | "story";
}

const BG_GRADIENTS = [
  { id: "carbon", color: "#18181B", name: "Dark" },
  { id: "crimson", color: "#BE123C", name: "Crimson" },
  { id: "emerald", color: "#047857", name: "Emerald" },
  { id: "indigo", color: "#4338CA", name: "Indigo" },
];

export function CreatePostModal({ visible, onClose, defaultMode = "post" }: CreatePostModalProps) {
  const { profile, facilities, addPost, addUserStory } = useEcosystemStore();
  const [activeTab, setActiveTab] = useState<"post" | "status" | "story">(defaultMode === "story" ? "story" : "post");
  const [caption, setCaption] = useState("");
  const [selectedBgColor, setSelectedBgColor] = useState(BG_GRADIENTS[0]!.color);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>("fac_metro_core");
  const [hasStampAttached, setHasStampAttached] = useState(true);

  const selectedFac = facilities.find((f) => f.id === selectedFacilityId);
  const remainingChars = SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS - caption.length;

  const handlePublish = () => {
    if (!caption.trim() && activeTab !== "story") return;

    if (activeTab === "story") {
      addUserStory(
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
        caption.trim() || "Crushing early session in BGC! ⚡"
      );
    } else if (activeTab === "status") {
      addPost(
        caption.trim(),
        selectedFacilityId ?? undefined,
        undefined,
        null // null indicates Facebook-style colored status post
      );
    } else {
      addPost(
        caption.trim(),
        selectedFacilityId ?? undefined,
        hasStampAttached
          ? { id: `stamp_${Date.now()}`, type: "lift", title: "Deadlift 1RM", primaryMetric: "225 kg", isVerified: true, isPR: true }
          : undefined,
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
      );
    }

    setCaption("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* TOP BAR WITH MODE SEGMENTS */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.modeTabs}>
              <TouchableOpacity onPress={() => setActiveTab("post")} style={[styles.modeTab, activeTab === "post" && styles.modeTabActive]}>
                <Text style={[styles.modeTabText, activeTab === "post" && styles.modeTabTextActive]}>Post</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab("status")} style={[styles.modeTab, activeTab === "status" && styles.modeTabActive]}>
                <Text style={[styles.modeTabText, activeTab === "status" && styles.modeTabTextActive]}>Status</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab("story")} style={[styles.modeTab, activeTab === "story" && styles.modeTabActive]}>
                <Text style={[styles.modeTabText, activeTab === "story" && styles.modeTabTextActive]}>Story</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handlePublish}
              disabled={(!caption.trim() && activeTab !== "story") || remainingChars < 0}
              style={[styles.publishBtn, (!caption.trim() && activeTab !== "story") && styles.publishBtnDisabled]}
            >
              <Text style={styles.publishText}>{activeTab === "story" ? "Share" : "Post"}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            {/* AUTHOR PREVIEW */}
            <View style={styles.authorRow}>
              <Image source={{ uri: profile.avatar_url ?? "" }} style={styles.avatar} />
              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>{profile.first_name} {profile.last_name}</Text>
                <Text style={styles.privacyPill}>{activeTab === "story" ? "Your Story • 24 Hours" : "Public • Sodia Feed"}</Text>
              </View>
            </View>

            {/* MODE 1: MEDIA POST */}
            {activeTab === "post" && (
              <>
                <TextInput
                  style={styles.captionInput}
                  placeholder="What did you crush today? Share lift metrics or thoughts..."
                  placeholderTextColor="#71717A"
                  multiline
                  value={caption}
                  onChangeText={setCaption}
                  maxLength={SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS}
                />

                {hasStampAttached && (
                  <View style={styles.stampCard}>
                    <Award size={16} color="#10B981" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.stampTitle}>VERIFIED LIFT STAMP</Text>
                      <Text style={styles.stampVal}>Conventional Deadlift: 225 kg x 1 rep</Text>
                    </View>
                    <TouchableOpacity onPress={() => setHasStampAttached(false)}>
                      <X size={15} color="#71717A" />
                    </TouchableOpacity>
                  </View>
                )}

                {selectedFac && (
                  <View style={styles.venueCard}>
                    <MapPin size={16} color="#E11D48" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.venueName}>{selectedFac.name}</Text>
                      <Text style={styles.venueSub}>Auto-attaches Drop-in POS Pill (₱{selectedFac.day_pass_price_php})</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedFacilityId(null)}>
                      <X size={15} color="#71717A" />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* MODE 2: FACEBOOK STATUS THOUGHT (COLOR BACKGROUND) */}
            {activeTab === "status" && (
              <View style={styles.statusBox}>
                <View style={[styles.statusCanvas, { backgroundColor: selectedBgColor }]}>
                  <TextInput
                    style={styles.statusTextInput}
                    placeholder="What's on your athletic mind, Adam?"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    multiline
                    value={caption}
                    onChangeText={setCaption}
                    maxLength={200}
                  />
                </View>
                <View style={styles.paletteRow}>
                  {BG_GRADIENTS.map((bg) => (
                    <TouchableOpacity
                      key={bg.id}
                      onPress={() => setSelectedBgColor(bg.color)}
                      style={[styles.colorDot, { backgroundColor: bg.color }, selectedBgColor === bg.color && styles.colorDotActive]}
                    >
                      {selectedBgColor === bg.color && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* MODE 3: 24H STORY COMPOSER */}
            {activeTab === "story" && (
              <View style={styles.storyCanvas}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80" }}
                  style={styles.storyCoverImage}
                />
                <View style={styles.storyOverlayStickers}>
                  <View style={styles.storyLocationSticker}>
                    <MapPin size={12} color="#FFFFFF" />
                    <Text style={styles.storyLocationText}>Metro Core Arena</Text>
                  </View>
                  <TextInput
                    style={styles.storyOverlayInput}
                    placeholder="Type story text..."
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={caption}
                    onChangeText={setCaption}
                  />
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
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  container: { backgroundColor: "#18181B", borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "86%", padding: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#27272A", paddingBottom: 12 },
  cancelBtn: { padding: 4 },
  cancelText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  modeTabs: { flexDirection: "row", backgroundColor: "#121215", borderRadius: 10, padding: 3, gap: 4 },
  modeTab: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  modeTabActive: { backgroundColor: "#27272A" },
  modeTabText: { color: "#71717A", fontSize: 12, fontWeight: "700" },
  modeTabTextActive: { color: "#FAFAFA" },
  publishBtn: { backgroundColor: "#E11D48", paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8 },
  publishBtnDisabled: { opacity: 0.5 },
  publishText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  formContent: { flex: 1, marginTop: 14 },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  authorMeta: { marginLeft: 12 },
  authorName: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  privacyPill: { color: "#10B981", fontSize: 11, marginTop: 2, fontWeight: "600" },
  captionInput: { color: "#FAFAFA", fontSize: 15, minHeight: 80, textAlignVertical: "top", lineHeight: 22 },
  stampCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(16, 185, 129, 0.12)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)", borderRadius: 12, padding: 12, marginVertical: 8 },
  stampTitle: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  stampVal: { color: "#FAFAFA", fontSize: 12, fontWeight: "700", marginTop: 2 },
  venueCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(225, 29, 72, 0.1)", borderWidth: 1, borderColor: "rgba(225, 29, 72, 0.25)", borderRadius: 12, padding: 12, marginVertical: 8 },
  venueName: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
  venueSub: { color: "#E11D48", fontSize: 11, marginTop: 2 },
  statusBox: { alignItems: "center", marginVertical: 12 },
  statusCanvas: { width: "100%", height: 180, borderRadius: 18, justifyContent: "center", alignItems: "center", padding: 20 },
  statusTextInput: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", textAlign: "center", width: "100%" },
  paletteRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  colorDot: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  colorDotActive: { borderWidth: 2.5, borderColor: "#FAFAFA" },
  storyCanvas: { width: "100%", height: 260, borderRadius: 20, overflow: "hidden", position: "relative", marginTop: 10 },
  storyCoverImage: { width: "100%", height: "100%", resizeMode: "cover" },
  storyOverlayStickers: { position: "absolute", top: 16, left: 16, right: 16, bottom: 16, justifyContent: "space-between" },
  storyLocationSticker: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  storyLocationText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  storyOverlayInput: { backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 10, padding: 12, color: "#FFFFFF", fontSize: 15, fontWeight: "700", textAlign: "center" },
});
