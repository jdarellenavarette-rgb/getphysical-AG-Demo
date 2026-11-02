import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { ArrowLeft, CheckCircle2, ShieldCheck, Download, Share2 } from "lucide-react-native";
import type { PassRow } from "sodia-core";

interface ReceiptModalProps {
  visible: boolean;
  pass: PassRow | null;
  onClose: () => void;
}

export function ReceiptModal({ visible, pass, onClose }: ReceiptModalProps) {
  if (!pass) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* HEADER BAR */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <ArrowLeft size={18} color="#FAFAFA" />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>OFFICIAL RECEIPT</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* SUCCESS BANNER */}
            <View style={styles.successBanner}>
              <CheckCircle2 size={36} color="#10B981" />
              <Text style={styles.bannerTitle}>PAYMENT SETTLED</Text>
              <Text style={styles.bannerSub}>Immutable Sodia Ledger Record</Text>
            </View>

            {/* RECEIPT TICKET */}
            <View style={styles.receiptBox}>
              <View style={styles.row}>
                <Text style={styles.label}>Item / Pass</Text>
                <Text style={styles.valueBold}>{pass.pass_type}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Venue</Text>
                <Text style={styles.value}>Metro Core Arena</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Transaction ID</Text>
                <Text style={styles.monoValue}>TX-{pass.id.toUpperCase().slice(0, 12)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Issued Date</Text>
                <Text style={styles.value}>{pass.created_at ? new Date(pass.created_at).toLocaleString() : "Just now"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Valid Until</Text>
                <Text style={styles.value}>{pass.valid_until ? new Date(pass.valid_until).toLocaleDateString() : "Lifetime"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Payment Rail</Text>
                <Text style={styles.value}>GCash / Biometric Auth</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>Subtotal Base</Text>
                <Text style={styles.value}>₱250.00</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Sodia Hybrid Fee</Text>
                <Text style={styles.value}>₱15.00</Text>
              </View>
              <View style={[styles.row, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Charged</Text>
                <Text style={styles.totalValue}>₱265.00</Text>
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
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  sheetContainer: { backgroundColor: "#121215", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%", minHeight: "55%", borderWidth: 1, borderColor: "#27272A" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#1E1E24" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, minWidth: 60, justifyContent: "center" },
  backBtnText: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  headerTitle: { color: "#FAFAFA", fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  content: { padding: 18 },
  successBanner: { alignItems: "center", marginBottom: 18 },
  bannerTitle: { color: "#FAFAFA", fontSize: 16, fontWeight: "800", marginTop: 8 },
  bannerSub: { color: "#71717A", fontSize: 11, marginTop: 2 },
  receiptBox: { backgroundColor: "#18181B", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#27272A" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  label: { color: "#A1A1AA", fontSize: 12 },
  value: { color: "#FAFAFA", fontSize: 12, fontWeight: "600" },
  valueBold: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
  monoValue: { color: "#10B981", fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#27272A", marginVertical: 8 },
  totalRow: { paddingTop: 6 },
  totalLabel: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  totalValue: { color: "#FAFAFA", fontSize: 18, fontWeight: "900" },
  securityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginVertical: 14 },
  securityText: { color: "#10B981", fontSize: 11, fontWeight: "600" },
  closeFullBtn: { backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4, marginBottom: 20 },
  closeFullText: { color: "#FAFAFA", fontSize: 14, fontWeight: "700" },
});