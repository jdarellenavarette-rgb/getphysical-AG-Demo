/**
 * Supabase Database Types & Explicit Column Selectors
 * Generated directly from Supabase project: brctciqhsyjqxfoqyuoz (GA Postgres 17)
 * Enforces AGENTS.md rule: Zero `any`, Zero `select('*')`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      access_scans: {
        Row: {
          avatar: string | null;
          created_at: string | null;
          facility_id: string | null;
          id: string;
          member_name: string;
          reason: string | null;
          status: string;
          user_id: string | null;
        };
        Insert: {
          avatar?: string | null;
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          member_name: string;
          reason?: string | null;
          status: string;
          user_id?: string | null;
        };
        Update: {
          avatar?: string | null;
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          member_name?: string;
          reason?: string | null;
          status?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "access_scans_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
        ];
      };
      challenge_entries: {
        Row: {
          challenge_id: string | null;
          created_at: string | null;
          id: string;
          proof_video: string | null;
          status: string | null;
          user_id: string | null;
          user_name: string;
          value: number;
        };
        Insert: {
          challenge_id?: string | null;
          created_at?: string | null;
          id?: string;
          proof_video?: string | null;
          status?: string | null;
          user_id?: string | null;
          user_name: string;
          value: number;
        };
        Update: {
          challenge_id?: string | null;
          created_at?: string | null;
          id?: string;
          proof_video?: string | null;
          status?: string | null;
          user_id?: string | null;
          user_name?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "challenge_entries_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "pr_challenges";
            referencedColumns: ["id"];
          },
        ];
      };
      facilities: {
        Row: {
          address: string;
          amenities: string[] | null;
          category: string;
          challenge_title: string | null;
          coords: Json;
          court_hourly_price: number | null;
          court_hourly_price_php: number | null;
          cover_image: string | null;
          cover_url: string | null;
          created_at: string | null;
          day_pass_price: number | null;
          day_pass_price_php: number | null;
          distance: string | null;
          free_member_count: number | null;
          has_active_challenge: boolean | null;
          hours: string | null;
          id: string;
          inside_now_count: number | null;
          is_open: boolean | null;
          lat: number | null;
          live_capacity: Json;
          lng: number | null;
          logo: string | null;
          logo_url: string | null;
          max_capacity: number | null;
          monthly_sub_price: number | null;
          monthly_sub_price_php: number | null;
          name: string;
          rating: number | null;
          registry: string;
          registry_type: string | null;
          review_count: number | null;
          spatial_assets: Json | null;
        };
        Insert: {
          address: string;
          amenities?: string[] | null;
          category: string;
          challenge_title?: string | null;
          coords?: Json;
          court_hourly_price?: number | null;
          court_hourly_price_php?: number | null;
          cover_image?: string | null;
          cover_url?: string | null;
          created_at?: string | null;
          day_pass_price?: number | null;
          day_pass_price_php?: number | null;
          distance?: string | null;
          free_member_count?: number | null;
          has_active_challenge?: boolean | null;
          hours?: string | null;
          id: string;
          inside_now_count?: number | null;
          is_open?: boolean | null;
          lat?: number | null;
          live_capacity?: Json;
          lng?: number | null;
          logo?: string | null;
          logo_url?: string | null;
          max_capacity?: number | null;
          monthly_sub_price?: number | null;
          monthly_sub_price_php?: number | null;
          name: string;
          rating?: number | null;
          registry: string;
          registry_type?: string | null;
          review_count?: number | null;
          spatial_assets?: Json | null;
        };
        Update: {
          address?: string;
          amenities?: string[] | null;
          category?: string;
          challenge_title?: string | null;
          coords?: Json;
          court_hourly_price?: number | null;
          court_hourly_price_php?: number | null;
          cover_image?: string | null;
          cover_url?: string | null;
          created_at?: string | null;
          day_pass_price?: number | null;
          day_pass_price_php?: number | null;
          distance?: string | null;
          free_member_count?: number | null;
          has_active_challenge?: boolean | null;
          hours?: string | null;
          id?: string;
          inside_now_count?: number | null;
          is_open?: boolean | null;
          lat?: number | null;
          live_capacity?: Json;
          lng?: number | null;
          logo?: string | null;
          logo_url?: string | null;
          max_capacity?: number | null;
          monthly_sub_price?: number | null;
          monthly_sub_price_php?: number | null;
          name?: string;
          rating?: number | null;
          registry?: string;
          registry_type?: string | null;
          review_count?: number | null;
          spatial_assets?: Json | null;
        };
        Relationships: [];
      };
      food_logs: {
        Row: {
          calories: number;
          carbs: number | null;
          created_at: string | null;
          fat: number | null;
          id: string;
          name: string;
          protein: number | null;
          user_id: string | null;
        };
        Insert: {
          calories: number;
          carbs?: number | null;
          created_at?: string | null;
          fat?: number | null;
          id?: string;
          name: string;
          protein?: number | null;
          user_id?: string | null;
        };
        Update: {
          calories?: number;
          carbs?: number | null;
          created_at?: string | null;
          fat?: number | null;
          id?: string;
          name?: string;
          protein?: number | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      hydration_logs: {
        Row: {
          created_at: string | null;
          id: string;
          liters: number;
          logged_date: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          liters: number;
          logged_date?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          liters?: number;
          logged_date?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      ledger_transactions: {
        Row: {
          amount: number;
          buyer_display_name: string | null;
          description: string;
          entry_type: string | null;
          facility_id: string | null;
          facility_name: string | null;
          gross_amount_php: number | null;
          id: string;
          idempotency_key: string | null;
          member_name: string | null;
          metadata: Json | null;
          method: string;
          net_facility_amount_php: number | null;
          payment_method: string | null;
          platform_fee_php: number | null;
          reference_no: string;
          reversing_transaction_id: string | null;
          status: string;
          timestamp: string | null;
          type: string;
          user_id: string | null;
        };
        Insert: {
          amount: number;
          buyer_display_name?: string | null;
          description: string;
          entry_type?: string | null;
          facility_id?: string | null;
          facility_name?: string | null;
          gross_amount_php?: number | null;
          id?: string;
          idempotency_key?: string | null;
          member_name?: string | null;
          metadata?: Json | null;
          method: string;
          net_facility_amount_php?: number | null;
          payment_method?: string | null;
          platform_fee_php?: number | null;
          reference_no: string;
          reversing_transaction_id?: string | null;
          status?: string;
          timestamp?: string | null;
          type: string;
          user_id?: string | null;
        };
        Update: {
          amount?: number;
          buyer_display_name?: string | null;
          description?: string;
          entry_type?: string | null;
          facility_id?: string | null;
          facility_name?: string | null;
          gross_amount_php?: number | null;
          id?: string;
          idempotency_key?: string | null;
          member_name?: string | null;
          metadata?: Json | null;
          method?: string;
          net_facility_amount_php?: number | null;
          payment_method?: string | null;
          platform_fee_php?: number | null;
          reference_no?: string;
          reversing_transaction_id?: string | null;
          status?: string;
          timestamp?: string | null;
          type?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_transactions_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_transactions_reversing_transaction_id_fkey";
            columns: ["reversing_transaction_id"];
            isOneToOne: false;
            referencedRelation: "ledger_transactions";
            referencedColumns: ["id"];
          },
        ];
      };
      passes: {
        Row: {
          created_at: string | null;
          facility_id: string | null;
          gifted_by_user_id: string | null;
          id: string;
          owner_id: string | null;
          pass_type: string;
          sku_id: string;
          status: string;
          valid_until: string;
        };
        Insert: {
          created_at?: string | null;
          facility_id?: string | null;
          gifted_by_user_id?: string | null;
          id?: string;
          owner_id?: string | null;
          pass_type?: string;
          sku_id?: string;
          status?: string;
          valid_until?: string;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string | null;
          gifted_by_user_id?: string | null;
          id?: string;
          owner_id?: string | null;
          pass_type?: string;
          sku_id?: string;
          status?: string;
          valid_until?: string;
        };
        Relationships: [
          {
            foreignKeyName: "passes_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
        ];
      };
      pr_challenges: {
        Row: {
          benchmark: string;
          category: string;
          created_at: string | null;
          expires_in_days: number | null;
          facility_id: string | null;
          id: string;
          participants_count: number | null;
          title: string;
        };
        Insert: {
          benchmark: string;
          category: string;
          created_at?: string | null;
          expires_in_days?: number | null;
          facility_id?: string | null;
          id: string;
          participants_count?: number | null;
          title: string;
        };
        Update: {
          benchmark?: string;
          category?: string;
          created_at?: string | null;
          expires_in_days?: number | null;
          facility_id?: string | null;
          id?: string;
          participants_count?: number | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pr_challenges_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          active_role: string | null;
          avatar: string | null;
          avatar_url: string | null;
          bio: string | null;
          cover_url: string | null;
          created_at: string | null;
          default_launch_tab: string | null;
          dob: string | null;
          first_name: string | null;
          home_location: string | null;
          id: string;
          is_private: boolean | null;
          last_name: string | null;
          metrics: Json | null;
          name: string;
          phone_hash: string | null;
          roles: string[] | null;
          soft_deleted_at: string | null;
          streak_freeze_available: boolean | null;
          streak_goal: number | null;
          streak_goal_per_week: number | null;
          streak_weeks: number | null;
          updated_at: string | null;
          user_roles: string[] | null;
          username: string | null;
          weights: Json | null;
        };
        Insert: {
          active_role?: string | null;
          avatar?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          cover_url?: string | null;
          created_at?: string | null;
          default_launch_tab?: string | null;
          dob?: string | null;
          first_name?: string | null;
          home_location?: string | null;
          id: string;
          is_private?: boolean | null;
          last_name?: string | null;
          metrics?: Json | null;
          name?: string;
          phone_hash?: string | null;
          roles?: string[] | null;
          soft_deleted_at?: string | null;
          streak_freeze_available?: boolean | null;
          streak_goal?: number | null;
          streak_goal_per_week?: number | null;
          streak_weeks?: number | null;
          updated_at?: string | null;
          user_roles?: string[] | null;
          username?: string | null;
          weights?: Json | null;
        };
        Update: {
          active_role?: string | null;
          avatar?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          cover_url?: string | null;
          created_at?: string | null;
          default_launch_tab?: string | null;
          dob?: string | null;
          first_name?: string | null;
          home_location?: string | null;
          id?: string;
          is_private?: boolean | null;
          last_name?: string | null;
          metrics?: Json | null;
          name?: string;
          phone_hash?: string | null;
          roles?: string[] | null;
          soft_deleted_at?: string | null;
          streak_freeze_available?: boolean | null;
          streak_goal?: number | null;
          streak_goal_per_week?: number | null;
          streak_weeks?: number | null;
          updated_at?: string | null;
          user_roles?: string[] | null;
          username?: string | null;
          weights?: Json | null;
        };
        Relationships: [];
      };
      sodia_post_likes: {
        Row: {
          created_at: string | null;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sodia_post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "sodia_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      sodia_posts: {
        Row: {
          author_avatar: string | null;
          author_name: string;
          author_role: string | null;
          comments_count: number | null;
          content: string;
          created_at: string | null;
          facility_tag: Json | null;
          id: string;
          likes_count: number | null;
          media_url: string | null;
          stamp: Json | null;
          user_id: string | null;
        };
        Insert: {
          author_avatar?: string | null;
          author_name: string;
          author_role?: string | null;
          comments_count?: number | null;
          content: string;
          created_at?: string | null;
          facility_tag?: Json | null;
          id?: string;
          likes_count?: number | null;
          media_url?: string | null;
          stamp?: Json | null;
          user_id?: string | null;
        };
        Update: {
          author_avatar?: string | null;
          author_name?: string;
          author_role?: string | null;
          comments_count?: number | null;
          content?: string;
          created_at?: string | null;
          facility_tag?: Json | null;
          id?: string;
          likes_count?: number | null;
          media_url?: string | null;
          stamp?: Json | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      sodia_stories: {
        Row: {
          author_avatar: string | null;
          author_name: string;
          caption: string | null;
          created_at: string | null;
          expires_at: string | null;
          id: string;
          media_url: string;
          user_id: string | null;
        };
        Insert: {
          author_avatar?: string | null;
          author_name: string;
          caption?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          media_url: string;
          user_id?: string | null;
        };
        Update: {
          author_avatar?: string | null;
          author_name?: string;
          caption?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          media_url?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      tournament_matches: {
        Row: {
          court_slot: string | null;
          facility_id: string | null;
          id: string;
          player_a: string;
          player_b: string;
          round: string;
          score_a: number | null;
          score_b: number | null;
          sport: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          court_slot?: string | null;
          facility_id?: string | null;
          id: string;
          player_a: string;
          player_b: string;
          round: string;
          score_a?: number | null;
          score_b?: number | null;
          sport: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          court_slot?: string | null;
          facility_id?: string | null;
          id?: string;
          player_a?: string;
          player_b?: string;
          round?: string;
          score_a?: number | null;
          score_b?: number | null;
          sport?: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tournament_matches_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
        ];
      };
      vip_card_passes: {
        Row: {
          court_details: Json | null;
          created_at: string | null;
          dynamic_hash: string | null;
          facility_id: string | null;
          facility_logo: string | null;
          facility_name: string;
          facility_registry: string;
          gifted_by: string | null;
          id: string;
          member_id: string;
          member_name: string;
          offline_totp: string | null;
          pass_type: string;
          qr_expires_in_seconds: number | null;
          status: string;
          user_id: string | null;
          valid_until: string;
        };
        Insert: {
          court_details?: Json | null;
          created_at?: string | null;
          dynamic_hash?: string | null;
          facility_id?: string | null;
          facility_logo?: string | null;
          facility_name: string;
          facility_registry: string;
          gifted_by?: string | null;
          id?: string;
          member_id: string;
          member_name: string;
          offline_totp?: string | null;
          pass_type: string;
          qr_expires_in_seconds?: number | null;
          status?: string;
          user_id?: string | null;
          valid_until: string;
        };
        Update: {
          court_details?: Json | null;
          created_at?: string | null;
          dynamic_hash?: string | null;
          facility_id?: string | null;
          facility_logo?: string | null;
          facility_name?: string;
          facility_registry?: string;
          gifted_by?: string | null;
          id?: string;
          member_id?: string;
          member_name?: string;
          offline_totp?: string | null;
          pass_type?: string;
          qr_expires_in_seconds?: number | null;
          status?: string;
          user_id?: string | null;
          valid_until?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vip_card_passes_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
        ];
      };
      workouts_lift: {
        Row: {
          created_at: string | null;
          duration_seconds: number | null;
          exercises: Json | null;
          id: string;
          title: string;
          user_id: string | null;
          verified_stamp: Json | null;
        };
        Insert: {
          created_at?: string | null;
          duration_seconds?: number | null;
          exercises?: Json | null;
          id?: string;
          title?: string;
          user_id?: string | null;
          verified_stamp?: Json | null;
        };
        Update: {
          created_at?: string | null;
          duration_seconds?: number | null;
          exercises?: Json | null;
          id?: string;
          title?: string;
          user_id?: string | null;
          verified_stamp?: Json | null;
        };
        Relationships: [];
      };
      workouts_move: {
        Row: {
          created_at: string | null;
          current_pace: string | null;
          distance_km: number | null;
          duration_seconds: number | null;
          id: string;
          is_court_mode: boolean | null;
          match_result: string | null;
          opponent_username: string | null;
          score: string | null;
          type: string;
          user_id: string | null;
          verified_stamp: Json | null;
        };
        Insert: {
          created_at?: string | null;
          current_pace?: string | null;
          distance_km?: number | null;
          duration_seconds?: number | null;
          id?: string;
          is_court_mode?: boolean | null;
          match_result?: string | null;
          opponent_username?: string | null;
          score?: string | null;
          type?: string;
          user_id?: string | null;
          verified_stamp?: Json | null;
        };
        Update: {
          created_at?: string | null;
          current_pace?: string | null;
          distance_km?: number | null;
          duration_seconds?: number | null;
          id?: string;
          is_court_mode?: boolean | null;
          match_result?: string | null;
          opponent_username?: string | null;
          score?: string | null;
          type?: string;
          user_id?: string | null;
          verified_stamp?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type ProfileRow = TableRow<"profiles">;
export type FacilityRow = TableRow<"facilities">;
export type PassRow = TableRow<"passes">;
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

/**
 * Explicit Column Selectors (Enforcing Zero `select('*')` Law)
 */
