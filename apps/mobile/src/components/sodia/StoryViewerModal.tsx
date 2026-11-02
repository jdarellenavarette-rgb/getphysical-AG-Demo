import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Camera, Heart, MessageCircle, Bookmark, Share2, Music, CheckCircle2 } from "lucide-react-native";

interface StoryViewerModalProps {
  visible: boolean;
  onClose: () => void;
  onTapLocationTag?: (facilityId: string) => void;
  onOpenComments?: () => void;
  onOpenCreatePost?: () => void;
}

export function StoryViewerModal({ visible, onClose, onTapLocationTag, onOpenComments, onOpenCreatePost }: StoryViewerModalProps) {
  const insets = useSafeAreaInsets();
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [progress, setProgress] = useState(0);

  const reels = [
    {
      id: "reel_1",
      handle: "@alexeala",
      name: "Alex Eala",
      isVerified: true,
      mediaUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&q=80",
      caption: "Grinding on the clay today! 🔥 Always striving for that next shot. #tennis #workout #athlete",
      audio: "Courtside Heat (Original Sound)",
      likes: "3.458k",
      comments: "600",
      locationTag: { id: "fac_nexus_club", name: "Nexus Court Club", cta: "Book Court • ₱200/hr" },
    },
    {
      id: "reel_2",
      handle: "@miguel_cpt",
      name: "Miguel Ramos",
      isVerified: true,
      mediaUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
      caption: "Heavy deadlift triples at Metro Core. Peak week prep underway! 🏋️‍♂️💪 #powerlifting #metrocore",
      audio: "Iron Anthem • Gym Motivation",
      likes: "2.140k",
      comments: "382",
      locationTag: { id: "fac_metro_core", name: "Metro Core Arena", cta: "Day Pass • ₱250" },
    },
  ];

  const current = reels[activeStoryIdx] ?? reels[0]!;

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIdx < reels.length - 1) {
            setActiveStoryIdx((i) => i + 1);
            return 0;
          } else {
            onClose();
            return 0;
          }
        }
        return prev + 5;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [visible, activeStoryIdx, reels.length, onClose]);

  const handleNext = () => {
    if (activeStoryIdx < reels.length - 1) {
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* BACKGROUND ATHLETE REEL MEDIA */}
        <Image source={{ uri: current.mediaUrl }} style={styles.bgMedia} resizeMode="cover" />
        <View style={styles.darkGradientOverlay} />

        {/* TAP ZONES */}
        <TouchableOpacity onPress={handlePrev} style={styles.leftTapZone} />
        <TouchableOpacity onPress={handleNext} style={styles.rightTapZone} />

        {/* TOP SEGMENTED PROGRESS BARS */}
        <View style={[styles.progressRow, { paddingTop: Math.max(insets.top, 50) + 6 }]}>
          {reels.map((r, i) => (
            <View key={r.id} style={styles.segmentTrack}>
              <View
                style={[
                  styles.segmentFill,
                  { width: i < activeStoryIdx ? "100%" : i === activeStoryIdx ? `${progress}%` : "0%" },
                ]}
              />
            </View>
          ))}
        </View>

        {/* TOP CONTROLS (Back & Camera) */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.topIconBtn}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onClose();
              onOpenCreatePost?.();
            }}
            style={styles.topIconBtn}
          >
            <Camera size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* RIGHT FLOATING REACTION STACK (FB/IG PHOTO 1 CENTER) */}
        <View style={styles.rightActionStack}>
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.actionItem}>
            <View style={[styles.actionIconCircle, isLiked && styles.actionIconCircleLiked]}>
              <Heart size={24} color="#FFFFFF" fill={isLiked ? "#E11D48" : "none"} />
            </View>
            <Text style={styles.actionLabel}>{current.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onOpenComments} style={styles.actionItem}>
            <View style={styles.actionIconCircle}>
              <MessageCircle size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>{current.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSaved(!isSaved)} style={styles.actionItem}>
            <View style={[styles.actionIconCircle, isSaved && styles.actionIconCircleSaved]}>
              <Bookmark size={22} color="#FFFFFF" fill={isSaved ? "#F59E0B" : "none"} />
            </View>
            <Text style={styles.actionLabel}>{isSaved ? "Saved" : "Save"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert("Reel Shared", "Copied reel link to clipboard.")}
            style={styles.actionItem}
          >
            <View style={styles.actionIconCircle}>
              <Share2 size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* BOTTOM METADATA & ATHLETE INFO */}
        <View style={[styles.bottomInfo, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
          <View style={styles.authorRow}>
            <Text style={styles.handleText}>{current.handle}</Text>
            {current.isVerified && <CheckCircle2 size={13} color="#38BDF8" fill="#38BDF8" />}
            <TouchableOpacity
              onPress={() => setIsFollowing(!isFollowing)}
              style={[styles.followBtn, isFollowing && styles.followBtnActive]}
            >
              <Text style={styles.followBtnText}>{isFollowing ? "Following" : "Follow"}</Text>
            </TouchableOpacity>
          </View>

          <Text numberOfLines={2} style={styles.captionText}>{current.caption}</Text>

          <View style={styles.audioRow}>
            <Music size={13} color="#FAFAFA" />
            <Text style={styles.audioText}>{current.audio}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#000000", position: "relative" },
  bgMedia: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  darkGradientOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" },
  leftTapZone: { position: "absolute", left: 0, top: 100, bottom: 150, width: "30%", zIndex: 10 },
  rightTapZone: { position: "absolute", right: 80, top: 100, bottom: 150, width: "40%", zIndex: 10 },
  progressRow: { flexDirection: "row", paddingHorizontal: 12, gap: 5, zIndex: 20 },
  segmentTrack: { flex: 1, height: 2.5, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" },
  segmentFill: { height: "100%", backgroundColor: "#FFFFFF" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 10, zIndex: 20 },
  topIconBtn: { minWidth: 44, minHeight: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  rightActionStack: { position: "absolute", right: 14, bottom: 120, alignItems: "center", gap: 16, zIndex: 30 },
  actionItem: { alignItems: "center" },
  actionIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(24,24,27,0.7)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  actionIconCircleLiked: { backgroundColor: "rgba(225,29,72,0.8)" },
  actionIconCircleSaved: { backgroundColor: "rgba(245,158,11,0.8)" },
  actionLabel: { color: "#FAFAFA", fontSize: 11, fontWeight: "700", marginTop: 4, textShadowColor: "#000", textShadowRadius: 3 },
  bottomInfo: { position: "absolute", left: 16, right: 80, bottom: 0, zIndex: 30 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  handleText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textShadowColor: "#000", textShadowRadius: 3 },
  followBtn: { backgroundColor: "#E11D48", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  followBtnActive: { backgroundColor: "rgba(255,255,255,0.2)" },
  followBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  captionText: { color: "#FAFAFA", fontSize: 13, lineHeight: 18, marginBottom: 8, textShadowColor: "#000", textShadowRadius: 3 },
  audioRow: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.5)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  audioText: { color: "#FAFAFA", fontSize: 11, fontWeight: "600" },
});
