import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, TextInput, Alert, Linking } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { X, Zap, ZapOff, RefreshCw, ChevronLeft, Send, Camera, Image as ImageIcon } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { Avatar } from "../common/Avatar";
import { useEdgeSwipeBack } from "../../hooks/useDismissGestures";

interface InstagramStoryCameraModalProps {
  visible: boolean;
  onClose: () => void;
}

export function InstagramStoryCameraModal({ visible, onClose }: InstagramStoryCameraModalProps) {
  const { profile, addUserStory } = useEcosystemStore();
  const edgeBack = useEdgeSwipeBack(() => handleClose());
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | null>(null);
  const [storyText, setStoryText] = useState("");

  const cameraRef = useRef<CameraView>(null);

  const askedThisOpen = useRef(false);

  useEffect(() => {
    if (!visible) {
      askedThisOpen.current = false;
      return;
    }
    if (askedThisOpen.current || !permission || permission.granted || !permission.canAskAgain) return;
    askedThisOpen.current = true;
    void requestPermission();
  }, [visible, permission, requestPermission]);

  const cameraReady = permission?.granted === true;

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, skipProcessing: false });
      if (photo?.uri) setSelectedMediaUri(photo.uri);
    } catch {
      Alert.alert("Couldn't take the photo", "Please try again, or choose one from your gallery.");
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
      if (!res.canceled && res.assets[0]?.uri) setSelectedMediaUri(res.assets[0].uri);
    } catch {
      Alert.alert("Gallery unavailable", "Your photo library could not be opened. Check photo access in Settings.");
    }
  };

  // Once the OS stops showing the prompt, the only way forward is the Settings app.
  const handleEnableCamera = () => {
    if (permission && !permission.canAskAgain) void Linking.openSettings();
    else void requestPermission();
  };

  const handleClose = () => {
    setSelectedMediaUri(null);
    setStoryText("");
    onClose();
  };

  const handlePublishStory = () => {
    if (!selectedMediaUri) return;
    addUserStory(selectedMediaUri, storyText.trim() || undefined);
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <View {...edgeBack} style={styles.container}>
        {selectedMediaUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedMediaUri }} style={styles.previewMedia} resizeMode="cover" />
            <View style={styles.previewTopBar}>
              <TouchableOpacity
                onPress={() => setSelectedMediaUri(null)}
                style={styles.topIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Retake"
              >
                <ChevronLeft size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.overlayContent}>
              <TextInput
                style={styles.floatingStoryInput}
                placeholder="Add a caption..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={storyText}
                onChangeText={setStoryText}
                multiline
              />
            </View>
            <View style={styles.previewBottomTray}>
              <TouchableOpacity onPress={handlePublishStory} style={styles.yourStoryBtn} accessibilityRole="button">
                <View style={styles.yourStoryAvatarRing}>
                  <Avatar uri={profile.avatar_url} name={profile.name} size={28} style={styles.yourStoryAvatar} />
                  <View style={styles.storyAddBadge}>
                    <Text style={styles.storyAddPlus}>+</Text>
                  </View>
                </View>
                <Text style={styles.yourStoryLabel}>Your Story</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePublishStory}
                style={styles.sendCircleBtn}
                accessibilityRole="button"
                accessibilityLabel="Share to your story"
              >
                <Send size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            {cameraReady ? (
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
                enableTorch={flash === "on"}
              />
            ) : (
              <View style={styles.permissionScreen}>
                <Camera size={52} color="#FFFFFF" />
                <Text style={styles.permTitle}>Camera Access Required</Text>
                <Text style={styles.permDesc}>
                  Allow access to your camera to capture live workout stories and reels directly in Sodia.
                </Text>
                <TouchableOpacity onPress={handleEnableCamera} style={styles.enablePermBtn} accessibilityRole="button">
                  <Text style={styles.enablePermBtnText}>
                    {permission && !permission.canAskAgain ? "Open Settings" : "Enable Camera"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => void handlePickFromGallery()} style={styles.pickGalleryBtn}>
                  <Text style={styles.pickGalleryText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.cameraTopBar}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.topIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Close camera"
              >
                <X size={26} color="#FFFFFF" />
              </TouchableOpacity>
              {cameraReady && (
                <TouchableOpacity
                  onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
                  style={styles.topIconBtn}
                  accessibilityRole="button"
                  accessibilityLabel={flash === "on" ? "Turn flash off" : "Turn flash on"}
                >
                  {flash === "on" ? (
                    <Zap size={22} color="#FBBF24" fill="#FBBF24" />
                  ) : (
                    <ZapOff size={22} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.cameraBottomControls}>
              <View style={styles.shutterRow}>
                <TouchableOpacity
                  onPress={() => void handlePickFromGallery()}
                  style={[styles.galleryPreviewSquare, styles.galleryIconWrap]}
                  accessibilityRole="button"
                  accessibilityLabel="Choose from gallery"
                >
                  <ImageIcon size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {cameraReady ? (
                  <TouchableOpacity
                    onPress={() => void handleCapture()}
                    activeOpacity={0.8}
                    style={styles.shutterOuterRing}
                    accessibilityRole="button"
                    accessibilityLabel="Take photo"
                  >
                    <View style={styles.shutterInnerCircle} />
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.shutterOuterRing, { opacity: 0 }]} />
                )}

                {cameraReady ? (
                  <TouchableOpacity
                    onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
                    style={styles.flipCameraBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Flip camera"
                  >
                    <RefreshCw size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.flipCameraBtn} />
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  galleryIconWrap: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.15)" },
  container: { flex: 1, backgroundColor: "#000" },
  cameraContainer: { flex: 1, position: "relative" },
  permissionScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
    backgroundColor: "#09090B",
  },
  permTitle: { color: "#FFF", fontSize: 20, fontWeight: "900", marginTop: 18, textAlign: "center" },
  permDesc: { color: "#A1A1AA", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20, marginBottom: 24 },
  enablePermBtn: {
    backgroundColor: "#E11D48",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
  },
  enablePermBtnText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  pickGalleryBtn: { marginTop: 14, paddingVertical: 10 },
  pickGalleryText: { color: "#94A3B8", fontWeight: "700", fontSize: 14 },
  cameraTopBar: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topIconBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  leftToolbar: { position: "absolute", top: 120, left: 16, gap: 16 },
  leftToolBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cameraBottomControls: { position: "absolute", bottom: 24, left: 0, right: 0, alignItems: "center", gap: 16 },
  shutterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 32,
  },
  galleryPreviewSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFF",
    overflow: "hidden",
  },
  galleryThumb: { width: "100%", height: "100%" },
  shutterOuterRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInnerCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#FFFFFF" },
  flipCameraBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  modeCarousel: { flexDirection: "row", gap: 24, alignItems: "center" },
  modeText: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "800", letterSpacing: 0.8 },
  modeTextActive: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  previewContainer: { flex: 1, position: "relative" },
  previewMedia: { width: "100%", height: "100%" },
  previewTopBar: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewToolRow: { flexDirection: "row", gap: 10 },
  overlayContent: { position: "absolute", top: 130, left: 24, right: 24, alignItems: "center" },
  locationStickerPill: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  locationStickerText: { color: "#0F172A", fontSize: 12, fontWeight: "800" },
  floatingStoryInput: {
    width: "100%",
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  previewBottomTray: {
    position: "absolute",
    bottom: 28,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  yourStoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    gap: 8,
  },
  yourStoryAvatarRing: { width: 30, height: 30, borderRadius: 15, position: "relative" },
  yourStoryAvatar: { width: "100%", height: "100%", borderRadius: 15 },
  storyAddBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E11D48",
    justifyContent: "center",
    alignItems: "center",
  },
  storyAddPlus: { color: "#FFF", fontSize: 10, fontWeight: "900" },
  yourStoryLabel: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  closeFriendsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    gap: 8,
  },
  closeFriendsStar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  closeFriendsLabel: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  sendCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});
