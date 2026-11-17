import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Bell } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

interface ActivityViewProps {
  onBack: () => void;
}

/**
 * Notifications. Nothing is delivered yet, so this is the empty state; the
 * list is added when likes, follows and challenge updates come from the server.
 */
export function ActivityView({ onBack }: ActivityViewProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
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
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Close activity"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Activity</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.emptyState}>
        <Bell size={36} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No activity yet</Text>
        <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
          Likes, follows and challenge updates will show up here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "800" },
  emptyBody: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
