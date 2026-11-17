import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, ArrowLeft } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { useCrmMessagingStore } from "../../store/crmMessagingStore";
import { Avatar } from "../common/Avatar";

export interface DMThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timeAgo: string;
  unreadCount: number;
  isOnline?: boolean;
  type: "direct" | "coach" | "group" | "facility";
  badgeText?: string;
}

interface InboxViewProps {
  onBack: () => void;
  onSelectThread: (thread: DMThread) => void;
}

export function InboxView({ onBack, onSelectThread }: InboxViewProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");

  const { threads, markThreadAsRead } = useCrmMessagingStore();

  const filteredThreads = threads.filter((t) =>
    searchQuery.trim() === ""
      ? true
      : t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 6,
            height: insets.top + 54,
            backgroundColor: colors.bgHeader,
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Close messages"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Messages</Text>
        <View style={styles.newMsgBtn} />
      </View>

      {/* SEARCH BOX */}
      <View style={[styles.searchBox, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <Search size={15} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search messages..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          accessibilityLabel="Search messages"
        />
      </View>

      {/* THREADS LIST */}
      <ScrollView style={styles.threadList} showsVerticalScrollIndicator={false}>
        {filteredThreads.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {searchQuery.trim()
              ? `No conversations match "${searchQuery.trim()}".`
              : "No messages yet. Message someone from their profile to start a conversation."}
          </Text>
        )}
        {filteredThreads.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => {
              markThreadAsRead(t.id);
              onSelectThread(t);
            }}
            style={[styles.threadItem, { borderBottomColor: colors.borderColor }]}
          >
            <View style={styles.avatarContainer}>
              <Avatar uri={t.avatar} name={t.name} size={52} style={styles.avatar} />
              {t.isOnline && <View style={[styles.onlineBadge, { borderColor: colors.bgScreen }]} />}
            </View>

            <View style={styles.threadMeta}>
              <View style={styles.topMetaRow}>
                <Text style={[styles.threadName, { color: colors.textPrimary }]}>{t.name}</Text>
                {t.badgeText && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{t.badgeText}</Text>
                  </View>
                )}
                <Text style={[styles.threadTime, { color: colors.textMuted }]}>{t.timeAgo}</Text>
              </View>
              <View style={styles.snippetRow}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.lastMessage,
                    { color: colors.textSecondary },
                    t.unreadCount > 0 && { color: colors.textPrimary, fontWeight: "700" },
                  ]}
                >
                  {t.lastMessage}
                </Text>
                {t.unreadCount > 0 ? <View style={styles.unreadDot} /> : null}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: { textAlign: "center", fontSize: 13, lineHeight: 19, paddingVertical: 40, paddingHorizontal: 32 },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  newMsgBtn: { padding: 4 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 13 },
  notesTray: { paddingVertical: 12, borderBottomWidth: 1 },
  notesScroll: { paddingHorizontal: 16, gap: 14 },
  noteItem: { alignItems: "center", width: 72 },
  bubbleCloud: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 4, maxWidth: 74 },
  bubbleCloudText: { fontSize: 9, fontWeight: "600", textAlign: "center" },
  noteAvatarWrap: { position: "relative", width: 50, height: 50 },
  noteAvatar: { width: "100%", height: "100%", borderRadius: 25 },
  noteAddPill: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E11D48",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  noteName: { fontSize: 10, fontWeight: "600", marginTop: 4, textAlign: "center" },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: 10, borderBottomWidth: 1, gap: 16 },
  tabPill: { paddingBottom: 10 },
  tabPillActive: { borderBottomWidth: 2, borderBottomColor: "#E11D48" },
  tabText: { fontSize: 13, fontWeight: "600" },
  tabTextActive: { fontWeight: "700" },
  threadList: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  threadItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  avatarContainer: { position: "relative" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
  },
  threadMeta: { flex: 1, marginLeft: 12 },
  topMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  threadName: { fontSize: 14, fontWeight: "700", flex: 1 },
  badgePill: {
    backgroundColor: "rgba(225, 29, 72, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  badgePillText: { color: "#E11D48", fontSize: 9, fontWeight: "800" },
  threadTime: { fontSize: 11 },
  snippetRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  lastMessage: { fontSize: 12, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E11D48", marginLeft: 8 },
});
