/**
 * Canonical 10-State Frontend-Backend Architecture Contract
 * Enforced across all Sodia (Mobile) and GymDash/Clubdash/CoachDash (Web) flows.
 */

export const UI_STATE_KINDS = [
  "empty",
  "loading",
  "error",
  "no_internet",
  "slow_network",
  "no_search_results",
  "permission_denied",
  "session_expired",
  "form_validation",
  "success",
] as const;

export type UIStateKind = (typeof UI_STATE_KINDS)[number];

export type OSResourcePermission =
  | "location"
  | "camera"
  | "microphone"
  | "contacts"
  | "photos"
  | "notifications"
  | "health_kit"
  | "biometrics";

export interface ValidationIssue {
  readonly field: string;
  readonly code: string;
  readonly message: string;
  readonly suggestions?: readonly string[];
}

export interface OfflineFallbackMeta {
  readonly cachedAtIso: string | null;
  readonly queuedMutationsCount: number;
  readonly totpFallbackActive: boolean;
}

export interface SlowNetworkMeta {
  readonly latencyMs: number;
  readonly thresholdMs: number;
  readonly degradedMediaMode: boolean;
}

export interface SearchEmptyMeta {
  readonly query: string;
  readonly activeFilters: readonly string[];
  readonly suggestedAlternatives: readonly string[];
  readonly allowManualEntry: boolean;
}

export interface PermissionDeniedMeta {
  readonly permission: OSResourcePermission;
  readonly canAskAgain: boolean;
  readonly fallbackMode:
    | "zip_code_seed"
    | "manual_lookup_input"
    | "username_search"
    | "manual_macro_log"
    | "pin_fallback"
    | "settings_deeplink";
}

export interface SessionExpiredMeta {
  readonly requiresBiometricReauth: boolean;
  readonly preservedDraftKey: string | null;
  readonly reason: "token_stale" | "token_locked" | "revoked";
}

export type TenStateEnvelope<TData> =
  | {
      readonly status: "empty";
      readonly data: null;
      readonly emptyReason: string;
      readonly primaryActionLabel: string;
    }
  | {
      readonly status: "loading";
      readonly data: TData | null;
      readonly skeletonCount: number;
    }
  | {
      readonly status: "error";
      readonly data: TData | null;
      readonly errorCode: string;
      readonly userMessage: string;
      readonly retryable: boolean;
    }
  | {
      readonly status: "no_internet";
      readonly data: TData | null;
      readonly offline: OfflineFallbackMeta;
    }
  | {
      readonly status: "slow_network";
      readonly data: TData | null;
      readonly network: SlowNetworkMeta;
    }
  | {
      readonly status: "no_search_results";
      readonly data: null;
      readonly search: SearchEmptyMeta;
    }
  | {
      readonly status: "permission_denied";
      readonly data: TData | null;
      readonly permissionMeta: PermissionDeniedMeta;
    }
  | {
      readonly status: "session_expired";
      readonly data: TData | null;
      readonly session: SessionExpiredMeta;
    }
  | {
      readonly status: "form_validation";
      readonly data: TData | null;
      readonly issues: readonly ValidationIssue[];
    }
  | {
      readonly status: "success";
      readonly data: TData;
      readonly updatedAtIso: string;
    };

export function createSuccessState<TData>(data: TData): TenStateEnvelope<TData> {
  return {
    status: "success",
    data,
    updatedAtIso: new Date().toISOString(),
  };
}

export function createLoadingState<TData>(
  skeletonCount = 3,
  previousData: TData | null = null
): TenStateEnvelope<TData> {
  return {
    status: "loading",
    data: previousData,
    skeletonCount,
  };
}

export function createEmptyState<TData = null>(
  emptyReason: string,
  primaryActionLabel: string
): TenStateEnvelope<TData> {
  return {
    status: "empty",
    data: null,
    emptyReason,
    primaryActionLabel,
  };
}

