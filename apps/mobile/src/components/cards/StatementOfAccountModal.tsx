import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { ArrowLeft, Ticket, Calendar, Filter, FileText } from "lucide-react-native";
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
  const [filter, setFilter] = useState<"all" | "passes" | "courts">("all");

  const totalSpent = passes.length * 265;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* HEADER BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <ArrowLeft size={18} color="#FAFAFA" />
            <Text style={styles.backBtnText}>Cards Hub</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>STATEMENT OF ACCOUNT</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* LEDGER OVERVIEW CARD */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>TOTAL EXPENDITURE (CURRENT MONTH)</Text>
            <Text style={styles.summaryAmount}>₱{totalSpent.toFixed(2)}</Text>
            <View style={styles.summaryMetaRow}>
              <Text style={styles.summaryMeta}>{passes.length} Settled Transactions</Text>
              <Text style={styles.summaryMeta}>• Zero Failed Invoices</Text>
            </View>
          </View>

          {/* FILTER ROW */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => setFilter("all")}
              style={[styles.filterPill, filter === "all" && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
                All ({passes.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter("passes")}
              style={[styles.filterPill, filter === "passes" && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, filter === "passes" && styles.filterTextActive]}>
                Day Passes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter("courts")}
              style={[styles.filterPill, filter === "courts" && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, filter === "courts" && styles.filterTextActive]}>
                Courts & Meets
              </Text>
            </TouchableOpacity>
          </View>

          {/* TRANSACTION LIST OR EMPTY STATE */}
          {passes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ticket size={36} color="#71717A" />
              <Text style={styles.emptyTitle}>No transaction history</Text>
              <Text style={styles.emptySub}>
                Your purchases, recurring memberships, and court splits will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.txList}>
              {passes.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => onSelectPass(p)}
                  style={styles.txRow}
                >
                  <View style={styles.txIconWrap}>
                    <FileText size={16} color="#EC4899" />
                  </View>
                  <View style={styles.txDetails}>
                    <Text style={styles.txTitle}>{p.pass_type}</Text>
                    <Text style={styles.txDate}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "Active"} • Metro Core</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={styles.txPrice}>₱265.00</Text>
                    <Text style={styles.txStatus}>{p.status.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* FOOTER CLOSE BUTTON */}
          <TouchableOpacity onPress={onClose} style={styles.footerBackBtn}>
            <Text style={styles.footerBackText}>Close Statement</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  backBtnText: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  headerTitle: { color: "#FAFAFA", fontSize: 12, fontWeight: "900", letterSpacing: 0.8 },
  content: { padding: 16 },
  summaryCard: { backgroundColor: "#18181B", borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#27272A" },
  summaryLabel: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  summaryAmount: { color: "#FAFAFA", fontSize: 28, fontWeight: "900", marginTop: 6 },
  summaryMetaRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  summaryMeta: { color: "#10B981", fontSize: 11, fontWeight: "600" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  filterPill: { backgroundColor: "#18181B", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#27272A" },
  filterPillActive: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  filterText: { color: "#71717A", fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: "#FAFAFA" },
  emptyCard: { backgroundColor: "#121215", borderRadius: 14, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "#18181B" },
  emptyTitle: { color: "#FAFAFA", fontSize: 14, fontWeight: "700", marginTop: 10 },
  emptySub: { color: "#71717A", fontSize: 11, textAlign: "center", marginTop: 4, maxWidth: 260 },
  txList: { gap: 8, marginBottom: 16 },
  txRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#121215", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#18181B" },
  txIconWrap: { width: 34, height: 34, borderRadius: 8, backgroundColor: "rgba(236, 72, 153, 0.15)", alignItems: "center", justifyContent: "center" },
  txDetails: { flex: 1, marginLeft: 12 },
  txTitle: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  txDate: { color: "#71717A", fontSize: 11, marginTop: 2 },
  txRight: { alignItems: "flex-end" },
  txPrice: { color: "#FAFAFA", fontSize: 13, fontWeight: "800" },
  txStatus: { color: "#10B981", fontSize: 10, fontWeight: "800", marginTop: 2 },
  footerBackBtn: { backgroundColor: "#27272A", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 8, marginBottom: 24 },
  footerBackText: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
});