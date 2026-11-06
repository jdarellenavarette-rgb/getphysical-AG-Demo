import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MIN_TOUCH_TARGET } from "sodia-core";
import { useColors } from "../../theme/theme";

interface SegmentedTabsProps<K extends string> {
  tabs: readonly { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
}

export function SegmentedTabs<K extends string>({ tabs, value, onChange }: SegmentedTabsProps<K>) {
  const colors = useColors();
  return (
    <View style={[styles.row, { borderBottomColor: colors.borderColor }]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[styles.tab, active && { borderBottomColor: colors.accent }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, { color: active ? colors.textPrimary : colors.textMuted }, active && styles.active]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 16, borderBottomWidth: 1, gap: 20 },
  tab: { minHeight: MIN_TOUCH_TARGET, justifyContent: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  text: { fontSize: 14, fontWeight: "600" },
  active: { fontWeight: "800" },
});
