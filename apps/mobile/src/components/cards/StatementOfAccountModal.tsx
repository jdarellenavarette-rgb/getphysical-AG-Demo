import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { ChevronRight, FileText, Ticket } from "lucide-react-native";
import { createEmptyState, createSuccessState, type PassRow } from "sodia-core";
import { useColors } from "../../theme/theme";
import { AppModal } from "../common/AppModal";
import { ScreenHeader } from "../common/ScreenHeader";
import { TenStateView } from "../common/TenStateView";

interface StatementOfAccountModalProps {
  visible: boolean;
  passes: readonly PassRow[];
  onClose: () => void;
  onSelectPass: (pass: PassRow) => void;
}

type LedgerFilter = "all" | "passes" | "courts";
const FILTERS: readonly { key: LedgerFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "passes", label: "Passes & memberships" },
  { key: "courts", label: "Courts & meets" },
];

function isCourt(p: PassRow): boolean {
  return /court|reservation|entry|session/i.test(p.pass_type);
}

/** Append-only ledger view (rows are never edited; voids appear as reversing entries). */
export function StatementOfAccountModal({ visible, passes, onClose, onSelectPass }: StatementOfAccountModalProps) {
  const colors = useColors();
  const [filter, setFilter] = useState<LedgerFilter>("all");
  const rows = useMemo(
    () => passes.filter((p) => (filter === "all" ? true : filter === "courts" ? isCourt(p) : !isCourt(p))),
    [passes, filter]
  );
  const state = rows.length === 0
    ? createEmptyState<PassRow[]>(filter === "all" ? "Purchases, memberships and court splits appear here." : "Nothing in this category yet.", "")
    : createSuccessState([...rows]);

  const header = (
    <View>
      <View style={[styles.summary, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>THIS MONTH</Text>
        <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{passes.length} settled</Text>
        <Text style={[styles.summaryMeta, { color: colors.accentGreen }]}>0 failed or reversed</Text>
      </View>
      <View style={styles.filters} accessibilityRole="tablist">
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.filter, { backgroundColor: active ? colors.accent : colors.bgCardSecondary, borderColor: active ? colors.accent : colors.borderColor }]}
            >
              <Text style={[styles.filterText, { color: active ? colors.textOnAccent : colors.textSecondary }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <AppModal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        <ScreenHeader title="Statement of account" onBack={onClose} backLabel="Back to wallet" />
        <View style={styles.pad}>{state.status !== "success" ? header : null}</View>
        <TenStateView state={state} emptyIcon={Ticket} emptyTitle="No transactions">
          {(list) => (
            <FlashList
              data={list}
              keyExtractor={(p) => p.id}
              ListHeaderComponent={header}
              contentContainerStyle={styles.content}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              renderItem={({ item: p }) => (
                <TouchableOpacity
                  onPress={() => onSelectPass(p)}
                  style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.pass_type}, ${p.status}. View receipt`}
                >
                  <View style={[styles.icon, { backgroundColor: colors.accentMuted }]}>
                    <FileText size={16} color={colors.accentText} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>{p.pass_type}</Text>
                    <Text style={[styles.date, { color: colors.textMuted }]}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "Active"} • Metro Core
                    </Text>
                  </View>
                  <Text style={[styles.status, { color: colors.accentGreen }]}>{p.status.toUpperCase()}</Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            />
          )}
        </TenStateView>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pad: { paddingHorizontal: 16 },
  content: { padding: 16, paddingBottom: 40 },
  summary: { borderRadius: 16, borderWidth: 1, padding: 18, marginTop: 8 },
  summaryLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  summaryValue: { fontSize: 28, fontWeight: "900", marginTop: 4 },
  summaryMeta: { fontSize: 12, fontWeight: "700", marginTop: 4 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 14 },
  filter: { minHeight: 36, justifyContent: "center", paddingHorizontal: 14, borderRadius: 18, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: "700" },
  sep: { height: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, minHeight: 64 },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  title: { fontSize: 14, fontWeight: "800" },
  date: { fontSize: 12, marginTop: 2 },
  status: { fontSize: 11, fontWeight: "800" },
});
