import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { QrCode, RotateCw, ShieldCheck, Zap } from "lucide-react-native";
import { generateDynamicPassTotp, type PassRow } from "sodia-core";
import { useEcosystemStore } from "../../store/ecosystemStore";

interface ExactVIPCardProps {
  pass: PassRow;
  facilityName: string;
}

export function ExactVIPCard({ pass, facilityName }: ExactVIPCardProps) {
  const { profile } = useEcosystemStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [totpData, setTotpData] = useState(() =>
    generateDynamicPassTotp(profile.id, pass.id, pass.facility_id ?? "fac_001")
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTotpData(
        generateDynamicPassTotp(profile.id, pass.id, pass.facility_id ?? "fac_001")
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [profile.id, pass.id, pass.facility_id]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setIsFlipped((prev) => !prev)}
      style={styles.cardContainer}
    >
      {!isFlipped ? (
        // FRONT FACE
        <View style={styles.frontFace}>
          <View style={styles.topRow}>
            <View style={styles.badgeRegistry}>
              <Text style={styles.badgeRegistryText}>REGISTRY A • COMMERCIAL</Text>
            </View>
            <ShieldCheck size={20} color="#10B981" />
          </View>

          <View style={styles.middleRow}>
            <Text style={styles.facilityName}>{facilityName}</Text>
            <Text style={styles.passType}>{pass.pass_type}</Text>
          </View>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.labelMuted}>MEMBER NAME</Text>
              <Text style={styles.memberName}>{profile.first_name} {profile.last_name}</Text>
            </View>
            <View style={styles.flipHintPill}>
              <RotateCw size={12} color="#FAFAFA" style={{ marginRight: 4 }} />
              <Text style={styles.flipHintText}>Tap to Flip QR</Text>
            </View>
          </View>
        </View>
      ) : (
        // BACK FACE (60s Dynamic Hash + Offline TOTP)
        <View style={styles.backFace}>
          <View style={styles.qrHeader}>
            <View style={styles.qrTickingRow}>
              <Zap size={14} color="#10B981" />
              <Text style={styles.qrTickingText}>
                DYNAMIC HASH • {totpData.remainingSeconds}s REMAINING
              </Text>
            </View>
            <Text style={styles.totpFallbackHeader}>OFFLINE TOTP FALLBACK</Text>
          </View>

          <View style={styles.qrBox}>
            <QrCode size={110} color="#09090B" />
          </View>

          <View style={styles.totpCodeContainer}>
            <Text style={styles.totpCodeText}>{totpData.formattedCode}</Text>
            <Text style={styles.totpSubtext}>
              Manual front-desk entry code for offline scanners
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 220,
    borderRadius: 20,
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#27272A",
    overflow: "hidden",
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  frontFace: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: "#121215",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeRegistry: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeRegistryText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  middleRow: {
    marginVertical: 12,
  },
  facilityName: {
    color: "#FAFAFA",
    fontSize: 22,
    fontWeight: "800",
  },
  passType: {
    color: "#A1A1AA",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  labelMuted: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  memberName: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  flipHintPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  flipHintText: {
    color: "#FAFAFA",
    fontSize: 11,
    fontWeight: "600",
  },
  backFace: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0C",
  },
  qrHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  qrTickingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qrTickingText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  totpFallbackHeader: {
    color: "#71717A",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  qrBox: {
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginVertical: 6,
  },
  totpCodeContainer: {
    alignItems: "center",
  },
  totpCodeText: {
    color: "#FAFAFA",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 4,
  },
  totpSubtext: {
    color: "#71717A",
    fontSize: 10,
    marginTop: 2,
  },
});
