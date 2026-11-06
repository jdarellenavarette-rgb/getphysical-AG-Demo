import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarClock, Trophy, Users, X } from "lucide-react-native";
import { MIN_TOUCH_TARGET, RADII, SPACING, TYPE_SCALE } from "sodia-core";
import { AppBottomSheet } from "../sheets/AppBottomSheet";
import { useColors } from "../../theme/theme";
import { toast } from "../../feedback/toastStore";
import type { ChallengeSummary } from "./feed/PostCallouts";

interface ChallengeSheetProps {
  challenge: ChallengeSummary | null;
  visible: boolean;
  onClose: () => void;
}

/** Actionable-object sheet for PR challenges (keeps feed context; AGENTS.md §5). */
export function ChallengeSheet({ challenge, visible, onClose }: ChallengeSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const stats = challenge
    ? [
        { icon: Trophy, label: "Benchmark", value: challenge.benchmark },
        { icon: Users, label: "Athletes", value: String(challenge.participants) },
        { icon: CalendarClock, label: "Days left", value: String(challenge.daysLeft) },
      ]
    : [];

  return (
    <AppBottomSheet visible={visible && !!challenge} onClose={onClose} accessibilityLabel="PR challenge details">
      <BottomSheetView style={[styles.body, { paddingBottom: insets.bottom + SPACING.lg }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">{challenge?.title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close challenge">
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.metric, { color: colors.textSecondary }]}>{challenge?.metric}</Text>
        <View style={styles.stats}>
          {stats.map(({ icon: Icon, label, value }) => (
            <View key={label} style={[styles.stat, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <Icon size={18} color={colors.accentText} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.rules, { color: colors.textSecondary }]}>
          Record your attempt in one continuous take with the plates visible. Submissions are verified by the organizer before the leaderboard updates.
        </Text>
        <TouchableOpacity
          style={[styles.join, { backgroundColor: colors.accent }]}
          accessibilityRole="button"
          onPress={() => {
            toast.success("You're in!", `Registered for ${challenge?.title ?? "the challenge"}. Upload your lift to submit.`);
            onClose();
          }}
        >
          <Text style={[styles.joinText, { color: colors.textOnAccent }]}>Join Challenge</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xs },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { ...TYPE_SCALE.headline, fontWeight: "900", flex: 1 },
  close: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  metric: { ...TYPE_SCALE.body, marginTop: SPACING.xs },
  stats: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg },
  stat: { flex: 1, alignItems: "center", paddingVertical: SPACING.md, borderRadius: RADII.lg, borderWidth: 1, gap: 4 },
  statValue: { ...TYPE_SCALE.bodyLarge, fontWeight: "800" },
  statLabel: { ...TYPE_SCALE.caption },
  rules: { ...TYPE_SCALE.footnote, marginTop: SPACING.lg },
  join: { minHeight: 50, borderRadius: RADII.lg, alignItems: "center", justifyContent: "center", marginTop: SPACING.xl },
  joinText: { ...TYPE_SCALE.bodyLarge, fontWeight: "800" },
});
