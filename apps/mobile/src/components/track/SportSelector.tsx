import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useColors } from "../../theme/theme";
import type { MoveSportType } from "../../store/trackingStore";
import { SPORTS_LIST } from "./trackConstants";

interface SportSelectorProps {
  selected: MoveSportType;
  disabled: boolean;
  onSelect: (sport: MoveSportType) => void;
}

/** Strava-style sport picker; locked while a GPS session is recording. */
export function SportSelector({ selected, disabled, onSelect }: SportSelectorProps) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <FlashList
        horizontal
        data={SPORTS_LIST}
        extraData={`${selected}|${disabled}`}
        keyExtractor={(sp) => sp.id}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item: sp }) => {
          const active = selected === sp.id;
          return (
            <TouchableOpacity
              onPress={() => onSelect(sp.id)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={sp.label}
              accessibilityState={{ selected: active, disabled }}
              style={[styles.pill, { backgroundColor: active ? colors.accent : colors.bgCardSecondary, borderColor: active ? colors.accent : colors.borderColor }]}
            >
              <Text style={styles.emoji}>{sp.icon}</Text>
              <Text style={[styles.label, { color: active ? colors.textOnAccent : colors.textSecondary }, active && styles.labelActive]}>{sp.label}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 12, height: 44 },
  sep: { width: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1 },
  emoji: { fontSize: 14 },
  label: { fontSize: 13, fontWeight: "700" },
  labelActive: { fontWeight: "800" },
});
