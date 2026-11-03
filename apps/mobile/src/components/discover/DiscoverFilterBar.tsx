import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
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

const SUB_FILTERS: Record<DiscoverCategory, string[]> = {
  All: ["All", "Pickleball", "Reformer", "Swimming", "Badminton", "Basketball", "Strength", "Climbing"],
  Gyms: ["All Gyms", "Commercial", "Powerlifting", "Hyrox"],
  "Pilates Studios": ["All Pilates", "Reformer", "Cadillac", "Lagree & Mat"],
  "Sports Facilities": ["All Sports", "Pickleball", "Basketball", "Tennis", "Badminton", "Swimming", "Climbing", "Football"],
  Coaches: ["All Coaches", "Strength & Conditioning", "Pilates & Mobility", "Racket Sports", "Hyrox & Endurance", "Boxing & Combat"],
  "Community Clubs": ["All Clubs", "Running Crew", "Cycling Peloton", "Basketball Guild", "Tournaments"],
};

export function DiscoverFilterBar({
  selectedCategory,
  onSelectCategory,
  selectedSport,
  onSelectSport,
}: DiscoverFilterBarProps) {
  const { colors } = useThemeStore();
  const subOptions = SUB_FILTERS[selectedCategory] || [];

  return (
    <View style={styles.container}>
      {/* 1. PRIMARY CATEGORY PILLS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelectCategory(cat)}
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

      {/* 2. SUB-FILTER SPORT / SPECIALIZATION CHIPS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subFilterScroll}
      >
        {subOptions.map((sub) => {
          const isActive =
            selectedSport === sub ||
            (selectedSport === "All" && (sub === "All" || sub.startsWith("All ")));
          return (
            <TouchableOpacity
              key={sub}
              onPress={() => onSelectSport(sub.startsWith("All ") ? "All" : sub)}
              activeOpacity={0.7}
              style={[
                styles.subChip,
                {
                  backgroundColor: isActive ? colors.accent : colors.bgCardSecondary,
                  borderColor: isActive ? colors.accent : colors.borderColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.subChipText,
                  { color: isActive ? "#FFFFFF" : colors.textSecondary },
                ]}
              >
                {sub}
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
    gap: 8,
    marginBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  categoryChip: {
    paddingHorizontal: 14,
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
  subFilterScroll: {
    paddingHorizontal: 16,
    gap: 6,
    alignItems: "center",
  },
  subChip: {
    paddingHorizontal: 12,
    minHeight: 34,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
  },
  subChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
