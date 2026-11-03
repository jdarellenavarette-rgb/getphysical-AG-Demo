import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Camera, Video, Image as ImageIcon } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

interface PostMediaAttachmentBarProps {
  onTakePhoto: () => void;
  onRecordVideo: () => void;
  onPickLibrary: () => void;
}

export function PostMediaAttachmentBar({
  onTakePhoto,
  onRecordVideo,
  onPickLibrary,
}: PostMediaAttachmentBarProps) {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.attachmentBar, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
      <Text style={[styles.attachTitle, { color: colors.textMuted }]}>ATTACH MULTIMEDIA:</Text>
      <View style={styles.attachBtnRow}>
        <TouchableOpacity onPress={onTakePhoto} style={styles.attachBtn}>
          <Camera size={18} color="#E11D48" />
          <Text style={[styles.attachBtnText, { color: colors.textPrimary }]}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRecordVideo} style={styles.attachBtn}>
          <Video size={18} color="#3B82F6" />
          <Text style={[styles.attachBtnText, { color: colors.textPrimary }]}>Record Video</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPickLibrary} style={styles.attachBtn}>
          <ImageIcon size={18} color="#10B981" />
          <Text style={[styles.attachBtnText, { color: colors.textPrimary }]}>Library</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  attachmentBar: { borderRadius: 14, padding: 12, borderWidth: 1, marginVertical: 8 },
  attachTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, marginBottom: 8 },
  attachBtnRow: { flexDirection: "row", justifyContent: "space-around" },
  attachBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  attachBtnText: { fontSize: 12, fontWeight: "700" },
});