export const EXPLICIT_COLUMNS = {
  PROFILES:
    "id, username, first_name, last_name, avatar, avatar_url, cover_url, bio, dob, home_location, user_roles, is_private, streak_goal_per_week, default_launch_tab, soft_deleted_at, created_at, updated_at",
  FACILITIES:
    "id, name, registry, registry_type, logo, logo_url, cover_image, cover_url, address, lat, lng, inside_now_count, max_capacity, is_open, day_pass_price_php, monthly_sub_price_php, court_hourly_price_php, free_member_count, rating, review_count, has_active_challenge, challenge_title, created_at",
  PASSES:
    "id, owner_id, facility_id, sku_id, pass_type, status, valid_until, gifted_by_user_id, created_at",
  LEDGER_TRANSACTIONS:
    "id, reference_no, idempotency_key, user_id, member_name, buyer_display_name, facility_id, facility_name, type, entry_type, gross_amount_php, platform_fee_php, net_facility_amount_php, method, payment_method, status, reversing_transaction_id, timestamp",
  ACCESS_SCANS:
    "id, facility_id, user_id, member_name, avatar, status, reason, created_at",
  SODIA_POSTS:
    "id, user_id, author_name, author_avatar, author_role, content, media_url, likes_count, comments_count, facility_tag, stamp, created_at",
  PR_CHALLENGES:
    "id, title, category, benchmark, facility_id, expires_in_days, participants_count, created_at",
  TOURNAMENT_MATCHES:
    "id, facility_id, sport, round, player_a, player_b, score_a, score_b, status, court_slot, updated_at",
} as const;
