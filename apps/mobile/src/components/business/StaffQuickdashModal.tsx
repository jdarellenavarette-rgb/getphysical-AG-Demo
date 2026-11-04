import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, QrCode, CheckCircle2, XCircle, Clock, Shield } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

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
  const { colors } = useThemeStore();
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
        name: "Darelle Navarette",
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
        detail: "Entry Denied: Expired Single-Day Pass",
      };
    }

    setScanLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        {/* HEADER BAR */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 50) + 10, backgroundColor: colors.bgHeader, borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.textPrimary} />
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Settings</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Shield size={12} color="#10B981" />
            <Text style={styles.badgeText}>STAFF SCANNER ACTIVE</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* VENUE CARD */}
          <View style={[styles.venueCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={[styles.venueTitle, { color: colors.textPrimary }]}>Metro Core Arena • Turnstile Station #1</Text>
            <Text style={[styles.venueSub, { color: colors.textMuted }]}>Hardware TOTP & DTR Attendance Validator</Text>
          </View>

          {/* SIMULATED CAMERA SCANNER VIEWPORT */}
          <View
            style={[
              styles.viewportBox,
              { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor },
              lastScanResult === "GREEN" && styles.viewportGreen,
              lastScanResult === "BLUE" && styles.viewportBlue,
              lastScanResult === "RED" && styles.viewportRed,
            ]}
          >
            {lastScanResult === "GREEN" && <CheckCircle2 size={44} color="#10B981" />}
            {lastScanResult === "BLUE" && <Clock size={44} color="#3B82F6" />}
            {lastScanResult === "RED" && <XCircle size={44} color="#E11D48" />}
            {!lastScanResult && <QrCode size={44} color={colors.textMuted} />}

            <Text style={[styles.viewportStatus, { color: colors.textPrimary }]}>
              {lastScanResult === "GREEN" && "GATE UNLOCKED • ACCESS GRANTED"}
              {lastScanResult === "BLUE" && "STAFF CLOCKED IN (DTR RECORDED)"}
              {lastScanResult === "RED" && "ACCESS DENIED • EXPIRED PASS"}
              {!lastScanResult && "POINT CAMERA AT MEMBER TOTP QR"}
            </Text>
          </View>

          {/* SIMULATOR QUICK ACTIONS */}
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>TEST TURNSTILE TRIGGERS</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => handleSimulateScan("GREEN")} style={[styles.scanTriggerBtn, { backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "#10B981" }]}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={[styles.scanTriggerText, { color: "#10B981" }]}>Member Access (Gate Unlock)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSimulateScan("BLUE")} style={[styles.scanTriggerBtn, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "#3B82F6" }]}>
              <Clock size={16} color="#3B82F6" />
              <Text style={[styles.scanTriggerText, { color: "#3B82F6" }]}>Staff DTR Clock-In</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSimulateScan("RED")} style={[styles.scanTriggerBtn, { backgroundColor: "rgba(225, 29, 72, 0.15)", borderColor: "#E11D48" }]}>
              <XCircle size={16} color="#E11D48" />
              <Text style={[styles.scanTriggerText, { color: "#E11D48" }]}>Invalid Pass (Red)</Text>
            </TouchableOpacity>
          </View>

          {/* SCAN LOGS */}
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>RECENT TURNSTILE EVENTS ({scanLogs.length})</Text>
          {scanLogs.length === 0 ? (
            <View style={[styles.emptyLogBox, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              <Shield size={28} color={colors.textMuted} />
              <Text style={[styles.emptyLogTitle, { color: colors.textPrimary }]}>No scan events yet</Text>
              <Text style={[styles.emptyLogSub, { color: colors.textMuted }]}>Tap one of the simulate buttons above to test gate unlocking.</Text>
            </View>
          ) : (
            scanLogs.map((log) => (
              <View key={log.id} style={[styles.logRow, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
                <View style={styles.logLeft}>
                  <Text style={[styles.logName, { color: colors.textPrimary }]}>{log.name}</Text>
                  <Text style={[styles.logDetail, { color: colors.textMuted }]}>{log.detail}</Text>
                </View>
                <Text style={[styles.logTime, { color: colors.textMuted }]}>{log.time}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingVertical: 4 },
  backBtnText: { fontSize: 13, fontWeight: "700" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  content: { padding: 16 },
  venueCard: { borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1 },
  venueTitle: { fontSize: 14, fontWeight: "800" },
  venueSub: { fontSize: 11, marginTop: 4 },
  viewportBox: { height: 180, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 2, borderStyle: "dashed", overflow: "hidden", marginBottom: 16 },
  viewportGreen: { borderColor: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.08)" },
  viewportBlue: { borderColor: "#3B82F6", backgroundColor: "rgba(59, 130, 246, 0.08)" },
  viewportRed: { borderColor: "#E11D48", backgroundColor: "rgba(225, 29, 72, 0.08)" },
  viewportStatus: { fontSize: 12, fontWeight: "800", marginTop: 12, letterSpacing: 0.5 },
  sectionHeader: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  actionRow: { gap: 8, marginBottom: 16 },
  scanTriggerBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, padding: 12 },
  scanTriggerText: { fontSize: 13, fontWeight: "700" },
  emptyLogBox: { borderRadius: 12, padding: 24, alignItems: "center", borderWidth: 1 },
  emptyLogTitle: { fontSize: 13, fontWeight: "700", marginTop: 8 },
  emptyLogSub: { fontSize: 11, textAlign: "center", marginTop: 4 },
  logRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1 },
  logLeft: { flex: 1, marginRight: 8 },
  logName: { fontSize: 13, fontWeight: "700" },
  logDetail: { fontSize: 11, marginTop: 2 },
  logTime: { fontSize: 11, fontWeight: "600" },
});
