import {
  EXPLICIT_COLUMNS,
  REGISTRY_HARD_LIMITS,
  UI_STATE_KINDS,
  createLoadingState,
  type FacilityRow,
  type LedgerTransactionRow,
  type TenStateEnvelope,
} from "sodia-core";

export const WEB_OS_CORE_BINDING = {
  appIdentifier: "gymdash-clubdash-coachdash-web-os",
  supportedStates: UI_STATE_KINDS,
  registryLimits: REGISTRY_HARD_LIMITS,
  facilitySelector: EXPLICIT_COLUMNS.FACILITIES,
  ledgerSelector: EXPLICIT_COLUMNS.LEDGER_TRANSACTIONS,
  supavisorPoolerPort: 6543,
} as const;

export function createInitialFacilityEnvelope(): TenStateEnvelope<FacilityRow> {
  return createLoadingState<FacilityRow>(1, null);
}

export function createInitialLedgerEnvelope(): TenStateEnvelope<readonly LedgerTransactionRow[]> {
  return createLoadingState<readonly LedgerTransactionRow[]>(5, null);
}
