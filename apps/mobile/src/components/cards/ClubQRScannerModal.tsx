import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X, Zap, ZapOff, QrCode, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";

interface ClubQRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccessJoined?: (clubName: string) => void;
}

export function ClubQRScannerModal({ visible, onClose, onSuccessJoined }: ClubQRScannerModalProps) {
  const { colors } = useThemeStore();
  const { provisionPass } = useEcosystemStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
    if (visible) {
      setScanned(false);
    }
  }, [visible, permission?.granted]);

  const handleJoinClub = (clubName: string, passType: string, price: number) => {
    if (scanned) return;
    setScanned(true);

    const facilityId = `fac_${clubName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    provisionPass(clubName, "recurring_subscription", price, passType, facilityId);

    Alert.alert(
      "Club Membership Activated!",
      `Welcome to ${clubName}! Your VIP digital pass has been provisioned to your wallet with dynamic 60s TOTP turnstile access.`,
      [
        {
          text: "Open Wallet Pass",
          onPress: () => {
            onSuccessJoined?.(clubName);
            onClose();
          },
        },
      ]
    );
  };

  const handleBarcodeScanned = (scanningResult: { data: string }) => {
    if (scanned) return;
    const data = scanningResult.data;
    if (data.includes("equinox") || data.toLowerCase().includes("equinox")) {
      handleJoinClub("Equinox High-Performance", "Elite Tier Pass", 195);
    } else if (data.includes("padel") || data.toLowerCase().includes("padel")) {
      handleJoinClub("Metro Padel & Tennis Club", "All-Court Access", 85);
    } else {
      handleJoinClub("Titan Performance Club", "VIP All-Access Pass", 120);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            enableTorch={flash === "on"}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
        ) : (
          <View style={[styles.permissionFallback, { backgroundColor: "#0A0A0A" }]}>
            <QrCode size={64} color="#E11D48" />
            <Text style={styles.fallbackTitle}>Camera Access Required</Text>
            <Text style={styles.fallbackSubtitle}>
              Grant camera access to scan club turnstiles or select a demo club below to join.
            </Text>
            <TouchableOpacity onPress={requestPermission} style={styles.reqBtn}>
              <Text style={styles.reqBtnText}>Grant Camera Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconCircle}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <QrCode size={16} color="#10B981" />
            <Text style={styles.headerTitle}>Scan Club QR</Text>
          </View>
          <TouchableOpacity onPress={() => setFlash((f) => (f === "on" ? "off" : "on"))} style={styles.iconCircle}>
            {flash === "on" ? <Zap size={20} color="#FBBF24" /> : <ZapOff size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        {/* SCANNER RETICLE */}
        <View style={styles.reticleContainer}>
          <View style={styles.reticleFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={styles.scanLaser} />
          </View>
          <Text style={styles.reticleHint}>Align club QR code inside the frame</Text>
        </View>

        {/* BOTTOM DEMO / SIMULATION SHELF */}
        <View style={styles.bottomSheet}>
          <View style={styles.demoHeader}>
            <Sparkles size={14} color="#10B981" />
            <Text style={styles.demoTitle}>Test / Instant Join Club QR</Text>
          </View>
          <View style={styles.clubPillsRow}>
            {[
              { name: "Titan Performance Club", pass: "VIP All-Access", price: 120 },
              { name: "Equinox High-Performance", pass: "Elite Club Pass", price: 195 },
              { name: "Metro Padel & Tennis Club", pass: "Court Pass", price: 85 },
            ].map((club) => (
              <TouchableOpacity
                key={club.name}
                onPress={() => handleJoinClub(club.name, club.pass, club.price)}
                style={styles.clubPill}
              >
                <CheckCircle2 size={13} color="#10B981" />
                <Text style={styles.clubPillText}>{club.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.footerRow}>
            <ShieldCheck size={12} color="#8E8E93" />
            <Text style={styles.footerText}>Instant wallet pass provisioning • 60s dynamic TOTP</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  permissionFallback: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  fallbackTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginTop: 14 },
  fallbackSubtitle: { color: "#8E8E93", fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 18, maxWidth: 300 },
  reqBtn: { backgroundColor: "#E11D48", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 18 },
  reqBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 52, paddingHorizontal: 20, zIndex: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  headerTitleWrap: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  headerTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  reticleContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  reticleFrame: { width: 250, height: 250, position: "relative", justifyContent: "center", alignItems: "center" },
  corner: { position: "absolute", width: 28, height: 28, borderColor: "#10B981" },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  scanLaser: { width: "90%", height: 2, backgroundColor: "#E11D48", shadowColor: "#E11D48", shadowOpacity: 0.8, shadowRadius: 6 },
  reticleHint: { color: "#FFFFFF", fontSize: 13, fontWeight: "600", marginTop: 20, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  bottomSheet: { backgroundColor: "rgba(18,18,18,0.92)", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 36, zIndex: 10 },
  demoHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  demoTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  clubPillsRow: { gap: 8 },
  clubPill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  clubPillText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  footerText: { color: "#8E8E93", fontSize: 10, fontWeight: "600" },
});
