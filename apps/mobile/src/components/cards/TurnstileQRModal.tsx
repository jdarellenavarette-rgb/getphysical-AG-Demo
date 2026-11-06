import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppModal } from "../common/AppModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, QrCode, ShieldCheck, RefreshCw } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

interface TurnstileQRModalProps {
  visible: boolean;
  onClose: () => void;
  facilityName?: string;
}

export function TurnstileQRModal({ visible, onClose, facilityName = "Metro Core Arena" }: TurnstileQRModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStore();
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [totpToken, setTotpToken] = useState("892 410");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (visible) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setTotpToken(`${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible]);

  return (
    <AppModal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        {/* TOP BAR */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 50) + 10, backgroundColor: colors.bgHeader, borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>TURNSTILE ACCESS</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.venueBadge}>
            <Text style={[styles.venueName, { color: colors.textPrimary }]}>{facilityName}</Text>
            <Text style={[styles.venueSub, { color: colors.textMuted }]}>Dynamic TOTP Hardware Pass • Gate Turnstile #1</Text>
          </View>

          {/* QR CODE DISPLAY BOX */}
          <View style={styles.qrCard}>
            <QrCode size={190} color="#09090B" />
            <Text style={styles.tokenText}>{totpToken}</Text>
            <View style={styles.timerRow}>
              <RefreshCw size={12} color={colors.accentGreen} />
              <Text style={styles.timerText}>Refreshes in {secondsRemaining}s</Text>
            </View>
          </View>

          {/* SECURITY NOTICE */}
          <View style={styles.securityBox}>
            <ShieldCheck size={16} color={colors.accentGreen} />
            <Text style={styles.securityText}>
              Screenshots are disabled. Dynamic 60-second rolling token protects against pass-sharing.
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Close & Return to Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingVertical: 4 },
  backBtnText: { fontSize: 13, fontWeight: "700" },
  headerTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 0.8 },
  content: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
  venueBadge: { alignItems: "center", marginBottom: 24 },
  venueName: { fontSize: 20, fontWeight: "900" },
  venueSub: { fontSize: 12, marginTop: 4 },
  qrCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, alignItems: "center", shadowColor: "#EC4899", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10 },
  tokenText: { color: "#09090B", fontSize: 22, fontWeight: "900", letterSpacing: 4, marginTop: 14 },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  timerText: { color: "#10B981", fontSize: 11, fontWeight: "700" },
  securityBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: 12, padding: 14, marginTop: 24, maxWidth: 300 },
  securityText: { color: "#10B981", fontSize: 11, flex: 1, lineHeight: 16 },
  doneBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 20 },
  doneBtnText: { color: "#E11D48", fontSize: 13, fontWeight: "700" },
});
