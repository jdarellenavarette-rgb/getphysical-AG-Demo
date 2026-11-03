import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, TextInput, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { X, Zap, ZapOff, RefreshCw, Music, Type, Grid3X3, Clock, Sparkles, ChevronLeft, MapPin, Send, Camera } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface InstagramStoryCameraModalProps {
  visible: boolean;
  onClose: () => void;
}

export function InstagramStoryCameraModal({ visible, onClose }: InstagramStoryCameraModalProps) {
  const { profile, addUserStory } = useEcosystemStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | null>(null);
  const [storyText, setStoryText] = useState("");
  const [locationTag, setLocationTag] = useState("📍 BGC High Street");
  const [cameraMode, setCameraMode] = useState<"STORY" | "REEL" | "POST">("STORY");

  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission?.granted]);

  const handleCapture = async () => {
    try {
      if (cameraRef.current && permission?.granted) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, skipProcessing: false });
        if (photo?.uri) {
          setSelectedMediaUri(photo.uri);
          return;
        }
      }
    } catch (e) {
      console.warn("Camera capture failed:", e);
    }
    setSelectedMediaUri("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1080&q=80");
  };

  const handlePickFromGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images", "videos"], quality: 0.8 });
      if (!res.canceled && res.assets[0]?.uri) {
        setSelectedMediaUri(res.assets[0].uri);
      }
    } catch (e) {
      setSelectedMediaUri("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1080&q=80");
    }
  };

  const handlePublishStory = (isCloseFriends = false) => {
    if (!selectedMediaUri) return;
    addUserStory(selectedMediaUri, storyText.trim() || undefined);
    Alert.alert("Shared!", isCloseFriends ? "Shared to Close Friends ⭐" : "Added to Your Story ⚡");
    setSelectedMediaUri(null);
    setStoryText("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {selectedMediaUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedMediaUri }} style={styles.previewMedia} resizeMode="cover" />
            <View style={styles.previewTopBar}>
              <TouchableOpacity onPress={() => setSelectedMediaUri(null)} style={styles.topIconBtn}>
                <ChevronLeft size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.previewToolRow}>
                <TouchableOpacity onPress={() => setStoryText((t) => (t ? "" : "Crushing session! 🔥"))} style={styles.topIconBtn}>
                  <Type size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setLocationTag((l) => (l.includes("BGC") ? "📍 Metro Core Arena" : "📍 BGC High Street"))} style={styles.topIconBtn}>
                  <MapPin size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert("Effects", "Sparkle glow applied ✨")} style={styles.topIconBtn}>
                  <Sparkles size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.overlayContent}>
              <View style={styles.locationStickerPill}>
                <Text style={styles.locationStickerText}>{locationTag}</Text>
              </View>
              <TextInput
                style={styles.floatingStoryInput}
                placeholder="Tap to type caption..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={storyText}
                onChangeText={setStoryText}
                multiline
              />
            </View>
            <View style={styles.previewBottomTray}>
              <TouchableOpacity onPress={() => handlePublishStory(false)} style={styles.yourStoryBtn}>
                <View style={styles.yourStoryAvatarRing}>
                  <Image source={{ uri: profile.avatar_url ?? "" }} style={styles.yourStoryAvatar} />
                  <View style={styles.storyAddBadge}><Text style={styles.storyAddPlus}>+</Text></View>
                </View>
                <Text style={styles.yourStoryLabel}>Your Story</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handlePublishStory(true)} style={styles.closeFriendsBtn}>
                <View style={styles.closeFriendsStar}><Text style={{ color: "#FFF", fontSize: 13, fontWeight: "900" }}>★</Text></View>
                <Text style={styles.closeFriendsLabel}>Close Friends</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handlePublishStory(false)} style={styles.sendCircleBtn}>
                <Send size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            {permission?.granted ? (
              <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} enableTorch={flash === "on"} />
            ) : (
              <View style={styles.permissionScreen}>
                <Camera size={52} color="#FFFFFF" />
                <Text style={styles.permTitle}>Camera Access Required</Text>
                <Text style={styles.permDesc}>Allow access to your camera to capture live workout stories and reels directly in Sodia.</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.enablePermBtn}>
                  <Text style={styles.enablePermBtnText}>Enable Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePickFromGallery} style={styles.pickGalleryBtn}>
                  <Text style={styles.pickGalleryText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.cameraTopBar}>
              <TouchableOpacity onPress={onClose} style={styles.topIconBtn}>
                <X size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))} style={styles.topIconBtn}>
                {flash === "on" ? <Zap size={22} color="#FBBF24" fill="#FBBF24" /> : <ZapOff size={22} color="#FFFFFF" />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Audio", "Select background beat")} style={styles.topIconBtn}>
                <Music size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.leftToolbar}>
              <TouchableOpacity onPress={() => setSelectedMediaUri("https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1080&q=80")} style={styles.leftToolBtn}>
                <Type size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Boomerang", "Boomerang loop active")} style={styles.leftToolBtn}>
                <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "900" }}>∞</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Layout", "2x2 grid active")} style={styles.leftToolBtn}>
                <Grid3X3 size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Hands-Free", "3s timer set")} style={styles.leftToolBtn}>
                <Clock size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.cameraBottomControls}>
              <View style={styles.shutterRow}>
                <TouchableOpacity onPress={handlePickFromGallery} style={styles.galleryPreviewSquare}>
                  <Image source={{ uri: profile.avatar_url ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }} style={styles.galleryThumb} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleCapture} activeOpacity={0.8} style={styles.shutterOuterRing}>
                  <View style={styles.shutterInnerCircle} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))} style={styles.flipCameraBtn}>
                  <RefreshCw size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.modeCarousel}>
                {(["POST", "STORY", "REEL"] as const).map((m) => (
                  <TouchableOpacity key={m} onPress={() => setCameraMode(m)}>
                    <Text style={[styles.modeText, cameraMode === m && styles.modeTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  cameraContainer: { flex: 1, position: "relative" },
  permissionScreen: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 36, backgroundColor: "#09090B" },
  permTitle: { color: "#FFF", fontSize: 20, fontWeight: "900", marginTop: 18, textAlign: "center" },
  permDesc: { color: "#A1A1AA", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20, marginBottom: 24 },
  enablePermBtn: { backgroundColor: "#E11D48", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 24, width: "100%", alignItems: "center" },
  enablePermBtnText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  pickGalleryBtn: { marginTop: 14, paddingVertical: 10 },
  pickGalleryText: { color: "#94A3B8", fontWeight: "700", fontSize: 14 },
  cameraTopBar: { position: "absolute", top: 48, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topIconBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  leftToolbar: { position: "absolute", top: 120, left: 16, gap: 16 },
  leftToolBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  cameraBottomControls: { position: "absolute", bottom: 24, left: 0, right: 0, alignItems: "center", gap: 16 },
  shutterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%", paddingHorizontal: 32 },
  galleryPreviewSquare: { width: 44, height: 44, borderRadius: 10, borderWidth: 2, borderColor: "#FFF", overflow: "hidden" },
  galleryThumb: { width: "100%", height: "100%" },
  shutterOuterRing: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  shutterInnerCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#FFFFFF" },
  flipCameraBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  modeCarousel: { flexDirection: "row", gap: 24, alignItems: "center" },
  modeText: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "800", letterSpacing: 0.8 },
  modeTextActive: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  previewContainer: { flex: 1, position: "relative" },
  previewMedia: { width: "100%", height: "100%" },
  previewTopBar: { position: "absolute", top: 48, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewToolRow: { flexDirection: "row", gap: 10 },
  overlayContent: { position: "absolute", top: 130, left: 24, right: 24, alignItems: "center" },
  locationStickerPill: { backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, marginBottom: 16 },
  locationStickerText: { color: "#0F172A", fontSize: 12, fontWeight: "800" },
  floatingStoryInput: { width: "100%", color: "#FFFFFF", fontSize: 22, fontWeight: "800", textAlign: "center", textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  previewBottomTray: { position: "absolute", bottom: 28, left: 16, right: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  yourStoryBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 24, gap: 8 },
  yourStoryAvatarRing: { width: 30, height: 30, borderRadius: 15, position: "relative" },
  yourStoryAvatar: { width: "100%", height: "100%", borderRadius: 15 },
  storyAddBadge: { position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: "#E11D48", justifyContent: "center", alignItems: "center" },
  storyAddPlus: { color: "#FFF", fontSize: 10, fontWeight: "900" },
  yourStoryLabel: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  closeFriendsBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 24, gap: 8 },
  closeFriendsStar: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#10B981", justifyContent: "center", alignItems: "center" },
  closeFriendsLabel: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  sendCircleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
});
