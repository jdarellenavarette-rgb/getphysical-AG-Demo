import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, QrCode, ShieldCheck, RefreshCw } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { usePassTotp } from "../../hooks/usePassTotp";
import { QrCodeView } from "../common/QrCodeView";
import { useEdgeSwipeBack } from "../../hooks/useDismissGestures";

interface TurnstileQRModalProps {
  visible: boolean;
  onClose: () => void;
  facilityName: string;
  passId: string | null;
  /** Shown when the viewer is signed out; takes them to sign-in. */
  onSignIn?: () => void;
}

export function TurnstileQRModal({ visible, onClose, facilityName, passId, onSignIn }: TurnstileQRModalProps) {
  const insets = useSafeAreaInsets();
  const edgeBack = useEdgeSwipeBack(() => onClose());
  const { colors } = useThemeStore();
  const totpState = usePassTotp(passId, visible);
  const totp = totpState.status === "ready" ? totpState.totp : null;
  const statusText =
    totpState.status === "signed_out"
      ? "Sign in to activate your pass"
      : totpState.status === "unavailable"
        ? "No active pass to show"
        : totpState.status === "loading"
          ? "Loading secure code…"
          : `Refreshes in ${totpState.totp.remainingSeconds}s${totpState.offline ? " • offline" : ""}`;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View {...edgeBack} style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        {/* TOP BAR */}
        <View
          style={[
            styles.topBar,
            {
              paddingTop: insets.top + 10,
              backgroundColor: colors.bgHeader,
              borderBottomColor: colors.borderColor,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>ENTRY PASS</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.venueBadge}>
            <Text style={[styles.venueName, { color: colors.textPrimary }]}>{facilityName}</Text>
            <Text style={[styles.venueSub, { color: colors.textMuted }]}>Show this code at the front desk or gate</Text>
          </View>

          {/* QR CODE DISPLAY BOX */}
          <View style={styles.qrCard}>
            {totp ? (
              <QrCodeView value={totp.qrPayload} size={190} accessibilityLabel="Membership entry QR code" />
            ) : (
              <QrCode size={190} color="#D4D4D8" />
            )}
            <Text style={styles.tokenText}>{totp ? `${totp.code.slice(0, 3)} ${totp.code.slice(3)}` : "––– –––"}</Text>
            <View style={styles.timerRow}>
              <RefreshCw size={12} color="#10B981" />
              <Text style={styles.timerText}>{statusText}</Text>
            </View>
          </View>

          {/* SECURITY NOTICE */}
          <View style={styles.securityBox}>
            <ShieldCheck size={16} color="#10B981" />
            <Text style={styles.securityText}>
              This code changes every 60 seconds, so a screenshot will not work at the gate.
            </Text>
          </View>

          {totpState.status === "signed_out" && onSignIn ? (
            <TouchableOpacity onPress={onSignIn} style={styles.doneBtn} accessibilityRole="button">
              <Text style={styles.doneBtnText}>Sign In to Activate</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={onClose} style={styles.doneBtn} accessibilityRole="button">
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingVertical: 4 },
  backBtnText: { fontSize: 13, fontWeight: "700" },
  headerTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 0.8 },
  content: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
  venueBadge: { alignItems: "center", marginBottom: 24 },
  venueName: { fontSize: 20, fontWeight: "900" },
  venueSub: { fontSize: 12, marginTop: 4 },
  qrCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  tokenText: { color: "#09090B", fontSize: 22, fontWeight: "900", letterSpacing: 4, marginTop: 14 },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  timerText: { color: "#10B981", fontSize: 11, fontWeight: "700" },
  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
    maxWidth: 300,
  },
  securityText: { color: "#10B981", fontSize: 11, flex: 1, lineHeight: 16 },
  doneBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 20 },
  doneBtnText: { color: "#E11D48", fontSize: 13, fontWeight: "700" },
});
