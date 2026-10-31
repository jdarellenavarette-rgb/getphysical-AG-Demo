import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Modal } from "react-native";
import { X, Send, MapPin, Award } from "lucide-react-native";

interface StoryViewerModalProps {
  visible: boolean;
  onClose: () => void;
  onTapLocationTag?: (facilityId: string) => void;
}

export function StoryViewerModal({ visible, onClose, onTapLocationTag }: StoryViewerModalProps) {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [progress, setProgress] = useState(0);

  const stories = [
    {
      id: "story_1",
      authorName: "Metro Core Arena",
      authorAvatar: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80",
      mediaUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      locationTag: { id: "fac_metro_core", name: "Metro Core Arena", cta: "Drop In • ₱250" },
      stamp: { title: "Daily Check-ins", value: "84 Athletes" },
      timeAgo: "2h ago",
    },
    {
      id: "story_2",
      authorName: "Coach Miguel Ramos",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      mediaUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80",
      locationTag: { id: "fac_nexus_club", name: "Nexus Court Club", cta: "Book Court • ₱200/hr" },
      stamp: { title: "Court Open Play", value: "3 Slots Left" },
      timeAgo: "4h ago",
    },
  ];

  const defaultStory = stories[0]!;
  const current = stories[activeStoryIdx] ?? defaultStory;

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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* SEGMENTED PROGRESS BARS (Instagram standard) */}
        <View style={styles.progressRow}>
          {stories.map((st, i) => (
            <View key={st.id} style={styles.segmentTrack}>
              <View
                style={[
                  styles.segmentFill,
                  {
                    width:
                      i < activeStoryIdx ? "100%" : i === activeStoryIdx ? `${progress}%` : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* TOP AUTHOR BAR */}
        <View style={styles.topBar}>
          <Image source={{ uri: current.authorAvatar }} style={styles.avatar} />
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{current.authorName}</Text>
            <Text style={styles.timeAgo}>{current.timeAgo}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* STORY MEDIA & TAP NAVIGATION */}
        <View style={styles.mediaContainer}>
          <Image source={{ uri: current.mediaUrl }} style={styles.mediaImage} />

          {/* TAP ZONES */}
          <TouchableOpacity onPress={handlePrev} style={styles.leftTapZone} />
          <TouchableOpacity onPress={handleNext} style={styles.rightTapZone} />

          {/* INTERACTIVE TRACKER STAMP */}
          {current.stamp && (
            <View style={styles.stampOverlay}>
              <Award size={14} color="#10B981" />
              <View>
                <Text style={styles.stampTitle}>{current.stamp.title}</Text>
                <Text style={styles.stampVal}>{current.stamp.value}</Text>
              </View>
            </View>
          )}

          {/* INTERACTIVE LOCATION PILL (Actionable Object Principle) */}
          {current.locationTag && (
            <TouchableOpacity
              onPress={() => onTapLocationTag?.(current.locationTag.id)}
              style={styles.locationPill}
            >
              <MapPin size={12} color="#FFFFFF" />
              <Text style={styles.locationText}>{current.locationTag.name}</Text>
              <Text style={styles.locationCta}>{current.locationTag.cta}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BOTTOM MESSAGE REPLY INPUT */}
        <View style={styles.bottomBar}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Reply to ${current.authorName}...`}
            placeholderTextColor="#71717A"
            value={replyText}
            onChangeText={setReplyText}
          />
          <TouchableOpacity
            onPress={() => {
              setReplyText("");
              handleNext();
            }}
            style={styles.sendBtn}
          >
            <Send size={18} color="#FAFAFA" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#000000", justifyContent: "space-between" },
  progressRow: { flexDirection: "row", paddingHorizontal: 12, paddingTop: 16, gap: 4 },
  segmentTrack: { flex: 1, height: 2.5, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 2, overflow: "hidden" },
  segmentFill: { height: "100%", backgroundColor: "#FFFFFF" },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#FFFFFF" },
  authorMeta: { flex: 1, marginLeft: 10 },
  authorName: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  timeAgo: { color: "#A1A1AA", fontSize: 10, marginTop: 1 },
  closeBtn: { padding: 4 },
  mediaContainer: { flex: 1, position: "relative", justifyContent: "center", alignItems: "center" },
  mediaImage: { width: "100%", height: "100%", resizeMode: "cover" },
  leftTapZone: { position: "absolute", left: 0, top: 0, bottom: 0, width: "30%" },
  rightTapZone: { position: "absolute", right: 0, top: 0, bottom: 0, width: "70%" },
  stampOverlay: { position: "absolute", top: 30, right: 20, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(9, 9, 11, 0.85)", borderWidth: 1, borderColor: "#10B981", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  stampTitle: { color: "#71717A", fontSize: 9, fontWeight: "700" },
  stampVal: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
  locationPill: { position: "absolute", bottom: 40, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#E11D48", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
  locationText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  locationCta: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "500", marginLeft: 4 },
  bottomBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 24, paddingTop: 10, gap: 10 },
  replyInput: { flex: 1, height: 42, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 21, paddingHorizontal: 16, color: "#FFFFFF", fontSize: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center" },
});
