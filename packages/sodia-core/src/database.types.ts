/**
 * Strict PostgreSQL Database Entities & Explicit Column Selectors
 * Rule 4 (AGENTS.md): NEVER use `any` and NEVER write `select('*')`.
 */

export type RegistryType = "COMMERCIAL" | "COMMUNITY";

export type UserRole =
  | "individual"
  | "staff"
  | "coach"
  | "organizer"
  | "facility_owner";

export type AuthorIdentityType = "individual" | "facility" | "coach";

export type PassStatus =
  | "active"
  | "expiring_soon"
  | "expired"
  | "paused"
  | "used_today";

export type LedgerEntryType =
  | "purchase"
  | "renewal"
  | "refund"
  | "check_in"
  | "expiry"
  | "cancellation"
  | "failed_payment"
  | "waitlist_joined"
  | "gift_sent"
  | "gift_received"
  | "floor_fee_split";

export interface ProfileRow {
  readonly id: string;
  readonly phone_hash: string;
  readonly username: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly avatar_url: string | null;
  readonly cover_url: string | null;
  readonly bio: string;
  readonly dob: string;
  readonly home_location: string;
  readonly user_roles: readonly UserRole[];
  readonly is_private: boolean;
  readonly streak_goal_per_week: number;
  readonly default_launch_tab: "sodia" | "cards";
  readonly soft_deleted_at: string | null;
  readonly created_at: string;
}

export interface FacilityRow {
  readonly id: string;
  readonly name: string;
  readonly registry_type: RegistryType;
  readonly logo_url: string;
  readonly cover_url: string;
  readonly address: string;
  readonly lat: number;
  readonly lng: number;
  readonly inside_now_count: number;
  readonly max_capacity: number;
  readonly is_open: boolean;
  readonly day_pass_price_php: number | null;
  readonly monthly_sub_price_php: number | null;
  readonly court_hourly_price_php: number | null;
  readonly free_member_count: number;
  readonly created_at: string;
}

export interface PassRow {
  readonly id: string;
  readonly owner_id: string;
  readonly facility_id: string;
  readonly sku_id: string;
  readonly pass_type: string;
  readonly status: PassStatus;
  readonly valid_until: string;
  readonly gifted_by_user_id: string | null;
  readonly created_at: string;
}

export interface LedgerTransactionRow {
  readonly id: string;
  readonly idempotency_key: string;
  readonly user_id: string | null;
  readonly buyer_display_name: string;
  readonly facility_id: string;
  readonly entry_type: LedgerEntryType;
  readonly gross_amount_php: number;
  readonly platform_fee_php: number;
  readonly net_facility_amount_php: number;
  readonly payment_method: string;
  readonly reference_no: string;
  readonly reversing_transaction_id: string | null;
  readonly created_at: string;
}

/**
 * Explicit Column Selectors (Enforces AGENTS.md Zero `select('*')` Law)
 */
export const EXPLICIT_COLUMNS = {
  PROFILES:
    "id, phone_hash, username, first_name, last_name, avatar_url, cover_url, bio, dob, home_location, user_roles, is_private, streak_goal_per_week, default_launch_tab, soft_deleted_at, created_at",
  FACILITIES:
    "id, name, registry_type, logo_url, cover_url, address, lat, lng, inside_now_count, max_capacity, is_open, day_pass_price_php, monthly_sub_price_php, court_hourly_price_php, free_member_count, created_at",
  PASSES:
    "id, owner_id, facility_id, sku_id, pass_type, status, valid_until, gifted_by_user_id, created_at",
  LEDGER_TRANSACTIONS:
    "id, idempotency_key, user_id, buyer_display_name, facility_id, entry_type, gross_amount_php, platform_fee_php, net_facility_amount_php, payment_method, reference_no, reversing_transaction_id, created_at",
} as const;
