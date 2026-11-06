import React, { useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Bell, Flame } from "lucide-react-native";
import { createEmptyState, createSuccessState, type TenStateEnvelope } from "sodia-core";
import { useColors } from "../../theme/theme";
import { TenStateView } from "../common/TenStateView";
import { ScreenHeader } from "../common/ScreenHeader";
import { SegmentedTabs } from "../common/SegmentedTabs";
import { haptics } from "../../lib/haptics";

interface ActivityViewProps {
  onBack: () => void;
  onNavigateToLift?: () => void;
}

type ActivityKind = "challenge_alert" | "like" | "follow";
interface ActivityItem {
  readonly id: string;
  readonly kind: ActivityKind;
  readonly section: "Today" | "This Week";
  readonly text: string;
  readonly time: string;
  readonly user?: string;
  readonly avatar?: string;
  readonly postThumb?: string;
}
type Row = { readonly type: "header"; readonly id: string; readonly label: string } | { readonly type: "item"; readonly id: string; readonly item: ActivityItem };

const ACTIVITIES: readonly ActivityItem[] = [
  { id: "act_1", kind: "challenge_alert", section: "Today", text: "Dave passed your 225kg Deadlift score with 230kg on the BGC Leaderboard!", time: "25m" },
  { id: "act_2", kind: "like", section: "Today", user: "Sarah Jenkins", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", text: "liked your post with Metro Core Arena tag.", time: "2h", postThumb: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=200&q=80" },
  { id: "act_3", kind: "follow", section: "This Week", user: "Coach Miguel Ramos", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", text: "started following you.", time: "1d" },
];

type Tab = "all" | "requests";
const TABS = [
  { key: "all", label: "All activity" },
  { key: "requests", label: "Follow requests" },
] as const satisfies readonly { key: Tab; label: string }[];

function toRows(items: readonly ActivityItem[]): Row[] {
  const rows: Row[] = [];
  let section: string | null = null;
  for (const item of items) {
    if (item.section !== section) {
      section = item.section;
      rows.push({ type: "header", id: `h_${section}`, label: section.toUpperCase() });
    }
    rows.push({ type: "item", id: item.id, item });
  }
  return rows;
}

export function ActivityView({ onBack, onNavigateToLift }: ActivityViewProps) {
  const colors = useColors();
  const [tab, setTab] = useState<Tab>("all");
  const [followed, setFollowed] = useState<Readonly<Record<string, boolean>>>({});

  const state = useMemo<TenStateEnvelope<Row[]>>(
    () => (tab === "requests" ? createEmptyState("When someone requests to follow your private profile, it shows up here.", "") : createSuccessState(toRows(ACTIVITIES))),
    [tab]
  );

  const renderRow = ({ item: row }: { item: Row }) => {
    if (row.type === "header") return <Text style={[styles.section, { color: colors.textMuted }]}>{row.label}</Text>;
    const a = row.item;
    const urgent = a.kind === "challenge_alert";
    const isFollowed = followed[a.id] ?? false;
    return (
      <View style={[styles.row, urgent && { backgroundColor: colors.bgCardSecondary, borderColor: colors.warning, borderWidth: 1, borderRadius: 12, padding: 12, marginHorizontal: 16 }]}>
        {urgent ? (
          <View style={[styles.alertIcon, { backgroundColor: colors.bgCardTertiary }]}>
            <Flame size={18} color={colors.warning} />
          </View>
        ) : (
          <Image source={{ uri: a.avatar ?? "" }} style={styles.avatar} />
        )}
        <View style={styles.meta}>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {a.user ? <Text style={[styles.user, { color: colors.textPrimary }]}>{a.user} </Text> : null}
            {a.text} <Text style={{ color: colors.textMuted }}>{a.time}</Text>
          </Text>
        </View>
        {urgent && (
          <TouchableOpacity onPress={onNavigateToLift} style={[styles.btn, { backgroundColor: colors.accent }]} accessibilityRole="button" accessibilityLabel="Defend your PR in Lift tracker">
            <Text style={[styles.btnText, { color: colors.textOnAccent }]}>Defend PR</Text>
          </TouchableOpacity>
        )}
        {a.kind === "follow" && (
          <TouchableOpacity
            onPress={() => {
              haptics.selection();
              setFollowed((p) => ({ ...p, [a.id]: !isFollowed }));
            }}
            style={[styles.btn, isFollowed ? { backgroundColor: colors.bgInput } : { backgroundColor: colors.accent }]}
            accessibilityRole="button"
            accessibilityState={{ selected: isFollowed }}
          >
            <Text style={[styles.btnText, { color: isFollowed ? colors.textPrimary : colors.textOnAccent }]}>{isFollowed ? "Following" : "Follow back"}</Text>
          </TouchableOpacity>
        )}
        {a.postThumb ? <Image source={{ uri: a.postThumb }} style={styles.thumb} accessibilityLabel="Liked post" /> : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <ScreenHeader title="Activity" onBack={onBack} backLabel="Close activity" />
      <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
      <TenStateView state={state} emptyIcon={Bell} emptyTitle="No follow requests">
        {(rows) => (
          <FlashList
            data={rows}
            keyExtractor={(r) => r.id}
            getItemType={(r) => r.type}
            extraData={followed}
            renderItem={renderRow}
            contentContainerStyle={styles.list}
          />
        )}
      </TenStateView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingVertical: 12, paddingBottom: 40 },
  section: { fontSize: 12, fontWeight: "800", letterSpacing: 0.8, marginTop: 12, marginBottom: 8, paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, marginBottom: 4 },
  alertIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  meta: { flex: 1, marginLeft: 12 },
  text: { fontSize: 14, lineHeight: 19 },
  user: { fontWeight: "700" },
  btn: { paddingHorizontal: 14, minHeight: 36, justifyContent: "center", borderRadius: 8, marginLeft: 8 },
  btnText: { fontSize: 13, fontWeight: "700" },
  thumb: { width: 44, height: 44, borderRadius: 6, marginLeft: 8 },
});
