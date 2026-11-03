import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Ticket, FileText } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { PassRow } from "sodia-core";

interface StatementOfAccountModalProps {
  visible: boolean;
  passes: readonly PassRow[];
  onClose: () => void;
  onSelectPass: (pass: PassRow) => void;
}

export function StatementOfAccountModal({
  visible,
  passes,
  onClose,
  onSelectPass,
}: StatementOfAccountModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStore();
  const [filter, setFilter] = useState<"all" | "passes" | "courts">("all");

  const totalSpent = passes.length * 265;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        {/* HEADER BAR WITH SAFE NOTCH INSET */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 50) + 10, backgroundColor: colors.bgHeader, borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Cards Hub</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>STATEMENT OF ACCOUNT</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* LEDGER OVERVIEW CARD */}
          <View style={[styles.summaryCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>TOTAL EXPENDITURE (CURRENT MONTH)</Text>
            <Text style={[styles.summaryAmount, { color: colors.textPrimary }]}>₱{totalSpent.toFixed(2)}</Text>
            <View style={styles.summaryMetaRow}>
              <Text style={styles.summaryMeta}>{passes.length} Settled Transactions</Text>
              <Text style={styles.summaryMeta}>• Zero Failed Invoices</Text>
            </View>
          </View>

          {/* FILTER ROW */}
          <View style={styles.filterRow}>
            {(["all", "passes", "courts"] as const).map((fil) => (
              <TouchableOpacity
                key={fil}
                onPress={() => setFilter(fil)}
                style={[styles.filterPill, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }, filter === fil && styles.filterPillActive]}
              >
                <Text style={[styles.filterText, { color: colors.textMuted }, filter === fil && styles.filterTextActive]}>
                  {fil === "all" ? `All (${passes.length})` : fil === "passes" ? "Day Passes" : "Courts & Meets"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TRANSACTION LIST OR EMPTY STATE */}
          {passes.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
              <Ticket size={36} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No transaction history</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                Your purchases, recurring memberships, and court splits will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.txList}>
              {passes.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => onSelectPass(p)}
                  style={[styles.txRow, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
                >
                  <View style={styles.txIconWrap}>
                    <FileText size={16} color="#EC4899" />
                  </View>
                  <View style={styles.txDetails}>
                    <Text style={[styles.txTitle, { color: colors.textPrimary }]}>{p.pass_type}</Text>
                    <Text style={[styles.txDate, { color: colors.textMuted }]}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "Active"} • Metro Core</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txPrice, { color: colors.textPrimary }]}>₱265.00</Text>
                    <Text style={styles.txStatus}>{p.status.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* FOOTER CLOSE BUTTON */}
          <TouchableOpacity onPress={onClose} style={[styles.footerBackBtn, { backgroundColor: colors.bgInput }]}>
            <Text style={[styles.footerBackText, { color: colors.textPrimary }]}>Close Statement</Text>
          </TouchableOpacity>
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
  headerTitle: { fontSize: 12, fontWeight: "900", letterSpacing: 0.8 },
  content: { padding: 16 },
  summaryCard: { borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1 },
  summaryLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  summaryAmount: { fontSize: 28, fontWeight: "900", marginTop: 6 },
  summaryMetaRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  summaryMeta: { color: "#10B981", fontSize: 11, fontWeight: "600" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  filterPill: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  filterPillActive: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  filterText: { fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: "#FAFAFA" },
  emptyCard: { borderRadius: 14, padding: 32, alignItems: "center", borderWidth: 1 },
  emptyTitle: { fontSize: 14, fontWeight: "700", marginTop: 10 },
  emptySub: { fontSize: 11, textAlign: "center", marginTop: 4, maxWidth: 260 },
  txList: { gap: 8, marginBottom: 16 },
  txRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1 },
  txIconWrap: { width: 34, height: 34, borderRadius: 8, backgroundColor: "rgba(236, 72, 153, 0.15)", alignItems: "center", justifyContent: "center" },
  txDetails: { flex: 1, marginLeft: 12 },
  txTitle: { fontSize: 13, fontWeight: "700" },
  txDate: { fontSize: 11, marginTop: 2 },
  txRight: { alignItems: "flex-end" },
  txPrice: { fontSize: 13, fontWeight: "800" },
  txStatus: { color: "#10B981", fontSize: 10, fontWeight: "800", marginTop: 2 },
  footerBackBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 8, marginBottom: 24 },
  footerBackText: { fontSize: 13, fontWeight: "700" },
});
