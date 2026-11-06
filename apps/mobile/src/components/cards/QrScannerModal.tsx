import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { CheckCircle2, Info, QrCode, ShieldCheck, X, XCircle, Zap, ZapOff } from "lucide-react-native";
import { useQrScanner, type ScanState } from "../../hooks/useQrScanner";
import { facilityLink } from "../../lib/appLinks";

interface QrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

const KIND_LABEL = { USER: "Athlete", COACH: "Coach", ORGANIZER: "Organizer", FACILITY: "Facility", EVENT: "Event" } as const;
const KIND_ACTION = { USER: "Follow", COACH: "Request to enrol", ORGANIZER: "Follow", FACILITY: "Join / view", EVENT: "Register" } as const;

/**
 * Universal GetPhysical scanner: friend / coach / organizer / facility / event
 * codes (preview → confirm → redeem) and, for staff, membership-card check-in.
 */
export function QrScannerModal({ visible, onClose, title = "Scan QR" }: QrScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<"off" | "on">("off");
  const { state, onScan, confirm, reset } = useQrScanner();

  useEffect(() => {
    if (visible) {
      reset();
      if (permission && !permission.granted && permission.canAskAgain) void requestPermission();
    }
  }, [visible, permission?.granted]);

  const scanning = state.phase === "scanning";

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            enableTorch={flash === "on"}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanning ? ({ data }) => void onScan(data) : undefined}
          />
        ) : (
          <View style={styles.permissionFallback}>
            <QrCode size={64} color="#E11D48" />
            <Text style={styles.fallbackTitle}>Camera access needed</Text>
            <Text style={styles.fallbackSubtitle}>Allow camera access to scan GetPhysical QR codes.</Text>
            <TouchableOpacity
              onPress={() => (permission?.canAskAgain === false ? void Linking.openSettings() : void requestPermission())}
              style={styles.reqBtn}
              accessibilityRole="button"
            >
              <Text style={styles.reqBtnText}>{permission?.canAskAgain === false ? "Open Settings" : "Allow camera"}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconCircle} accessibilityLabel="Close scanner">
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <QrCode size={16} color="#10B981" />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <TouchableOpacity onPress={() => setFlash((f) => (f === "on" ? "off" : "on"))} style={styles.iconCircle} accessibilityLabel="Toggle flashlight">
            {flash === "on" ? <Zap size={20} color="#FBBF24" /> : <ZapOff size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        <View style={styles.reticleContainer}>
          <View style={styles.reticleFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            {scanning && <View style={styles.scanLaser} />}
          </View>
          <Text style={styles.reticleHint}>Point at a GetPhysical QR code</Text>
        </View>

        <View style={styles.bottomSheet}>
          <ScanPanel state={state} onConfirm={() => void confirm()} onReset={reset} onClose={onClose} />
          <View style={styles.footerRow}>
            <ShieldCheck size={12} color="#8E8E93" />
            <Text style={styles.footerText}>Codes are verified by GetPhysical before anything happens</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ScanPanel({ state, onConfirm, onReset, onClose }: { state: ScanState; onConfirm: () => void; onReset: () => void; onClose: () => void }) {
  if (state.phase === "scanning") {
    return <Text style={styles.panelText}>Friends, coaches, clubs, gyms and events all have a GetPhysical code.</Text>;
  }
  if (state.phase === "working") {
    return (
      <View style={styles.panelRow}>
        <ActivityIndicator color="#FFFFFF" />
        <Text style={styles.panelTitle}>{state.label}</Text>
      </View>
    );
  }
  if (state.phase === "preview") {
    const { kind, subject } = state.preview;
    const image = subject.avatar_url ?? subject.logo_url ?? null;
    return (
      <View>
        <View style={styles.panelRow}>
          {image ? <Image source={{ uri: image }} style={styles.avatar} /> : <View style={styles.avatar} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.panelTitle} numberOfLines={1}>{subject.name ?? subject.title ?? "GetPhysical"}</Text>
            <Text style={styles.panelText} numberOfLines={2}>
              {KIND_LABEL[kind]}
              {subject.username ? ` · @${subject.username}` : ""}
              {subject.starts_at ? ` · ${new Date(subject.starts_at).toLocaleString()}` : ""}
              {typeof subject.spots_left === "number" ? ` · ${subject.spots_left} spots left` : ""}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onReset} style={styles.secondaryBtn}><Text style={styles.btnText}>Cancel</Text></TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} style={styles.primaryBtn}><Text style={styles.btnText}>{KIND_ACTION[kind]}</Text></TouchableOpacity>
        </View>
      </View>
    );
  }
  const Icon = state.tone === "success" ? CheckCircle2 : state.tone === "info" ? Info : XCircle;
  const color = state.tone === "success" ? "#10B981" : state.tone === "info" ? "#60A5FA" : "#F87171";
  return (
    <View>
      <View style={styles.panelRow}>
        <Icon size={28} color={color} />
        <View style={{ flex: 1 }}>
          <Text style={styles.panelTitle}>{state.title}</Text>
          <Text style={styles.panelText}>{state.message}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onReset} style={styles.secondaryBtn}><Text style={styles.btnText}>Scan another</Text></TouchableOpacity>
        {state.facilitySlug ? (
          <TouchableOpacity onPress={() => void Linking.openURL(facilityLink(state.facilitySlug!))} style={styles.primaryBtn}>
            <Text style={styles.btnText}>View passes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onClose} style={styles.primaryBtn}><Text style={styles.btnText}>Done</Text></TouchableOpacity>
        )}
      </View>
    </View>
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
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  footerText: { color: "#8E8E93", fontSize: 10, fontWeight: "600" },
  panelRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#27272A" },
  panelTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  panelText: { color: "#A1A1AA", fontSize: 13, marginTop: 4, lineHeight: 18 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryBtn: { flex: 1, backgroundColor: "#E11D48", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  secondaryBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.08)", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
});
