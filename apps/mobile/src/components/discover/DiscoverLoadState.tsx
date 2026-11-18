import React from "react";
import { StyleSheet, View } from "react-native";
import { CloudOff, MapPin } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import { EmptyState } from "../common/EmptyState";

interface DiscoverLoadStateProps {
  status: "loading" | "error" | "empty";
  error: string | null;
  onRetry: () => void;
}

/** What Discover shows before there are venues to list: placeholders, a retry, or "none yet". */
export function DiscoverLoadState({ status, error, onRetry }: DiscoverLoadStateProps) {
  const { colors } = useThemeStore();

  if (status === "loading") {
    return (
      <View accessibilityLabel="Loading venues" style={styles.skeletonList}>
        {[0, 1, 2, 3].map((row) => (
          <View key={row} style={[styles.skeletonCard, { backgroundColor: colors.bgCardSecondary }]} />
        ))}
      </View>
    );
  }
  if (status === "error") {
    return (
      <EmptyState
        icon={CloudOff}
        title="Couldn't load venues"
        body={error ?? "Something went wrong. Please retry."}
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }
  return (
    <EmptyState
      icon={MapPin}
      title="No venues yet"
      body="Venues appear here as soon as they join GetPhysical."
      actionLabel="Refresh"
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  skeletonList: { padding: 16, gap: 12 },
  skeletonCard: { height: 92, borderRadius: 14, opacity: 0.6 },
});
