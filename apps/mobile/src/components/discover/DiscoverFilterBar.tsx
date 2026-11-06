import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { X } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { DiscoverCategory } from "../../data/discoverData";

interface DiscoverFilterBarProps {
  selectedCategory: DiscoverCategory;
  onSelectCategory: (cat: DiscoverCategory) => void;
  selectedSport: string;
  onSelectSport: (sport: string) => void;
}

const CATEGORIES: DiscoverCategory[] = [
  "All",
  "Gyms",
  "Pilates Studios",
  "Sports Facilities",
  "Coaches",
  "Community Clubs",
];

export function DiscoverFilterBar({
  selectedCategory,
  onSelectCategory,
  selectedSport,
  onSelectSport,
}: DiscoverFilterBarProps) {
  const { colors } = useThemeStore();
  const hasSportFilter = selectedSport !== "All";

  type Chip = { key: string; kind: "sport" | "category"; label: string; category?: DiscoverCategory };
  const chips: Chip[] = [
    ...(hasSportFilter ? [{ key: "sport", kind: "sport" as const, label: selectedSport }] : []),
    ...CATEGORIES.map((cat): Chip => ({ key: cat, kind: "category", label: cat, category: cat })),
  ];

  return (
    <View style={styles.container}>
      <FlashList
        horizontal
        data={chips}
        extraData={`${selectedCategory}|${selectedSport}`}
        keyExtractor={(c) => c.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => {
          if (item.kind === "sport") {
            return (
              <TouchableOpacity
                onPress={() => onSelectSport("All")}
                activeOpacity={0.7}
                style={[styles.activeSportChip, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.label} filter`}
              >
                <Text style={[styles.activeSportText, { color: colors.textOnAccent }]}>{item.label}</Text>
                <X size={14} color={colors.textOnAccent} />
              </TouchableOpacity>
            );
          }
          const isActive = selectedCategory === item.category && !hasSportFilter;
          return (
            <TouchableOpacity
              onPress={() => {
                if (hasSportFilter) onSelectSport("All");
                if (item.category) onSelectCategory(item.category);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={[styles.categoryChip, { backgroundColor: isActive ? colors.accent : colors.bgCard, borderColor: isActive ? colors.accent : colors.borderColor }]}
            >
              <Text style={[styles.categoryText, { color: isActive ? colors.textOnAccent : colors.textPrimary }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingVertical: 6,
    marginBottom: 4,
  },
  categoryScroll: { paddingHorizontal: 16 },
  sep: { width: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "700",
  },
  activeSportChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  activeSportText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
