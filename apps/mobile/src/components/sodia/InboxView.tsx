import React, { useMemo, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Edit3, MessageCircle, Search, X } from "lucide-react-native";
import { createEmptyState, createNoInternetState, createNoSearchResultsState, createSuccessState, type TenStateEnvelope } from "sodia-core";
import { useColors } from "../../theme/theme";
import { useCrmMessagingStore } from "../../store/crmMessagingStore";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { TenStateView } from "../common/TenStateView";
import { ScreenHeader } from "../common/ScreenHeader";
import { SegmentedTabs } from "../common/SegmentedTabs";
import { ThreadRow } from "./inbox/ThreadRow";
import { NotesTray, type AthleteNote } from "./inbox/NotesTray";

export interface DMThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timeAgo: string;
  unreadCount: number;
  isOnline?: boolean;
  type: "direct" | "coach" | "group" | "handshake";
  badgeText?: string;
}

interface InboxViewProps {
  onBack: () => void;
  onSelectThread: (thread: DMThread) => void;
}

type InboxTab = "primary" | "requests";

const NOTES: readonly AthleteNote[] = [
  { id: "note_me", name: "Your note", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", note: "Heading to BGC 🏋️", isMe: true },
  { id: "note_1", name: "Miguel", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", note: "At Metro Core till 8pm 🔥" },
  { id: "note_2", name: "Alex", avatar: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=200&q=80", note: "Clay prep 🎾" },
  { id: "note_3", name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", note: "Leg day crushed 💪" },
];
const TABS = [
  { key: "primary", label: "Primary" },
  { key: "requests", label: "Requests" },
] as const satisfies readonly { key: InboxTab; label: string }[];

export function InboxView({ onBack, onSelectThread }: InboxViewProps) {
  const colors = useColors();
  const [tab, setTab] = useState<InboxTab>("primary");
  const [query, setQuery] = useState("");
  const threads = useCrmMessagingStore((s) => s.threads);
  const markThreadAsRead = useCrmMessagingStore((s) => s.markThreadAsRead);
  const isOffline = useEcosystemStore((s) => s.isOffline);

  const state = useMemo<TenStateEnvelope<readonly DMThread[]>>(() => {
    // Message requests are threads from people you don't follow; none exist in the CRM seed.
    const pool = tab === "primary" ? threads : [];
    const q = query.trim().toLowerCase();
    const filtered = q ? pool.filter((t) => t.name.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q)) : pool;
    if (isOffline) return createNoInternetState(filtered, { queuedMutationsCount: 0 });
    if (q && filtered.length === 0) return createNoSearchResultsState(query);
    if (filtered.length === 0) {
      return tab === "requests"
        ? createEmptyState("Message requests from athletes you don't follow appear here.", "Find athletes")
        : createEmptyState("Message a coach, club or training partner.", "New message");
    }
    return createSuccessState(filtered);
  }, [threads, tab, query, isOffline]);

  const open = (t: DMThread) => {
    markThreadAsRead(t.id);
    onSelectThread(t);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <ScreenHeader title="Messages" onBack={onBack} backLabel="Close messages" right={{ icon: Edit3, label: "New message", onPress: () => threads[0] && open(threads[0]) }} />
      <View style={[styles.search, { backgroundColor: colors.bgInput }]}>
        <Search size={16} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search messages"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search messages"
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery("")} hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear search">
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
      {!query ? <NotesTray notes={NOTES} /> : null}
      <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
      <TenStateView
        state={state}
        emptyIcon={MessageCircle}
        emptyTitle={tab === "requests" ? "No message requests" : "No messages yet"}
        onPrimaryAction={tab === "primary" ? onBack : undefined}
        onClearSearch={() => setQuery("")}
      >
        {(list) => (
          <FlashList
            data={list}
            keyExtractor={(t) => t.id}
            renderItem={({ item }) => <ThreadRow thread={item} onPress={open} />}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </TenStateView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { flexDirection: "row", alignItems: "center", borderRadius: 12, marginHorizontal: 16, marginTop: 10, paddingHorizontal: 12, minHeight: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, minHeight: 44 },
  listContent: { paddingBottom: 40 },
});
