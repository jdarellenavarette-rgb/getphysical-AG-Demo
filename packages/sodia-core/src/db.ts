/**
 * Hand-maintained helpers on top of the generated ./database.types.ts.
 * Keeping these separate means `supabase gen types` can overwrite the
 * generated file without losing aliases or column selectors.
 */
import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "./database.types";

export type TableName = keyof Database["public"]["Tables"];
export type TableRow<T extends TableName> = Tables<T>;
export type TableInsert<T extends TableName> = TablesInsert<T>;
export type TableUpdate<T extends TableName> = TablesUpdate<T>;

export type ProfileRow = TableRow<"profiles">;
export type FacilityRow = TableRow<"facilities">;
export type FacilityStaffRow = TableRow<"facility_staff">;
export type FacilityMembershipRow = TableRow<"facility_memberships">;
export type PassRow = TableRow<"passes">;
export type PassCredentialRow = TableRow<"pass_credentials">;
export type LedgerTransactionRow = TableRow<"ledger_transactions">;
export type AccessScanRow = TableRow<"access_scans">;
export type SodiaPostRow = TableRow<"sodia_posts">;
export type SodiaStoryRow = TableRow<"sodia_stories">;
export type PRChallengeRow = TableRow<"pr_challenges">;
export type ChallengeEntryRow = TableRow<"challenge_entries">;
export type TournamentMatchRow = TableRow<"tournament_matches">;
export type WorkoutLiftRow = TableRow<"workouts_lift">;
export type WorkoutMoveRow = TableRow<"workouts_move">;
export type FoodLogRow = TableRow<"food_logs">;
export type HydrationLogRow = TableRow<"hydration_logs">;
export type ConversationRow = TableRow<"conversations">;
export type MessageRow = TableRow<"messages">;
export type CrmBroadcastRow = TableRow<"crm_broadcasts">;
export type PaymentOrderRow = TableRow<"payment_orders">;

export type RegistryType = Enums<"registry_type">;
export type FacilityRole = Enums<"facility_role">;
export type PaymentProvider = Enums<"payment_provider">;
export type PaymentOrderStatus = Enums<"payment_order_status">;

/**
 * Explicit column selectors (AGENTS.md §4: never `select('*')`).
 * Only columns the `authenticated` role is granted may appear here —
 * e.g. profiles.dob is private and is read through get_my_profile().
 */
export const EXPLICIT_COLUMNS = {
  PROFILES:
    "id, username, name, first_name, last_name, avatar, avatar_url, cover_url, bio, home_location, user_roles, active_role, is_private, streak_goal_per_week, streak_weeks, default_launch_tab, soft_deleted_at, created_at, updated_at",
  FACILITIES:
    "id, name, registry, registry_type, plan, category, logo, logo_url, cover_image, cover_url, address, lat, lng, hours, amenities, inside_now_count, max_capacity, is_open, day_pass_price_php, monthly_sub_price_php, court_hourly_price_php, free_member_count, rating, review_count, has_active_challenge, challenge_title, created_at",
  FACILITY_STAFF: "facility_id, user_id, role, created_at",
  PASSES:
    "id, owner_id, facility_id, sku_id, pass_type, status, valid_until, gifted_by_user_id, payment_order_id, created_at",
  PASS_CREDENTIALS: "pass_id, secret, rotated_at",
  LEDGER_TRANSACTIONS:
    "id, reference_no, idempotency_key, user_id, member_name, buyer_display_name, facility_id, facility_name, type, entry_type, amount, gross_amount_php, platform_fee_php, net_facility_amount_php, description, method, payment_method, status, reversing_transaction_id, payment_order_id, timestamp",
  ACCESS_SCANS:
    "id, facility_id, user_id, pass_id, scanned_by, member_name, avatar, status, reason, created_at",
  SODIA_POSTS:
    "id, user_id, author_name, author_avatar, author_role, content, media_url, likes_count, comments_count, facility_tag, stamp, created_at",
  PR_CHALLENGES:
    "id, title, category, benchmark, facility_id, expires_in_days, participants_count, created_at",
  TOURNAMENT_MATCHES:
    "id, facility_id, sport, round, player_a, player_b, score_a, score_b, status, court_slot, updated_at",
  CONVERSATIONS:
    "id, kind, facility_id, athlete_id, title, created_at, last_message_at",
  MESSAGES:
    "id, conversation_id, sender_id, sender_kind, body, broadcast_id, created_at",
  CRM_BROADCASTS:
    "id, facility_id, created_by, suite_mode, audience, segment_id, target_user_id, title, body, promo_code, badge_text, recipient_count, created_at",
  PAYMENT_ORDERS:
    "id, user_id, facility_id, sku, billing_kind, base_amount_php, service_fee_php, total_php, currency, provider, checkout_url, status, failure_reason, pass_id, paid_at, created_at",
} as const;
