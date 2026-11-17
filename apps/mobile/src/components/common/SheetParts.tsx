import React from "react";
import { Pressable, StyleSheet, View, type GestureResponderHandlers } from "react-native";
import { useThemeStore } from "../../theme/theme";

/** Fills the area behind a sheet or dialog; tapping it closes the sheet. */
export function SheetBackdrop({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.backdrop}
      accessibilityRole="button"
      accessibilityLabel="Close"
      // Screen-reader users close with the sheet's own close button.
      importantForAccessibility="no"
      accessible={false}
    />
  );
}

/** The grab bar at the top of a bottom sheet. Drag it down to close. */
export function SheetGrabber({ panHandlers }: { panHandlers: GestureResponderHandlers }) {
  const { colors } = useThemeStore();
  return (
    <View {...panHandlers} style={styles.grabArea}>
      <View style={[styles.grabBar, { backgroundColor: colors.borderColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  // Tall enough to be an easy target without stealing touches from the content below.
  grabArea: { alignSelf: "stretch", alignItems: "center", paddingTop: 10, paddingBottom: 12 },
  grabBar: { width: 40, height: 5, borderRadius: 3 },
});
