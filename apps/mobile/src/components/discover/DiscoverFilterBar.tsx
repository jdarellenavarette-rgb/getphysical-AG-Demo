import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
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

  return (
    <View style={styles.container}>
      {/* SINGLE CLEAN HORIZONTAL PILL ROW */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {/* Active Sport Badge if set from Filter Modal */}
        {hasSportFilter && (
          <TouchableOpacity
            onPress={() => onSelectSport("All")}
            activeOpacity={0.7}
            style={[styles.activeSportChip, { backgroundColor: colors.accent, borderColor: colors.accent }]}
          >
            <Text style={styles.activeSportText}>{selectedSport}</Text>
            <X size={13} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Category Pills */}
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat && !hasSportFilter;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                if (hasSportFilter) onSelectSport("All");
                onSelectCategory(cat);
              }}
              activeOpacity={0.7}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isActive ? "#E11D48" : colors.bgCard,
                  borderColor: isActive ? "#E11D48" : colors.borderColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isActive ? "#FFFFFF" : colors.textPrimary },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    marginBottom: 4,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
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
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
