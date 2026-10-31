import {
  EXPLICIT_COLUMNS,
  HYBRID_FEE_MODEL,
  SODIA_FIELD_LIMITS,
  UI_STATE_KINDS,
  calculateHybridServiceFee,
  createLoadingState,
  type TenStateEnvelope,
  type ProfileRow,
} from "sodia-core";

export const MOBILE_CORE_BINDING = {
  appIdentifier: "sodia-mobile-b2c-and-role-harness",
  supportedStates: UI_STATE_KINDS,
  limits: SODIA_FIELD_LIMITS,
  feeModel: HYBRID_FEE_MODEL,
  profileSelector: EXPLICIT_COLUMNS.PROFILES,
  sampleFeePreview: calculateHybridServiceFee(250, "one_time_pass"),
} as const;

export function createInitialProfileEnvelope(): TenStateEnvelope<ProfileRow> {
  return createLoadingState<ProfileRow>(1, null);
}
