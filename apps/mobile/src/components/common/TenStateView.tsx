import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { AlertCircle, WifiOff, Clock, Search, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react-native";
import type { TenStateEnvelope } from "sodia-core";

interface TenStateViewProps<T> {
  state: TenStateEnvelope<T>;
  onRetry?: () => void;
  children: (data: T) => React.ReactNode;
}

export function TenStateView<T>({ state, onRetry, children }: TenStateViewProps<T>) {
  switch (state.status) {
    case "loading":
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E11D48" />
          <Text style={styles.loadingText}>Syncing GetPhysical state...</Text>
        </View>
      );

    case "empty":
      return (
        <View style={styles.centerContainer}>
          <AlertCircle size={44} color="#94A3B8" />
          <Text style={styles.stateTitle}>Nothing here yet</Text>
          <Text style={styles.stateSubtitle}>{state.emptyReason}</Text>
          {onRetry && (
            <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
              <Text style={styles.primaryButtonText}>{state.primaryActionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      );

    case "error":
      return (
        <View style={styles.centerContainer}>
          <AlertCircle size={44} color="#EF4444" />
          <Text style={styles.stateTitle}>Unable to Load Data</Text>
          <Text style={styles.stateSubtitle}>{state.userMessage}</Text>
          {state.retryable && onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <RefreshCw size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.primaryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      );

    case "no_internet":
      return (
        <View style={{ flex: 1 }}>
          <View style={styles.offlineBanner}>
            <WifiOff size={16} color="#F59E0B" />
            <Text style={styles.offlineText}>Offline Mode • Viewing Cached Content</Text>
          </View>
          {state.data ? children(state.data) : (
            <View style={styles.centerContainer}>
              <Text style={styles.stateSubtitle}>Connect to the internet to fetch fresh records.</Text>
            </View>
          )}
        </View>
      );

    case "slow_network":
      return (
        <View style={{ flex: 1 }}>
          <View style={styles.slowBanner}>
            <Clock size={16} color="#EAB308" />
            <Text style={styles.slowText}>Slow network detected ({state.network.latencyMs}ms). Optimistic mode active.</Text>
          </View>
          {state.data && children(state.data)}
        </View>
      );

    case "no_search_results":
      return (
        <View style={styles.centerContainer}>
          <Search size={44} color="#64748B" />
          <Text style={styles.stateTitle}>No Results Found</Text>
          <Text style={styles.stateSubtitle}>No matches found for "{state.search.query}".</Text>
          {onRetry && (
            <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
              <Text style={styles.primaryButtonText}>Clear Search & Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      );

    case "permission_denied":
      return (
        <View style={styles.centerContainer}>
          <ShieldAlert size={44} color="#F97316" />
          <Text style={styles.stateTitle}>Permission Required</Text>
          <Text style={styles.stateSubtitle}>
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
        <View style={styles.centerContainer}>
          <ShieldAlert size={44} color="#E11D48" />
          <Text style={styles.stateTitle}>Session Stale</Text>
          <Text style={styles.stateSubtitle}>Authenticate with biometrics or PIN to resume.</Text>
          {onRetry && (
            <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
              <Text style={styles.primaryButtonText}>Unlock with FaceID / Biometrics</Text>
            </TouchableOpacity>
          )}
        </View>
      );

    case "form_validation":
      return (
        <View style={styles.centerContainer}>
          <AlertCircle size={44} color="#EF4444" />
          <Text style={styles.stateTitle}>Validation Required</Text>
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
    backgroundColor: "#09090B",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#A1A1AA",
    fontWeight: "500",
  },
  stateTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#FAFAFA",
  },
  stateSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#A1A1AA",
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
    backgroundColor: "#27272A",
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
    backgroundColor: "#18181B",
    borderColor: "#F59E0B",
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
    backgroundColor: "#18181B",
    borderBottomWidth: 1,
    borderColor: "#EAB308",
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
