import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, type LucideIcon } from "lucide-react-native";
import { MIN_TOUCH_TARGET } from "sodia-core";
import { useColors } from "../../theme/theme";

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  backLabel?: string;
  right?: { icon: LucideIcon; label: string; onPress: () => void };
}

/** Back / title / action bar for full-screen overlays (Inbox, Activity, ...). */
export function ScreenHeader({ title, onBack, backLabel = "Back", right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const RightIcon = right?.icon;
  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 20), backgroundColor: colors.bgHeader, borderBottomColor: colors.borderColor }]}>
      <TouchableOpacity onPress={onBack} style={styles.btn} accessibilityRole="button" accessibilityLabel={backLabel}>
        <ArrowLeft size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      {right && RightIcon ? (
        <TouchableOpacity onPress={right.onPress} style={styles.btn} accessibilityRole="button" accessibilityLabel={right.label}>
          <RightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.btn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 4, borderBottomWidth: 1 },
  btn: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "800", flex: 1, textAlign: "center" },
});
