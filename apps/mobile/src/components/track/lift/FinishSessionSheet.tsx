import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Award, Flame } from "lucide-react-native";
import { useColors } from "../../../theme/theme";
import { AppBottomSheet } from "../../sheets/AppBottomSheet";

interface FinishSessionSheetProps {
  visible: boolean;
  completedSets: number;
  volumeKg: number;
  durationLabel: string;
  isPR: boolean;
  onClose: () => void;
  onFinish: (shareToFeed: boolean) => void;
}

export function FinishSessionSheet({ visible, completedSets, volumeKg, durationLabel, isPR, onClose, onFinish }: FinishSessionSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const stats = [
    { label: "Duration", value: durationLabel },
    { label: "Sets", value: String(completedSets) },
    { label: "Volume", value: `${volumeKg.toLocaleString()} kg` },
  ];
  return (
    <AppBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Finish workout">
      <BottomSheetView style={[styles.body, { paddingBottom: insets.bottom + 20 }]}>
        <Award size={44} color={isPR ? colors.warning : colors.accentGreen} />
        <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">{isPR ? "New PR! Save session" : "Save session"}</Text>
        <View style={styles.stats}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.stat, { backgroundColor: colors.bgCardSecondary }]}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={() => onFinish(true)} style={[styles.primary, { backgroundColor: colors.accent }]} accessibilityRole="button">
          <Flame size={18} color={colors.textOnAccent} />
          <Text style={[styles.primaryText, { color: colors.textOnAccent }]}>Save & Share to Sodia</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onFinish(false)} style={styles.secondary} accessibilityRole="button">
          <Text style={[styles.secondaryText, { color: colors.textSecondary }]}>Save privately</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: "900", marginTop: 10 },
  stats: { flexDirection: "row", gap: 8, marginVertical: 18, alignSelf: "stretch" },
  stat: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "900", fontVariant: ["tabular-nums"] },
  statLabel: { fontSize: 12, marginTop: 2 },
  primary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, borderRadius: 14, alignSelf: "stretch" },
  primaryText: { fontSize: 15, fontWeight: "800" },
  secondary: { minHeight: 48, justifyContent: "center", marginTop: 6 },
  secondaryText: { fontSize: 14, fontWeight: "700" },
});
