import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { QrCode, RotateCw, Zap, Radio } from "lucide-react-native";
import { generateDynamicPassTotp, MOTION, type PassRow } from "sodia-core";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { haptics } from "../../lib/haptics";

interface ExactVIPCardProps {
  pass: PassRow;
  facilityName: string;
}

/**
 * Apple-Wallet-style pass. Back face shows the 60s rolling TOTP generated
 * locally from sodia-core (works offline; no server ping — AGENTS.md §7).
 */
export function ExactVIPCard({ pass, facilityName }: ExactVIPCardProps) {
  const profile = useEcosystemStore((s) => s.profile);
  const [isFlipped, setIsFlipped] = useState(false);
  const flip = useSharedValue(0);
  const [totpData, setTotpData] = useState(() => generateDynamicPassTotp(profile.id, pass.id, pass.facility_id ?? "fac_001"));

  useEffect(() => {
    const timer = setInterval(() => {
      setTotpData(generateDynamicPassTotp(profile.id, pass.id, pass.facility_id ?? "fac_001"));
    }, 1000);
    return () => clearInterval(timer);
  }, [profile.id, pass.id, pass.facility_id]);

  const toggle = () => {
    haptics.medium();
    const next = !isFlipped;
    setIsFlipped(next);
    flip.value = withTiming(next ? 1 : 0, { duration: MOTION.slowMs + 120 });
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={toggle}
      style={styles.cardContainer}
      accessibilityRole="button"
      accessibilityLabel={
        isFlipped
          ? `Entry code ${totpData.formattedCode.split("").join(" ")}, refreshes in ${totpData.remainingSeconds} seconds. Tap to show card front.`
          : `${facilityName} ${pass.pass_type} pass. Tap to show entry code.`
      }
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.face, frontStyle]} pointerEvents="none">
        <View style={styles.frontFace}>
          {/* TOP ROW: CHIP + NFC + REGISTRY BADGE */}
          <View style={styles.topRow}>
            <View style={styles.chipRow}>
              <View style={styles.metallicChip}>
                <View style={styles.chipInnerGrid} />
              </View>
              <Radio size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: 8 }} />
            </View>
            <View style={styles.gpLogoWrap}>
              <Text style={styles.gpLogoText}>GP</Text>
              <Text style={styles.vipTag}>VIP</Text>
            </View>
          </View>

          {/* MIDDLE: FACILITY & PASS */}
          <View style={styles.middleRow}>
            <Text style={styles.facilityName}>{facilityName}</Text>
            <Text style={styles.passType}>{pass.pass_type.toUpperCase()}</Text>
          </View>

          {/* BOTTOM ROW: MEMBER CREDENTIALS & FLIP ACTION */}
          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.labelMuted}>VIP ATHLETE</Text>
              <Text style={styles.memberName}>{profile.name ?? "Darelle Navarette"}</Text>
            </View>
            <View style={styles.flipPill}>
              <RotateCw size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.flipPillText}>TOTP Turnstile</Text>
            </View>
          </View>
        </View>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.face, backStyle]} pointerEvents="none">
        <View style={styles.backFace}>
          <View style={styles.qrHeader}>
            <View style={styles.qrTickingRow}>
              <Zap size={13} color="#10B981" />
              <Text style={styles.qrTickingText}>
                ROLLING KEY • {totpData.remainingSeconds}s REFRESH
              </Text>
            </View>
            <Text style={styles.totpFallbackHeader}>60-SEC HARDWARE TOTP</Text>
          </View>

          <View style={styles.qrBox}>
            <QrCode size={105} color="#09090B" />
          </View>

          <View style={styles.totpCodeContainer}>
            <Text style={styles.totpCodeText}>{totpData.formattedCode}</Text>
            <Text style={styles.totpSubtext}>
              Turnstile Gate A Scan • Touch to flip back
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  face: { backfaceVisibility: "hidden" },
  cardContainer: {
    height: 224,
    borderRadius: 24,
    backgroundColor: "#16161A",
    borderWidth: 1.5,
    borderColor: "rgba(236, 72, 153, 0.4)",
    marginHorizontal: 4,
    marginVertical: 10,
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  frontFace: {
    flex: 1,
    borderRadius: 23,
    overflow: "hidden",
    padding: 22,
    justifyContent: "space-between",
    backgroundColor: "#111115",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metallicChip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#D4AF37",
    borderWidth: 1,
    borderColor: "#F59E0B",
    padding: 3,
  },
  chipInnerGrid: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.25)",
    borderRadius: 3,
  },
  gpLogoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(225, 29, 72, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E11D48",
  },
  gpLogoText: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "900",
  },
  vipTag: {
    color: "#EC4899",
    fontSize: 11,
    fontWeight: "900",
  },
  middleRow: {
    marginVertical: 10,
  },
  facilityName: {
    color: "#FAFAFA",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  passType: {
    color: "#EC4899",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "800",
    letterSpacing: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  labelMuted: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  memberName: { color: "#FAFAFA", fontSize: 15, fontWeight: "800", marginTop: 2 },
  flipPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#27272A", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)" },
  flipPillText: { color: "#FAFAFA", fontSize: 11, fontWeight: "700" },
  backFace: { flex: 1, borderRadius: 23, overflow: "hidden", padding: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#0C0C0E" },
  qrHeader: { alignItems: "center", marginBottom: 6 },
  qrTickingRow: { flexDirection: "row", alignItems: "center" },
  qrTickingText: { color: "#10B981", fontSize: 11, fontWeight: "800", letterSpacing: 0.5, marginLeft: 4 },
  totpFallbackHeader: { color: "#A1A1AA", fontSize: 11, fontWeight: "700", marginTop: 1 },
  qrBox: { padding: 10, backgroundColor: "#FFFFFF", borderRadius: 14, marginVertical: 6 },
  totpCodeContainer: { alignItems: "center" },
  totpCodeText: { color: "#FAFAFA", fontSize: 22, fontWeight: "900", letterSpacing: 3 },
  totpSubtext: { color: "#A1A1AA", fontSize: 11, marginTop: 2 },
});