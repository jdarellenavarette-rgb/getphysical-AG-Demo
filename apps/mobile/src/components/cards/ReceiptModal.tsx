import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { PassRow } from "sodia-core";

interface ReceiptModalProps {
  visible: boolean;
  pass: PassRow | null;
  onClose: () => void;
}

export function ReceiptModal({ visible, pass, onClose }: ReceiptModalProps) {
  const { colors } = useThemeStore();
  if (!pass) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {/* HEADER BAR */}
          <View style={[styles.topBar, { borderBottomColor: colors.borderColor }]}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <ArrowLeft size={18} color={colors.textPrimary} />
              <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>OFFICIAL RECEIPT</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* SUCCESS BANNER */}
            <View style={styles.successBanner}>
              <CheckCircle2 size={36} color="#10B981" />
              <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>PAYMENT SETTLED</Text>
              <Text style={[styles.bannerSub, { color: colors.textMuted }]}>Immutable Sodia Ledger Record</Text>
            </View>

            {/* RECEIPT TICKET */}
            <View style={[styles.receiptBox, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Item / Pass</Text>
                <Text style={[styles.valueBold, { color: colors.textPrimary }]}>{pass.pass_type}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Venue</Text>
                <Text style={[styles.value, { color: colors.textPrimary }]}>Metro Core Arena</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Transaction ID</Text>
                <Text style={styles.monoValue}>TX-{pass.id.toUpperCase().slice(0, 12)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Issued Date</Text>
                <Text style={[styles.value, { color: colors.textPrimary }]}>{pass.created_at ? new Date(pass.created_at).toLocaleString() : "Just now"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Valid Until</Text>
                <Text style={[styles.value, { color: colors.textPrimary }]}>{pass.valid_until ? new Date(pass.valid_until).toLocaleDateString() : "Lifetime"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Payment Rail</Text>
                <Text style={[styles.value, { color: colors.textPrimary }]}>GCash / Biometric Auth</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderColor }]} />

              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Subtotal Base</Text>
                <Text style={[styles.value, { color: colors.textPrimary }]}>₱250.00</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Sodia Hybrid Fee</Text>
                <Text style={[styles.value, { color: colors.textPrimary }]}>₱15.00</Text>
              </View>
              <View style={[styles.row, styles.totalRow]}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total Charged</Text>
                <Text style={[styles.totalValue, { color: colors.accent }]}>₱265.00</Text>
              </View>
            </View>

            {/* SECURITY WATERMARK */}
            <View style={styles.securityRow}>
              <ShieldCheck size={14} color="#10B981" />
              <Text style={styles.securityText}>Verified TOTP Dynamic Key Provisioned</Text>
            </View>

            {/* BACK / CLOSE BUTTON */}
            <TouchableOpacity onPress={onClose} style={styles.closeFullBtn}>
              <Text style={styles.closeFullText}>Done & Return to Wallet</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheetContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%", minHeight: "55%", borderWidth: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, minWidth: 60, justifyContent: "center" },
  backBtnText: { fontSize: 13, fontWeight: "700" },
  headerTitle: { fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  content: { padding: 18 },
  successBanner: { alignItems: "center", marginBottom: 18 },
  bannerTitle: { fontSize: 16, fontWeight: "800", marginTop: 8 },
  bannerSub: { fontSize: 11, marginTop: 2 },
  receiptBox: { borderRadius: 14, padding: 16, borderWidth: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  label: { fontSize: 12 },
  value: { fontSize: 12, fontWeight: "600" },
  valueBold: { fontSize: 13, fontWeight: "800" },
  monoValue: { color: "#10B981", fontSize: 11, fontWeight: "700" },
  divider: { height: 1, marginVertical: 8 },
  totalRow: { paddingTop: 6 },
  totalLabel: { fontSize: 14, fontWeight: "800" },
  totalValue: { fontSize: 18, fontWeight: "900" },
  securityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginVertical: 14 },
  securityText: { color: "#10B981", fontSize: 11, fontWeight: "600" },
  closeFullBtn: { backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4, marginBottom: 20 },
  closeFullText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
