import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, QrCode, CheckCircle2, XCircle, Clock, Shield, Sparkles } from "lucide-react-native";

interface StaffQuickdashModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ScanLog {
  id: string;
  name: string;
  type: "MEMBER_ENTRY" | "STAFF_DTR" | "ACCESS_DENIED";
  time: string;
  detail: string;
}

export function StaffQuickdashModal({ visible, onClose }: StaffQuickdashModalProps) {
  const insets = useSafeAreaInsets();
  const [lastScanResult, setLastScanResult] = useState<"GREEN" | "BLUE" | "RED" | null>(null);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);

  const handleSimulateScan = (type: "GREEN" | "BLUE" | "RED") => {
    setLastScanResult(type);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    let newLog: ScanLog;
    if (type === "GREEN") {
      newLog = {
        id: `scan_${Date.now()}`,
        name: "Adam Arête",
        type: "MEMBER_ENTRY",
        time: timeStr,
        detail: "VIP Monthly • Turnstile Gate A Unlocked (TOTP Verified)",
      };
    } else if (type === "BLUE") {
      newLog = {
        id: `scan_${Date.now()}`,
        name: "Staff: Honzel C.",
        type: "STAFF_DTR",
        time: timeStr,
        detail: "DTR In-Clock Verified • Front Desk Station #1",
      };
    } else {
      newLog = {
        id: `scan_${Date.now()}`,
        name: "Guest (Pass Expired)",
        type: "ACCESS_DENIED",
        time: timeStr,
        detail: "Denied • Pass expired 2 days ago. Prompting desk payment.",
      };
    }

    setScanLogs((prev) => [newLog, ...prev]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* HEADER BAR WITH SAFE NOTCH INSET */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 50) + 10 }]}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="#FAFAFA" />
            <Text style={styles.backBtnText}>Back to Athlete App</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Sparkles size={12} color="#10B981" />
            <Text style={styles.badgeText}>STAFF SCANNER</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* VENUE STATION BANNER */}
          <View style={styles.venueCard}>
            <Text style={styles.venueTitle}>Metro Core Arena • Front Desk Turnstile #1</Text>
            <Text style={styles.venueSub}>Hardware Scanner Mode • 60s Dynamic Rolling TOTP Check</Text>
          </View>

          {/* SIMULATED CAMERA / SCANNER VIEWPORT */}
          <View
            style={[
              styles.viewportBox,
              lastScanResult === "GREEN" && styles.viewportGreen,
              lastScanResult === "BLUE" && styles.viewportBlue,
              lastScanResult === "RED" && styles.viewportRed,
            ]}
          >
            <QrCode size={56} color={lastScanResult === "GREEN" ? "#10B981" : lastScanResult === "BLUE" ? "#3B82F6" : lastScanResult === "RED" ? "#E11D48" : "#71717A"} />
            <Text style={styles.viewportStatus}>
              {lastScanResult === "GREEN"
                ? "✓ ACCESS GRANTED — GATE UNLOCKED"
                : lastScanResult === "BLUE"
                ? "✓ STAFF DTR CLOCK-IN RECORDED"
                : lastScanResult === "RED"
                ? "✕ ACCESS DENIED — EXPIRED / INVALID"
                : "READY TO SCAN DYNAMIC TOTP QR"}
            </Text>
            <View style={styles.laserLine} />
          </View>

          {/* QUICK TRIGGER BUTTONS FOR DEMO / QA */}
          <Text style={styles.sectionHeader}>SIMULATE SCAN EVENTS</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => handleSimulateScan("GREEN")} style={[styles.scanTriggerBtn, { backgroundColor: "rgba(16, 185, 129, 0.2)", borderColor: "#10B981" }]}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={[styles.scanTriggerText, { color: "#10B981" }]}>Member Access (Green)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSimulateScan("BLUE")} style={[styles.scanTriggerBtn, { backgroundColor: "rgba(59, 130, 246, 0.2)", borderColor: "#3B82F6" }]}>
              <Clock size={16} color="#3B82F6" />
              <Text style={[styles.scanTriggerText, { color: "#3B82F6" }]}>Staff DTR Clock (Blue)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSimulateScan("RED")} style={[styles.scanTriggerBtn, { backgroundColor: "rgba(225, 29, 72, 0.2)", borderColor: "#E11D48" }]}>
              <XCircle size={16} color="#E11D48" />
              <Text style={[styles.scanTriggerText, { color: "#E11D48" }]}>Invalid Pass (Red)</Text>
            </TouchableOpacity>
          </View>

          {/* SCAN LOGS */}
          <Text style={styles.sectionHeader}>RECENT TURNSTILE EVENTS ({scanLogs.length})</Text>
          {scanLogs.length === 0 ? (
            <View style={styles.emptyLogBox}>
              <Shield size={28} color="#71717A" />
              <Text style={styles.emptyLogTitle}>No scan events yet</Text>
              <Text style={styles.emptyLogSub}>Tap one of the simulate buttons above to test gate unlocking.</Text>
            </View>
          ) : (
            scanLogs.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <View style={styles.logLeft}>
                  <Text style={styles.logName}>{log.name}</Text>
                  <Text style={styles.logDetail}>{log.detail}</Text>
                </View>
                <Text style={styles.logTime}>{log.time}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingVertical: 4 },
  backBtnText: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  content: { padding: 16 },
  venueCard: { backgroundColor: "#121215", borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#18181B" },
  venueTitle: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  venueSub: { color: "#71717A", fontSize: 11, marginTop: 4 },
  viewportBox: { height: 180, backgroundColor: "#18181B", borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#27272A", borderStyle: "dashed", position: "relative", overflow: "hidden", marginBottom: 16 },
  viewportGreen: { borderColor: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.05)" },
  viewportBlue: { borderColor: "#3B82F6", backgroundColor: "rgba(59, 130, 246, 0.05)" },
  viewportRed: { borderColor: "#E11D48", backgroundColor: "rgba(225, 29, 72, 0.05)" },
  viewportStatus: { color: "#FAFAFA", fontSize: 12, fontWeight: "800", marginTop: 12, letterSpacing: 0.5 },
  laserLine: { position: "absolute", width: "80%", height: 2, backgroundColor: "#E11D48", top: "50%" },
  sectionHeader: { color: "#71717A", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  actionRow: { gap: 8, marginBottom: 16 },
  scanTriggerBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, padding: 12 },
  scanTriggerText: { fontSize: 13, fontWeight: "700" },
  emptyLogBox: { backgroundColor: "#121215", borderRadius: 12, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#18181B" },
  emptyLogTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "700", marginTop: 8 },
  emptyLogSub: { color: "#71717A", fontSize: 11, textAlign: "center", marginTop: 4 },
  logRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#121215", borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#18181B" },
  logLeft: { flex: 1, marginRight: 8 },
  logName: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  logDetail: { color: "#71717A", fontSize: 11, marginTop: 2 },
  logTime: { color: "#A1A1AA", fontSize: 11, fontWeight: "600" },
});