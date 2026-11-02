import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Modal, ScrollView } from "react-native";
import { X, MapPin, Award, Image as ImageIcon, Check, UserCheck, Shield } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { SODIA_FIELD_LIMITS, type UserRole } from "sodia-core";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const { profile, facilities, addPost } = useEcosystemStore();
  const [caption, setCaption] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>("fac_metro_core");
  const [postAsRole, setPostAsRole] = useState<UserRole>("individual");
  const [hasStampAttached, setHasStampAttached] = useState(true);
  const [hasPhotoAttached, setHasPhotoAttached] = useState(true);

  const selectedFac = facilities.find((f) => f.id === selectedFacilityId);
  const remainingChars = SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS - caption.length;

  const handlePublish = () => {
    if (!caption.trim()) return;
    addPost(caption.trim(), selectedFacilityId ?? undefined);
    setCaption("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Sodia Post</Text>
            <TouchableOpacity
              onPress={handlePublish}
              disabled={!caption.trim() || remainingChars < 0}
              style={[
                styles.publishBtn,
                (!caption.trim() || remainingChars < 0) && styles.publishBtnDisabled,
              ]}
            >
              <Text style={styles.publishText}>Post</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            {/* POST AS TOGGLE (Personal vs Gym vs Coach) */}
            <View style={styles.postAsRow}>
              <Text style={styles.postAsLabel}>Post As:</Text>
              <View style={styles.roleToggles}>
                <TouchableOpacity
                  onPress={() => setPostAsRole("individual")}
                  style={[styles.rolePill, postAsRole === "individual" && styles.rolePillActive]}
                >
                  <Text style={[styles.rolePillText, postAsRole === "individual" && styles.rolePillTextActive]}>
                    Individual
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPostAsRole("coach")}
                  style={[styles.rolePill, postAsRole === "coach" && styles.rolePillActive]}
                >
                  <Text style={[styles.rolePillText, postAsRole === "coach" && styles.rolePillTextActive]}>
                    Coach Pro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPostAsRole("staff")}
                  style={[styles.rolePill, postAsRole === "staff" && styles.rolePillActive]}
                >
                  <Text style={[styles.rolePillText, postAsRole === "staff" && styles.rolePillTextActive]}>
                    Facility
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* AUTHOR PREVIEW */}
            <View style={styles.authorRow}>
              <Image source={{ uri: profile.avatar_url ?? "" }} style={styles.avatar} />
              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>
                  {postAsRole === "staff" && selectedFac ? selectedFac.name : `${profile.first_name} ${profile.last_name}`}
                </Text>
                <Text style={styles.privacyPill}>Public • Sodia Feed</Text>
              </View>
            </View>

            {/* CAPTION INPUT */}
            <TextInput
              style={styles.captionInput}
              placeholder="What did you crush today? @ Tag facility or share session metrics..."
              placeholderTextColor="#71717A"
              multiline
              value={caption}
              onChangeText={setCaption}
              maxLength={SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS + 20}
            />

            <View style={styles.counterRow}>
              <Text style={[styles.counterText, remainingChars < 0 && styles.counterError]}>
                {remainingChars} chars remaining
              </Text>
            </View>

            {/* ATTACHED VERIFIED STAMP PREVIEW */}
            {hasStampAttached && (
              <View style={styles.attachedStamp}>
                <View style={styles.stampLeft}>
                  <Award size={16} color="#10B981" />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.stampTitle}>VERIFIED LIFT STAMP</Text>
                    <Text style={styles.stampVal}>Conventional Deadlift: 225 kg x 1 rep</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setHasStampAttached(false)}>
                  <X size={16} color="#71717A" />
                </TouchableOpacity>
              </View>
            )}

            {/* TAGGED FACILITY PREVIEW */}
            {selectedFac && (
              <View style={styles.taggedFacCard}>
                <View style={styles.facCardLeft}>
                  <MapPin size={16} color="#E11D48" />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.facName}>{selectedFac.name}</Text>
                    <Text style={styles.facCtaPreview}>Auto-generates "{selectedFac.registry === "A" ? "Drop In" : "Book Court"}" Pill</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedFacilityId(null)}>
                  <X size={16} color="#71717A" />
                </TouchableOpacity>
              </View>
            )}

            {/* ATTACHMENT TOOLS ROW */}
            <View style={styles.toolsList}>
              <TouchableOpacity
                onPress={() => setSelectedFacilityId("fac_metro_core")}
                style={styles.toolBtn}
              >
                <MapPin size={18} color="#E11D48" />
                <Text style={styles.toolText}>Tag Facility (POS Pill)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setHasStampAttached(true)}
                style={styles.toolBtn}
              >
                <Award size={18} color="#10B981" />
                <Text style={styles.toolText}>Attach Verified Tracker Stamp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setHasPhotoAttached(!hasPhotoAttached)}
                style={[styles.toolBtn, hasPhotoAttached && { borderColor: "#3B82F6", backgroundColor: "rgba(59,130,246,0.12)" }]}
              >
                <ImageIcon size={18} color="#3B82F6" />
                <Text style={styles.toolText}>
                  {hasPhotoAttached ? "Photo Proof Attached ✓" : "Attach Photo Proof"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  container: { backgroundColor: "#18181B", borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "85%", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#27272A", paddingBottom: 14 },
  cancelBtn: { padding: 4 },
  cancelText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  headerTitle: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  publishBtn: { backgroundColor: "#E11D48", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  publishBtnDisabled: { opacity: 0.5 },
  publishText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  formContent: { flex: 1, marginTop: 14 },
  postAsRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  postAsLabel: { color: "#71717A", fontSize: 12, fontWeight: "700", marginRight: 10 },
  roleToggles: { flexDirection: "row", gap: 6 },
  rolePill: { backgroundColor: "#27272A", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  rolePillActive: { backgroundColor: "#E11D48" },
  rolePillText: { color: "#71717A", fontSize: 11, fontWeight: "700" },
  rolePillTextActive: { color: "#FFFFFF" },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  authorMeta: { marginLeft: 12 },
  authorName: { color: "#FAFAFA", fontSize: 14, fontWeight: "700" },
  privacyPill: { color: "#10B981", fontSize: 11, marginTop: 2 },
  captionInput: { color: "#FAFAFA", fontSize: 14, minHeight: 90, textAlignVertical: "top", lineHeight: 20 },
  counterRow: { alignItems: "flex-end", marginBottom: 12 },
  counterText: { color: "#71717A", fontSize: 11 },
  counterError: { color: "#EF4444" },
  attachedStamp: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(16, 185, 129, 0.12)", borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)", borderRadius: 12, padding: 12, marginBottom: 10 },
  stampLeft: { flexDirection: "row", alignItems: "center" },
  stampTitle: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  stampVal: { color: "#FAFAFA", fontSize: 12, fontWeight: "600", marginTop: 2 },
  taggedFacCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(225, 29, 72, 0.1)", borderWidth: 1, borderColor: "rgba(225, 29, 72, 0.25)", borderRadius: 12, padding: 12, marginBottom: 16 },
  facCardLeft: { flexDirection: "row", alignItems: "center" },
  facName: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  facCtaPreview: { color: "#E11D48", fontSize: 11, marginTop: 2 },
  toolsList: { borderTopWidth: 1, borderTopColor: "#27272A", paddingTop: 14, gap: 10 },
  toolBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  toolText: { color: "#D4D4D8", fontSize: 13, fontWeight: "600" },
});
