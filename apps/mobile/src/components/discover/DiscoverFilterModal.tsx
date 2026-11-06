import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { AppModal } from "../common/AppModal";
import { X, Check, SlidersHorizontal, RotateCcw } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { DiscoverCategory, DiscoverFilterState } from "../../data/discoverData";

interface DiscoverFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: DiscoverFilterState;
  onApplyFilters: (filters: DiscoverFilterState) => void;
  totalResultsCount: number;
}

const CATEGORIES: DiscoverCategory[] = [
  "All",
  "Gyms",
  "Pilates Studios",
  "Sports Facilities",
  "Coaches",
  "Community Clubs",
];

const SPORTS_LIST = [
  "All",
  "Pickleball",
  "Basketball",
  "Tennis",
  "Badminton",
  "Swimming",
  "Climbing",
  "Football",
  "Running",
  "Cycling",
  "Boxing",
  "Reformer",
];

const PRICE_TIERS = [
  { id: "all", label: "Any Price" },
  { id: "under_300", label: "Under ₱300" },
  { id: "300_600", label: "₱300 - ₱600" },
  { id: "above_600", label: "₱600+" },
] as const;

export function DiscoverFilterModal({
  visible,
  onClose,
  filters,
  onApplyFilters,
  totalResultsCount,
}: DiscoverFilterModalProps) {
  const { colors } = useThemeStore();
  const [draft, setDraft] = React.useState<DiscoverFilterState>(filters);

  React.useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const handleReset = () => {
    setDraft({ category: "All", sport: "All", priceRange: "all", openNowOnly: false });
  };

  return (
    <AppModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {/* HEADER */}
          <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
            <View style={styles.headerLeft}>
              <SlidersHorizontal size={18} color={colors.accent} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>Filters</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close filters" onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* 1. VENUE CATEGORY */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>VENUE & ENTITY TYPE</Text>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((cat) => {
                const active = draft.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setDraft((d) => ({ ...d, category: cat }))}
                    style={[
                      styles.chip,
                      { backgroundColor: active ? colors.accent : colors.bgCardSecondary, borderColor: active ? colors.accent : colors.borderColor },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? "#FFF" : colors.textPrimary }]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. SPORT / ACTIVITY */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: 14 }]}>SPORT & DISCIPLINE</Text>
            <View style={styles.chipGrid}>
              {SPORTS_LIST.map((sp) => {
                const active = draft.sport === sp;
                return (
                  <TouchableOpacity
                    key={sp}
                    onPress={() => setDraft((d) => ({ ...d, sport: sp }))}
                    style={[
                      styles.chip,
                      { backgroundColor: active ? colors.accent : colors.bgCardSecondary, borderColor: active ? colors.accent : colors.borderColor },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? "#FFF" : colors.textPrimary }]}>{sp}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. PRICE RANGE */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: 14 }]}>PASS / COURT PRICE</Text>
            <View style={styles.chipGrid}>
              {PRICE_TIERS.map((tier) => {
                const active = draft.priceRange === tier.id;
                return (
                  <TouchableOpacity
                    key={tier.id}
                    onPress={() => setDraft((d) => ({ ...d, priceRange: tier.id }))}
                    style={[
                      styles.chip,
                      { backgroundColor: active ? colors.accent : colors.bgCardSecondary, borderColor: active ? colors.accent : colors.borderColor },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? "#FFF" : colors.textPrimary }]}>{tier.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 4. OPEN NOW TOGGLE */}
            <TouchableOpacity
              onPress={() => setDraft((d) => ({ ...d, openNowOnly: !d.openNowOnly }))}
              style={[styles.toggleRow, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
            >
              <Text style={[styles.toggleText, { color: colors.textPrimary }]}>Open Now Only</Text>
              <View style={[styles.checkbox, draft.openNowOnly && { backgroundColor: "#10B981", borderColor: colors.accentGreen }]}>
                {draft.openNowOnly && <Check size={14} color="#FFF" />}
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* FOOTER ACTIONS */}
          <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
            <TouchableOpacity onPress={handleReset} style={[styles.resetBtn, { borderColor: colors.borderColor }]}>
              <RotateCcw size={14} color={colors.textSecondary} />
              <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { onApplyFilters(draft); onClose(); }}
              style={styles.applyBtn}
            >
              <Text style={styles.applyText}>Show {totalResultsCount} Results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, maxHeight: "85%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 17, fontWeight: "800" },
  content: { padding: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, borderWidth: 1, minHeight: 38, justifyContent: "center" },
  chipText: { fontSize: 12, fontWeight: "600" },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 16 },
  toggleText: { fontSize: 14, fontWeight: "700" },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#94A3B8", justifyContent: "center", alignItems: "center" },
  footer: { flexDirection: "row", padding: 16, gap: 12, borderTopWidth: 1 },
  resetBtn: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, minHeight: 48, borderRadius: 14, borderWidth: 1 },
  resetText: { fontSize: 14, fontWeight: "700" },
  applyBtn: { flex: 2, justifyContent: "center", alignItems: "center", minHeight: 48, borderRadius: 14, backgroundColor: "#E11D48" },
  applyText: { fontSize: 14, fontWeight: "800", color: "#FFF" },
});
