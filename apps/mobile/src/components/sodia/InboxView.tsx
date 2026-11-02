import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Edit3, ArrowLeft, Camera, Plus } from "lucide-react-native";

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

export function InboxView({ onBack, onSelectThread }: InboxViewProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"primary" | "requests">("primary");
  const [searchQuery, setSearchQuery] = useState("");

  const athleteNotes = [
    { id: "note_me", name: "Your note", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", note: "Heading to BGC 🏋️", isMe: true },
    { id: "note_1", name: "Miguel", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", note: "At Metro Core till 8pm 🔥" },
    { id: "note_2", name: "Alex", avatar: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=200&q=80", note: "Clay prep 🎾" },
    { id: "note_3", name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", note: "Leg day crushed 💪" },
  ];

  const threads: DMThread[] = [
    {
      id: "thread_coach_ramos",
      name: "Coach Miguel Ramos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      lastMessage: "Shared your Lift PR: View Raw Data (sets, reps & RPE)",
      timeAgo: "12m ago",
      unreadCount: 1,
      isOnline: true,
      type: "coach",
      badgeText: "COACH PRO",
    },
    {
      id: "thread_metro_core",
      name: "Metro Core Arena (GymDash)",
      avatar: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80",
      lastMessage: "B2B Staff Invite: Metro Core invited you to join as Staff",
      timeAgo: "1h ago",
      unreadCount: 1,
      isOnline: false,
      type: "handshake",
      badgeText: "B2B INVITE",
    },
    {
      id: "thread_bgc_pickleball",
      name: "BGC Pickleball Saturday 3v3",
      avatar: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=200&q=80",
      lastMessage: "Dave: Court A booked for 4:00 PM. See everyone there!",
      timeAgo: "3h ago",
      unreadCount: 0,
      isOnline: true,
      type: "group",
      badgeText: "GROUP (6)",
    },
    {
      id: "thread_sarah",
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      lastMessage: "Sent you a 1-day pass for Twins Fitness 🎟️",
      timeAgo: "1d ago",
      unreadCount: 0,
      isOnline: false,
      type: "direct",
    },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 50) + 6, height: Math.max(insets.top, 50) + 54 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={22} color="#FAFAFA" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={() => threads[0] && onSelectThread(threads[0])} style={styles.newMsgBtn}>
          <Edit3 size={18} color="#FAFAFA" />
        </TouchableOpacity>
      </View>

      {/* SEARCH BOX */}
      <View style={styles.searchBox}>
        <Search size={15} color="#71717A" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#71717A"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* INSTAGRAM DIRECT NOTES / ACTIVE TRAY */}
      <View style={styles.notesTray}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.notesScroll}>
          {athleteNotes.map((n) => (
            <View key={n.id} style={styles.noteItem}>
              <View style={styles.bubbleCloud}>
                <Text numberOfLines={1} style={styles.bubbleCloudText}>{n.note}</Text>
              </View>
              <View style={styles.noteAvatarWrap}>
                <Image source={{ uri: n.avatar }} style={styles.noteAvatar} />
                {n.isMe && (
                  <View style={styles.noteAddPill}>
                    <Plus size={10} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>
              <Text numberOfLines={1} style={styles.noteName}>{n.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        <TouchableOpacity onPress={() => setActiveTab("primary")} style={[styles.tabPill, activeTab === "primary" && styles.tabPillActive]}>
          <Text style={[styles.tabText, activeTab === "primary" && styles.tabTextActive]}>Primary</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("requests")} style={[styles.tabPill, activeTab === "requests" && styles.tabPillActive]}>
          <Text style={[styles.tabText, activeTab === "requests" && styles.tabTextActive]}>Requests (2)</Text>
        </TouchableOpacity>
      </View>

      {/* THREADS LIST */}
      <ScrollView style={styles.threadList} showsVerticalScrollIndicator={false}>
        {threads.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => onSelectThread(t)} style={styles.threadItem}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: t.avatar }} style={styles.avatar} />
              {t.isOnline && <View style={styles.onlineBadge} />}
            </View>

            <View style={styles.threadMeta}>
              <View style={styles.topMetaRow}>
                <Text style={styles.threadName}>{t.name}</Text>
                {t.badgeText && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{t.badgeText}</Text>
                  </View>
                )}
                <Text style={styles.threadTime}>{t.timeAgo}</Text>
              </View>
              <View style={styles.snippetRow}>
                <Text numberOfLines={1} style={[styles.lastMessage, t.unreadCount > 0 && styles.lastMessageUnread]}>
                  {t.lastMessage}
                </Text>
                {t.unreadCount > 0 ? (
                  <View style={styles.unreadDot} />
                ) : (
                  <Camera size={16} color="#71717A" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FAFAFA", fontSize: 16, fontWeight: "800" },
  newMsgBtn: { padding: 4 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#141418", borderRadius: 10, marginHorizontal: 16, marginTop: 10, paddingHorizontal: 12, height: 38, gap: 8, borderWidth: 1, borderColor: "#27272A" },
  searchInput: { flex: 1, color: "#FAFAFA", fontSize: 13 },
  notesTray: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  notesScroll: { paddingHorizontal: 16, gap: 14 },
  noteItem: { alignItems: "center", width: 72 },
  bubbleCloud: { backgroundColor: "#27272A", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 4, maxWidth: 74 },
  bubbleCloudText: { color: "#FAFAFA", fontSize: 9, fontWeight: "600", textAlign: "center" },
  noteAvatarWrap: { position: "relative", width: 50, height: 50 },
  noteAvatar: { width: "100%", height: "100%", borderRadius: 25 },
  noteAddPill: { position: "absolute", bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#09090B" },
  noteName: { color: "#A1A1AA", fontSize: 10, fontWeight: "600", marginTop: 4, textAlign: "center" },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: 10, borderBottomWidth: 1, borderBottomColor: "#18181B", gap: 16 },
  tabPill: { paddingBottom: 10 },
  tabPillActive: { borderBottomWidth: 2, borderBottomColor: "#E11D48" },
  tabText: { color: "#71717A", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#FAFAFA", fontWeight: "700" },
  threadList: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  threadItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#121215" },
  avatarContainer: { position: "relative" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  onlineBadge: { position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: "#10B981", borderWidth: 2, borderColor: "#09090B" },
  threadMeta: { flex: 1, marginLeft: 12 },
  topMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  threadName: { color: "#FAFAFA", fontSize: 14, fontWeight: "700", flex: 1 },
  badgePill: { backgroundColor: "rgba(225, 29, 72, 0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  badgePillText: { color: "#E11D48", fontSize: 9, fontWeight: "800" },
  threadTime: { color: "#71717A", fontSize: 11 },
  snippetRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  lastMessage: { color: "#A1A1AA", fontSize: 12, flex: 1 },
  lastMessageUnread: { color: "#FAFAFA", fontWeight: "700" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E11D48", marginLeft: 8 },
});
