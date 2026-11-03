import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from "react-native";
import { X, Send, Award, Flame, Heart, MapPin, CheckCircle2, Footprints, Dumbbell, Apple } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useEcosystemStore } from "../../store/ecosystemStore";

export interface JourneyMemoryItem {
  id: string;
  title: string;
  venue: string;
  duration: string;
  time: string;
  cals: string;
  badge: string;
  details?: {
    type: "move" | "lift" | "food";
    metrics: { label: string; val: string }[];
    splitsOrSets?: string[];
    coachNote?: string;
  };
}

interface MemoryDetailModalProps {
  visible: boolean;
  item: JourneyMemoryItem | null;
  onClose: () => void;
}

export function MemoryDetailModal({ visible, item, onClose }: MemoryDetailModalProps) {
  const { colors } = useThemeStore();
  const { addPost } = useEcosystemStore();

  if (!visible || !item) return null;

  const handleShareToFeed = () => {
    addPost(`Shared from my Training Memories: ${item.title} (${item.duration})! ⚡`, undefined, {
      id: `stamp_mem_${Date.now()}`,
      type: item.badge.includes("STRENGTH") ? "lift" : "run",
      title: item.title,
      primaryMetric: item.cals,
      isVerified: true,
    });
    Alert.alert("Shared to Feed!", "Your verified training memory has been posted to Sodia Feed.");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{item.badge}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={[styles.memoryTitle, { color: colors.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.memorySub, { color: colors.textMuted }]}>{item.venue} • {item.time}</Text>

            {/* KEY METRICS GRID */}
            <View style={[styles.metricsGrid, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <View style={styles.metricCol}>
                <Text style={styles.metricValHighlight}>{item.cals}</Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>ENERGY</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.borderColor }]} />
              <View style={styles.metricCol}>
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{item.duration}</Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>DURATION</Text>
              </View>
            </View>

            {/* TELEMETRY & BREAKDOWN */}
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Workout Telemetry & Notes</Text>
            <View style={[styles.telemetryCard, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <Text style={[styles.telemetryLine, { color: colors.textSecondary }]}>• Heart Rate Zone: 148 - 162 BPM (Aerobic Threshold)</Text>
              <Text style={[styles.telemetryLine, { color: colors.textSecondary }]}>• Verified GPS Location: Bonifacio Global City Loop</Text>
              <Text style={[styles.telemetryLine, { color: colors.textSecondary }]}>• Elevation Gain: +24m • Weather: 28°C Clear</Text>
              <Text style={[styles.telemetryLine, { color: colors.textSecondary }]}>• Recovery Score: 92% (High Readiness)</Text>
            </View>

            {/* ACTIONS */}
            <TouchableOpacity onPress={handleShareToFeed} style={styles.shareBtn}>
              <Send size={16} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.shareBtnText}>Share Stamp to Sodia Feed</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheetCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%", borderWidth: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  badgePill: { backgroundColor: "rgba(225, 29, 72, 0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgePillText: { color: "#E11D48", fontSize: 11, fontWeight: "900" },
  closeBtn: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: 24 },
  memoryTitle: { fontSize: 20, fontWeight: "900", marginBottom: 4 },
  memorySub: { fontSize: 12, marginBottom: 16 },
  metricsGrid: { flexDirection: "row", borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20, justifyContent: "space-around" },
  metricCol: { alignItems: "center" },
  metricValHighlight: { fontSize: 24, fontWeight: "900", color: "#E11D48" },
  metricVal: { fontSize: 24, fontWeight: "900" },
  metricLabel: { fontSize: 10, fontWeight: "700", marginTop: 4 },
  divider: { width: 1, height: 40 },
  sectionHeading: { fontSize: 14, fontWeight: "800", marginBottom: 8 },
  telemetryCard: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 8, marginBottom: 20 },
  telemetryLine: { fontSize: 12, lineHeight: 18 },
  shareBtn: { backgroundColor: "#E11D48", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14 },
  shareBtnText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
});
