import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { AlertCircle, WifiOff, Clock, Search, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react-native";
import type { TenStateEnvelope } from "sodia-core";
import { useThemeStore } from "../../theme/theme";

interface TenStateViewProps<T> {
  state: TenStateEnvelope<T>;
  onRetry?: () => void;
  children: (data: T) => React.ReactNode;
}

export function TenStateView<T>({ state, onRetry, children }: TenStateViewProps<T>) {
  const { colors } = useThemeStore();

  switch (state.status) {
    case "loading":
      return (
        <View style={[styles.centerContainer, { backgroundColor: colors.bgScreen }]}>
          <ActivityIndicator size="large" color="#E11D48" />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Syncing GetPhysical state...</Text>
        </View>
      );

    case "empty":
      return (
        <View style={[styles.centerContainer, { backgroundColor: colors.bgScreen }]}>
          <AlertCircle size={44} color={colors.textMuted} />
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Nothing here yet</Text>
          <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>{state.emptyReason}</Text>
          {onRetry && (
            <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
              <Text style={styles.primaryButtonText}>{state.primaryActionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      );

    case "error":
      return (
        <View style={[styles.centerContainer, { backgroundColor: colors.bgScreen }]}>
          <AlertCircle size={44} color="#EF4444" />
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Unable to Load Data</Text>
          <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>{state.userMessage}</Text>
          {state.retryable && onRetry && (
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor, borderWidth: 1 }]} onPress={onRetry}>
              <RefreshCw size={16} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.primaryButtonText, { color: colors.textPrimary }]}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      );

    case "no_internet":
      return (
        <View style={{ flex: 1, backgroundColor: colors.bgScreen }}>
          <View style={[styles.offlineBanner, { backgroundColor: colors.bgCard, borderColor: "#F59E0B" }]}>
            <WifiOff size={16} color="#F59E0B" />
            <Text style={styles.offlineText}>Offline Mode • Viewing Cached Content</Text>
          </View>
          {state.data ? children(state.data) : (
            <View style={[styles.centerContainer, { backgroundColor: colors.bgScreen }]}>
              <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>Connect to the internet to fetch fresh records.</Text>
            </View>
          )}
        </View>
      );

    case "slow_network":
      return (
        <View style={{ flex: 1, backgroundColor: colors.bgScreen }}>
          <View style={[styles.slowBanner, { backgroundColor: colors.bgCard, borderColor: "#EAB308" }]}>
            <Clock size={16} color="#EAB308" />
            <Text style={styles.slowText}>Slow network detected ({state.network.latencyMs}ms). Optimistic mode active.</Text>
          </View>
          {state.data && children(state.data)}
        </View>
      );

    case "no_search_results":
      return (
        <View style={[styles.centerContainer, { backgroundColor: colors.bgScreen }]}>
          <Search size={44} color={colors.textMuted} />
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>No Results Found</Text>
          <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>No matches found for "{state.search.query}".</Text>
          {onRetry && (
            <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
              <Text style={styles.primaryButtonText}>Clear Search & Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      );

    case "permission_denied":
      return (
        <View style={[styles.centerContainer, { backgroundColor: colors.bgScreen }]}>
          <ShieldAlert size={44} color="#F97316" />
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Permission Required</Text>
          <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>
            Access to {state.permissionMeta.permission} was denied. Enable it in device settings to use this feature.
          </Text>
          {onRetry && (
            <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
              <Text style={styles.primaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
          )}
        </View>
      );

    case "session_expired":
      return (
        <View style={[styles.centerContainer, { backgroundColor: colors.bgScreen }]}>
          <ShieldAlert size={44} color="#E11D48" />
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Session Stale</Text>
          <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>Authenticate with biometrics or PIN to resume.</Text>
          {onRetry && (
            <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
              <Text style={styles.primaryButtonText}>Unlock with FaceID / Biometrics</Text>
            </TouchableOpacity>
          )}
        </View>
      );

    case "form_validation":
      return (
        <View style={[styles.centerContainer, { backgroundColor: colors.bgScreen }]}>
          <AlertCircle size={44} color="#EF4444" />
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Validation Required</Text>
          {state.issues.map((iss, idx) => (
            <Text key={idx} style={styles.issueText}>• {iss.field}: {iss.message}</Text>
          ))}
        </View>
      );

    case "success":
      return <>{children(state.data)}</>;
  }
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  stateTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
  },
  stateSubtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: "#E11D48",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  offlineBanner: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  offlineText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
  slowBanner: {
    borderBottomWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  slowText: {
    color: "#EAB308",
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 6,
  },
  issueText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});
