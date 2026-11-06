import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Trophy } from "lucide-react-native";
import { MIN_TOUCH_TARGET } from "sodia-core";
import { useColors } from "../../../theme/theme";
import { stampText, type PostView } from "./postModel";

export interface ChallengeSummary {
  readonly postId: string;
  readonly title: string;
  readonly benchmark: string;
  readonly metric: string;
  readonly participants: number;
  readonly daysLeft: number;
}

export function challengeFromView(postId: string, view: PostView): ChallengeSummary {
  return {
    postId,
    title: stampText(view, "title", "PR Challenge"),
    benchmark: stampText(view, "benchmark", "Benchmark"),
    metric: stampText(view, "metric", "Verified benchmark"),
    participants: Number(view.stamp?.participantsCount ?? 0),
    daysLeft: Number(view.stamp?.daysLeft ?? 0),
  };
}

export function ChallengeCallout({ challenge, onOpen }: { challenge: ChallengeSummary; onOpen: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.banner, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
      <Trophy size={18} color={colors.warning} />
      <View style={styles.flex}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{challenge.title}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {challenge.benchmark} • {challenge.participants} athletes • {challenge.daysLeft} days left
        </Text>
      </View>
      <TouchableOpacity onPress={onOpen} style={[styles.cta, { backgroundColor: colors.accent }]} accessibilityRole="button" accessibilityLabel={`View challenge ${challenge.title}`}>
        <Text style={[styles.ctaText, { color: colors.textOnAccent }]}>Join</Text>
      </TouchableOpacity>
    </View>
  );
}

export function AdCallout({ onClaim }: { onClaim: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.banner, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
      <View style={styles.flex}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>7-Day VIP Guest Pass</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>Olympic platforms, sauna, & cold plunge</Text>
      </View>
      <TouchableOpacity onPress={onClaim} style={[styles.cta, { backgroundColor: colors.accentGreen }]} accessibilityRole="button" accessibilityLabel="Claim 7-day VIP guest pass offer">
        <Text style={[styles.ctaText, { color: colors.textOnAccent }]}>Claim Offer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1 },
  flex: { flex: 1 },
  title: { fontSize: 13, fontWeight: "800" },
  meta: { fontSize: 11, marginTop: 2 },
  cta: { minHeight: MIN_TOUCH_TARGET - 6, paddingHorizontal: 16, borderRadius: 8, justifyContent: "center" },
  ctaText: { fontSize: 12, fontWeight: "800" },
});
