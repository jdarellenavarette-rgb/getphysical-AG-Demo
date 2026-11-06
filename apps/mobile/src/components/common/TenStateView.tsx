import React from "react";
import { Linking, View } from "react-native";
import { AlertCircle, Inbox, PenLine, RefreshCw, Search, ServerCrash, ShieldAlert, Fingerprint, type LucideIcon } from "lucide-react-native";
import type { OSResourcePermission, TenStateEnvelope } from "sodia-core";
import { useColors } from "../../theme/theme";
import { SkeletonList, type SkeletonVariant } from "../states/Skeleton";
import { NetworkBanner, StateCard, type StateAction } from "../states/StateCard";

export interface TenStateViewProps<T> {
  state: TenStateEnvelope<T>;
  children: (data: T) => React.ReactNode;
  /** Layout-matched skeleton for `loading` — a variant or a custom render. */
  skeleton?: SkeletonVariant | (() => React.ReactNode);
  /** `empty` primary CTA (label comes from the envelope). */
  onPrimaryAction?: () => void;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  onRetry?: () => void;
  /** `no_search_results` — "Clear filters" reset. */
  onClearSearch?: () => void;
  /** `no_search_results` — shown when envelope allows manual entry. */
  onManualEntry?: () => void;
  manualEntryLabel?: string;
  onSelectSuggestion?: (suggestion: string) => void;
  /** `permission_denied` — contextual fallback UI (zip seed, manual lookup...). */
  permissionFallback?: React.ReactNode;
  /** `session_expired` — native biometric re-auth trigger. */
  onUnlockSession?: () => void;
  /** Render inline (inside sheets / list headers) instead of filling the screen. */
  compact?: boolean;
}

const PERMISSION_COPY: Record<OSResourcePermission, string> = {
  location: "Location",
  camera: "Camera",
  microphone: "Microphone",
  contacts: "Contacts",
  photos: "Photos",
  notifications: "Notifications",
  health_kit: "Health",
  biometrics: "Face ID / Biometrics",
};

function isServerFault(code: string): boolean {
  return /^(5\d\d|E5|SRV|SERVER)/i.test(code);
}

export function TenStateView<T>(props: TenStateViewProps<T>) {
  const { state, children, compact } = props;
  const colors = useColors();

  switch (state.status) {
    case "loading": {
      if (typeof props.skeleton === "function") return <>{props.skeleton()}</>;
      return <SkeletonList variant={props.skeleton ?? "row"} count={state.skeletonCount} />;
    }

    case "empty": {
      const actions: StateAction[] = props.onPrimaryAction ? [{ label: state.primaryActionLabel, onPress: props.onPrimaryAction }] : [];
      return (
        <StateCard compact={compact} icon={props.emptyIcon ?? Inbox} title={props.emptyTitle ?? "Nothing here yet"} message={state.emptyReason} actions={actions} />
      );
    }

    case "error": {
      const server = isServerFault(state.errorCode);
      const actions: StateAction[] = state.retryable && props.onRetry ? [{ label: "Retry", onPress: props.onRetry, icon: RefreshCw }] : [];
      return (
        <StateCard
          compact={compact}
          icon={server ? ServerCrash : AlertCircle}
          iconColor={colors.danger}
          title={server ? "Our servers hit a snag" : "Something went wrong"}
          message={state.userMessage}
          footnote={`Reference code: ${state.errorCode}`}
          actions={actions}
        />
      );
    }

    case "no_internet": {
      const queued = state.offline.queuedMutationsCount;
      const detail = queued > 0 ? `Offline • ${queued} change${queued === 1 ? "" : "s"} will sync when you reconnect` : "Offline • Showing saved content";
      return (
        <View style={{ flex: compact ? 0 : 1 }}>
          <NetworkBanner kind="offline" detail={detail} />
          {state.data !== null ? (
            children(state.data)
          ) : (
            <StateCard compact={compact} icon={AlertCircle} title="You're offline" message="Reconnect to load fresh content." actions={props.onRetry ? [{ label: "Try again", onPress: props.onRetry, icon: RefreshCw }] : []} />
          )}
        </View>
      );
    }

    case "slow_network":
      return (
        <View style={{ flex: compact ? 0 : 1 }}>
          <NetworkBanner kind="slow" detail={`Slow connection (${(state.network.latencyMs / 1000).toFixed(1)}s) • Using low-res previews`} />
          {state.data !== null ? children(state.data) : <SkeletonList variant={typeof props.skeleton === "string" ? props.skeleton : "row"} count={3} />}
        </View>
      );

    case "no_search_results": {
      const actions: StateAction[] = [];
      if (props.onClearSearch) actions.push({ label: "Clear filters", onPress: props.onClearSearch, variant: "secondary" });
      if (state.search.allowManualEntry && props.onManualEntry) actions.unshift({ label: props.manualEntryLabel ?? "Add it manually", onPress: props.onManualEntry, icon: PenLine });
      const suggestions = props.onSelectSuggestion ? state.search.suggestedAlternatives : [];
      return (
        <StateCard
          compact={compact}
          icon={Search}
          title="No results"
          message={state.search.query ? `Nothing matches "${state.search.query}".` : "Nothing matches your filters."}
          actions={[...suggestions.slice(0, 3).map((s) => ({ label: `Try "${s}"`, onPress: () => props.onSelectSuggestion?.(s), variant: "secondary" as const })), ...actions]}
        />
      );
    }

    case "permission_denied": {
      const name = PERMISSION_COPY[state.permissionMeta.permission];
      return (
        <StateCard
          compact={compact}
          icon={ShieldAlert}
          iconColor={colors.warning}
          title={`${name} access is off`}
          message={`Turn on ${name} in Settings, or continue below.`}
          actions={[{ label: "Open Settings", onPress: () => { Linking.openSettings().catch(() => undefined); }, variant: "secondary" }]}
        >
          {props.permissionFallback}
        </StateCard>
      );
    }

    case "session_expired":
      return (
        <StateCard
          compact={compact}
          icon={Fingerprint}
          iconColor={colors.accentText}
          title="Session locked"
          message="Your drafts are saved. Verify it's you to continue."
          actions={props.onUnlockSession ? [{ label: "Unlock with Face ID", onPress: props.onUnlockSession, icon: Fingerprint }] : []}
        />
      );

    case "form_validation":
      return (
        <View style={{ flex: compact ? 0 : 1 }}>
          <StateCard compact icon={AlertCircle} iconColor={colors.danger} title="Check the highlighted fields" message={state.issues.map((i) => i.message).join("\n")} />
          {state.data !== null ? children(state.data) : null}
        </View>
      );

    case "success":
      return <>{children(state.data)}</>;
  }
}
