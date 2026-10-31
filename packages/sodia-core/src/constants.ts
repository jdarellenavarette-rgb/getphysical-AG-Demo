/**
 * Global Ecosystem Constants & Resolved Architecture Rules (Version 3.0 / Phase 8 Locked)
 */

export const SODIA_FIELD_LIMITS = {
  POST_CAPTION_MAX_CHARS: 280,
  CHALLENGE_ENTRY_CAPTION_MAX_CHARS: 150,
  BIO_MAX_CHARS: 150,
  FITNESS_GOALS_MIN: 1,
  FITNESS_GOALS_MAX: 5,
  STORY_EXPIRY_HOURS: 24,
  QR_DYNAMIC_HASH_TTL_SECONDS: 60,
  OTP_CODE_LENGTH: 6,
  OTP_RESEND_COOLDOWN_SECONDS: 30,
  PIN_PINNED_LIFTS_MAX: 6,
  USERNAME_CHANGE_COOLDOWN_DAYS: 30,
  ACCOUNT_SOFT_DELETE_GRACE_DAYS: 30,
} as const;

export const REGISTRY_HARD_LIMITS = {
  COMMUNITY_CLUB_FREE_MEMBER_CAP: 19,
  COACH_FREE_CLIENT_CAP: 3,
  INVENTORY_PESSIMISTIC_LOCK_SECONDS: 180,
  WAITLIST_EXCLUSIVE_CLAIM_MINUTES: 15,
  COURT_CHANGEOVER_BUFFER_MINUTES: 15,
  ANTI_CHEAT_1RM_JUMP_THRESHOLD_RATIO: 0.15,
  CHURN_AT_RISK_EXPIRY_DAYS: 7,
  CHURN_AT_RISK_ABSENT_DAYS: 14,
  ORGANIZER_DORMANT_DAYS: 30,
  COACH_COMPLIANCE_DELTA_DAYS: 3,
  SLOW_NETWORK_THRESHOLD_MS: 2500,
} as const;

export const HYBRID_FEE_MODEL = {
  ONE_TIME_FIXED_FEE_PHP: 15,
  RECURRING_SUB_FEE_RATE: 0.05,
  GP_PLUS_MONTHLY_PRICE_PHP: 149,
  DEFAULT_STREAK_GOAL_PER_WEEK: 3,
  STREAK_TIMEZONE: "Asia/Manila",
  GIFT_PASS_VALIDITY_DAYS: 30,
} as const;

export type TransactionBillingKind = "one_time_pass" | "court_booking" | "event_ticket" | "recurring_subscription";

export interface FeeBreakdown {
  readonly baseAmountPhp: number;
  readonly serviceFeePhp: number;
  readonly totalChargePhp: number;
}

/**
 * Resolved Fee Model (Appendix E #1 & Section 8.11 #6):
 * Fixed ₱15 consumer fee on one-time passes/court bookings/tickets;
 * Flat 5% on recurring memberships.
 */
export function calculateHybridServiceFee(
  baseAmountPhp: number,
  billingKind: TransactionBillingKind
): FeeBreakdown {
  const sanitizedBase = Math.max(0, Math.round(baseAmountPhp * 100) / 100);
  const serviceFeePhp =
    billingKind === "recurring_subscription"
      ? Math.round(sanitizedBase * HYBRID_FEE_MODEL.RECURRING_SUB_FEE_RATE * 100) / 100
      : sanitizedBase > 0
        ? HYBRID_FEE_MODEL.ONE_TIME_FIXED_FEE_PHP
        : 0;

  return {
    baseAmountPhp: sanitizedBase,
    serviceFeePhp,
    totalChargePhp: Math.round((sanitizedBase + serviceFeePhp) * 100) / 100,
  };
}
