import React, { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera } from "lucide-react-native";
import { useColors } from "../../../theme/theme";
import type { DMThread } from "../InboxView";

function ThreadRowImpl({ thread: t, onPress }: { thread: DMThread; onPress: (t: DMThread) => void }) {
  const colors = useColors();
  const unread = t.unreadCount > 0;
  return (
    <TouchableOpacity
      onPress={() => onPress(t)}
      style={[styles.row, { borderBottomColor: colors.borderLight }]}
      accessibilityRole="button"
      accessibilityLabel={`${t.name}${unread ? `, ${t.unreadCount} unread` : ""}. ${t.lastMessage}. ${t.timeAgo}`}
    >
      <View>
        <Image source={{ uri: t.avatar }} style={styles.avatar} />
        {t.isOnline && <View style={[styles.online, { borderColor: colors.bgScreen, backgroundColor: colors.accentGreen }]} />}
      </View>
      <View style={styles.meta}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{t.name}</Text>
          {t.badgeText ? (
            <View style={[styles.badge, { backgroundColor: colors.accentMuted }]}>
              <Text style={[styles.badgeText, { color: colors.accentText }]}>{t.badgeText}</Text>
            </View>
          ) : null}
          <Text style={[styles.time, { color: colors.textMuted }]}>{t.timeAgo}</Text>
        </View>
        <View style={styles.snippetRow}>
          <Text numberOfLines={1} style={[styles.snippet, { color: unread ? colors.textPrimary : colors.textSecondary }, unread && styles.bold]}>
            {t.lastMessage}
          </Text>
          {unread ? <View style={[styles.dot, { backgroundColor: colors.accent }]} /> : <Camera size={18} color={colors.textMuted} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const ThreadRow = memo(ThreadRowImpl);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  online: { position: "absolute", bottom: 2, right: 2, width: 13, height: 13, borderRadius: 7, borderWidth: 2 },
  meta: { flex: 1, marginLeft: 12 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 15, fontWeight: "700", flex: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  time: { fontSize: 12 },
  snippetRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, gap: 8 },
  snippet: { fontSize: 13, flex: 1 },
  bold: { fontWeight: "700" },
  dot: { width: 9, height: 9, borderRadius: 5 },
});
