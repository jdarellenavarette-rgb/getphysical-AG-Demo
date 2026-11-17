/**
 * Supabase database types — GENERATED from supabase/migrations. Do not edit by hand.
 *
 * Regenerate after changing a migration:
 *   supabase gen types typescript --local > packages/sodia-core/src/database.types.ts
 *
 * Row aliases and explicit column selectors live in ./db.ts.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows supabase-js to select the PostgREST feature set.
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
          pass_id: string | null;
          reason: string | null;
          scanned_by: string | null;
          status: Database["public"]["Enums"]["scan_status"];
          totp_window: number | null;
          user_id: string | null;
        };
        Insert: {
          avatar?: string | null;
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          member_name: string;
          pass_id?: string | null;
          reason?: string | null;
          scanned_by?: string | null;
          status: Database["public"]["Enums"]["scan_status"];
          totp_window?: number | null;
          user_id?: string | null;
        };
        Update: {
          avatar?: string | null;
          created_at?: string | null;
          facility_id?: string | null;
          id?: string;
          member_name?: string;
          pass_id?: string | null;
          reason?: string | null;
          scanned_by?: string | null;
          status?: Database["public"]["Enums"]["scan_status"];
          totp_window?: number | null;
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
          {
            foreignKeyName: "access_scans_pass_id_fkey";
            columns: ["pass_id"];
            isOneToOne: false;
            referencedRelation: "passes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "access_scans_scanned_by_fkey";
            columns: ["scanned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "access_scans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_usage_daily: {
        Row: {
          feature: string;
          request_count: number;
          usage_date: string;
          user_id: string;
        };
        Insert: {
          feature: string;
          request_count?: number;
          usage_date?: string;
          user_id: string;
        };
        Update: {
          feature?: string;
          request_count?: number;
          usage_date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_usage_daily_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
          {
            foreignKeyName: "challenge_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      coach_clients: {
        Row: {
          client_id: string;
          coach_id: string;
          created_at: string | null;
          facility_id: string | null;
          status: Database["public"]["Enums"]["membership_status"];
          updated_at: string | null;
        };
        Insert: {
          client_id: string;
          coach_id: string;
          created_at?: string | null;
          facility_id?: string | null;
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string | null;
        };
        Update: {
          client_id?: string;
          coach_id?: string;
          created_at?: string | null;
          facility_id?: string | null;
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coach_clients_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coach_clients_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coach_clients_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          joined_at: string | null;
          last_read_at: string | null;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          joined_at?: string | null;
          last_read_at?: string | null;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          joined_at?: string | null;
          last_read_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          athlete_id: string | null;
          created_at: string | null;
          created_by: string | null;
          facility_id: string | null;
          id: string;
          kind: Database["public"]["Enums"]["conversation_kind"];
          last_message_at: string | null;
          title: string | null;
        };
        Insert: {
          athlete_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          facility_id?: string | null;
          id?: string;
          kind: Database["public"]["Enums"]["conversation_kind"];
          last_message_at?: string | null;
          title?: string | null;
        };
        Update: {
          athlete_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          facility_id?: string | null;
          id?: string;
          kind?: Database["public"]["Enums"]["conversation_kind"];
          last_message_at?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
        ];
      };
      crm_broadcasts: {
        Row: {
          audience: string;
          badge_text: string | null;
          body: string;
          created_at: string | null;
          created_by: string;
          facility_id: string;
          id: string;
          promo_code: string | null;
          recipient_count: number;
          segment_id: string | null;
          suite_mode: string;
          target_user_id: string | null;
          title: string;
        };
        Insert: {
          audience: string;
          badge_text?: string | null;
          body: string;
          created_at?: string | null;
          created_by: string;
          facility_id: string;
          id?: string;
          promo_code?: string | null;
          recipient_count?: number;
          segment_id?: string | null;
          suite_mode: string;
          target_user_id?: string | null;
          title: string;
        };
        Update: {
          audience?: string;
          badge_text?: string | null;
          body?: string;
          created_at?: string | null;
          created_by?: string;
          facility_id?: string;
          id?: string;
          promo_code?: string | null;
          recipient_count?: number;
          segment_id?: string | null;
          suite_mode?: string;
          target_user_id?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crm_broadcasts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_broadcasts_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_broadcasts_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "facility_segments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_broadcasts_target_user_id_fkey";
            columns: ["target_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      event_registrations: {
        Row: {
          event_id: string;
          registered_at: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          event_id: string;
          registered_at?: string | null;
          status?: string;
          user_id?: string;
        };
        Update: {
          event_id?: string;
          registered_at?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          capacity: number | null;
          created_at: string | null;
          description: string | null;
          ends_at: string | null;
          facility_id: string | null;
          id: string;
          organizer_id: string;
          sport: string | null;
          starts_at: string;
          status: Database["public"]["Enums"]["event_status"];
          title: string;
          updated_at: string | null;
        };
        Insert: {
          capacity?: number | null;
          created_at?: string | null;
          description?: string | null;
          ends_at?: string | null;
          facility_id?: string | null;
          id?: string;
          organizer_id?: string;
          sport?: string | null;
          starts_at: string;
          status?: Database["public"]["Enums"]["event_status"];
          title: string;
          updated_at?: string | null;
        };
        Update: {
          capacity?: number | null;
          created_at?: string | null;
          description?: string | null;
          ends_at?: string | null;
          facility_id?: string | null;
          id?: string;
          organizer_id?: string;
          sport?: string | null;
          starts_at?: string;
          status?: Database["public"]["Enums"]["event_status"];
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_organizer_id_fkey";
            columns: ["organizer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
          location: unknown | null;
          logo: string | null;
          logo_url: string | null;
          max_capacity: number | null;
          monthly_sub_price: number | null;
          monthly_sub_price_php: number | null;
          name: string;
          owner_id: string | null;
          plan: Database["public"]["Enums"]["subscription_plan"];
          rating: number | null;
          registry: string;
          registry_type: Database["public"]["Enums"]["registry_type"];
          review_count: number | null;
          slug: string | null;
          spatial_assets: Json | null;
          updated_at: string | null;
        };
        Insert: {
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
          location?: never;
          logo?: string | null;
          logo_url?: string | null;
          max_capacity?: number | null;
          monthly_sub_price?: number | null;
          monthly_sub_price_php?: number | null;
          name: string;
          owner_id?: string | null;
          plan?: Database["public"]["Enums"]["subscription_plan"];
          rating?: number | null;
          registry?: never;
          registry_type: Database["public"]["Enums"]["registry_type"];
          review_count?: number | null;
          slug?: string | null;
          spatial_assets?: Json | null;
          updated_at?: string | null;
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
          location?: never;
          logo?: string | null;
          logo_url?: string | null;
          max_capacity?: number | null;
          monthly_sub_price?: number | null;
          monthly_sub_price_php?: number | null;
          name?: string;
          owner_id?: string | null;
          plan?: Database["public"]["Enums"]["subscription_plan"];
          rating?: number | null;
          registry?: never;
          registry_type?: Database["public"]["Enums"]["registry_type"];
          review_count?: number | null;
          slug?: string | null;
          spatial_assets?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "facilities_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      facility_memberships: {
        Row: {
          facility_id: string;
          joined_at: string | null;
          source: string;
          status: Database["public"]["Enums"]["membership_status"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          facility_id: string;
          joined_at?: string | null;
          source?: string;
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          facility_id?: string;
          joined_at?: string | null;
          source?: string;
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "facility_memberships_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "facility_memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      facility_payout_accounts: {
        Row: {
          charges_enabled: boolean;
          facility_id: string;
          maya_merchant_id: string | null;
          preferred_provider: Database["public"]["Enums"]["payment_provider"] | null;
          stripe_account_id: string | null;
          updated_at: string | null;
          xendit_sub_account_id: string | null;
        };
        Insert: {
          charges_enabled?: boolean;
          facility_id: string;
          maya_merchant_id?: string | null;
          preferred_provider?: Database["public"]["Enums"]["payment_provider"] | null;
          stripe_account_id?: string | null;
          updated_at?: string | null;
          xendit_sub_account_id?: string | null;
        };
        Update: {
          charges_enabled?: boolean;
          facility_id?: string;
          maya_merchant_id?: string | null;
          preferred_provider?: Database["public"]["Enums"]["payment_provider"] | null;
          stripe_account_id?: string | null;
          updated_at?: string | null;
          xendit_sub_account_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "facility_payout_accounts_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: true;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
        ];
      };
      facility_segment_members: {
        Row: {
          added_at: string | null;
          segment_id: string;
          user_id: string;
        };
        Insert: {
          added_at?: string | null;
          segment_id: string;
          user_id: string;
        };
        Update: {
          added_at?: string | null;
          segment_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "facility_segment_members_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "facility_segments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "facility_segment_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      facility_segments: {
        Row: {
          created_at: string | null;
          facility_id: string;
          id: string;
          key: string;
          label: string;
        };
        Insert: {
          created_at?: string | null;
          facility_id: string;
          id?: string;
          key: string;
          label: string;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string;
          id?: string;
          key?: string;
          label?: string;
        };
        Relationships: [
          {
            foreignKeyName: "facility_segments_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
        ];
      };
      facility_staff: {
        Row: {
          created_at: string | null;
          facility_id: string;
          role: Database["public"]["Enums"]["facility_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          facility_id: string;
          role: Database["public"]["Enums"]["facility_role"];
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string;
          role?: Database["public"]["Enums"]["facility_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "facility_staff_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "facility_staff_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          created_at: string | null;
          followee_id: string;
          follower_id: string;
          status: string;
        };
        Insert: {
          created_at?: string | null;
          followee_id: string;
          follower_id: string;
          status?: string;
        };
        Update: {
          created_at?: string | null;
          followee_id?: string;
          follower_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_followee_id_fkey";
            columns: ["followee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
          user_id: string;
        };
        Insert: {
          calories: number;
          carbs?: number | null;
          created_at?: string | null;
          fat?: number | null;
          id?: string;
          name: string;
          protein?: number | null;
          user_id?: string;
        };
        Update: {
          calories?: number;
          carbs?: number | null;
          created_at?: string | null;
          fat?: number | null;
          id?: string;
          name?: string;
          protein?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "food_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      hydration_logs: {
        Row: {
          created_at: string | null;
          id: string;
          liters: number;
          logged_date: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          liters: number;
          logged_date?: string | null;
          user_id?: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          liters?: number;
          logged_date?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hydration_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
          payment_order_id: string | null;
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
          payment_order_id?: string | null;
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
          payment_order_id?: string | null;
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
            foreignKeyName: "ledger_payment_order_fk";
            columns: ["payment_order_id"];
            isOneToOne: false;
            referencedRelation: "payment_orders";
            referencedColumns: ["id"];
          },
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
            isOneToOne: true;
            referencedRelation: "ledger_transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          body: string;
          broadcast_id: string | null;
          conversation_id: string;
          created_at: string | null;
          id: string;
          sender_id: string;
          sender_kind: Database["public"]["Enums"]["sender_kind"];
        };
        Insert: {
          body: string;
          broadcast_id?: string | null;
          conversation_id: string;
          created_at?: string | null;
          id?: string;
          sender_id?: string;
          sender_kind?: Database["public"]["Enums"]["sender_kind"];
        };
        Update: {
          body?: string;
          broadcast_id?: string | null;
          conversation_id?: string;
          created_at?: string | null;
          id?: string;
          sender_id?: string;
          sender_kind?: Database["public"]["Enums"]["sender_kind"];
        };
        Relationships: [
          {
            foreignKeyName: "messages_broadcast_id_fkey";
            columns: ["broadcast_id"];
            isOneToOne: false;
            referencedRelation: "crm_broadcasts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      pass_credentials: {
        Row: {
          pass_id: string;
          rotated_at: string;
          secret: string;
        };
        Insert: {
          pass_id: string;
          rotated_at?: string;
          secret?: string;
        };
        Update: {
          pass_id?: string;
          rotated_at?: string;
          secret?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pass_credentials_pass_id_fkey";
            columns: ["pass_id"];
            isOneToOne: true;
            referencedRelation: "passes";
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
          payment_order_id: string | null;
          sku_id: string;
          status: Database["public"]["Enums"]["pass_status"];
          valid_until: string;
        };
        Insert: {
          created_at?: string | null;
          facility_id?: string | null;
          gifted_by_user_id?: string | null;
          id?: string;
          owner_id?: string | null;
          pass_type?: string;
          payment_order_id?: string | null;
          sku_id?: string;
          status?: Database["public"]["Enums"]["pass_status"];
          valid_until?: string;
        };
        Update: {
          created_at?: string | null;
          facility_id?: string | null;
          gifted_by_user_id?: string | null;
          id?: string;
          owner_id?: string | null;
          pass_type?: string;
          payment_order_id?: string | null;
          sku_id?: string;
          status?: Database["public"]["Enums"]["pass_status"];
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
          {
            foreignKeyName: "passes_gifted_by_user_id_fkey";
            columns: ["gifted_by_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "passes_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "passes_payment_order_fk";
            columns: ["payment_order_id"];
            isOneToOne: false;
            referencedRelation: "payment_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_orders: {
        Row: {
          base_amount_php: number;
          billing_kind: string;
          checkout_url: string | null;
          created_at: string | null;
          currency: string;
          facility_id: string;
          failure_reason: string | null;
          id: string;
          idempotency_key: string;
          paid_at: string | null;
          pass_id: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_ref: string | null;
          service_fee_php: number;
          sku: string;
          status: Database["public"]["Enums"]["payment_order_status"];
          total_php: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          base_amount_php: number;
          billing_kind: string;
          checkout_url?: string | null;
          created_at?: string | null;
          currency?: string;
          facility_id: string;
          failure_reason?: string | null;
          id?: string;
          idempotency_key: string;
          paid_at?: string | null;
          pass_id?: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_ref?: string | null;
          service_fee_php: number;
          sku: string;
          status?: Database["public"]["Enums"]["payment_order_status"];
          total_php: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          base_amount_php?: number;
          billing_kind?: string;
          checkout_url?: string | null;
          created_at?: string | null;
          currency?: string;
          facility_id?: string;
          failure_reason?: string | null;
          id?: string;
          idempotency_key?: string;
          paid_at?: string | null;
          pass_id?: string | null;
          provider?: Database["public"]["Enums"]["payment_provider"];
          provider_ref?: string | null;
          service_fee_php?: number;
          sku?: string;
          status?: Database["public"]["Enums"]["payment_order_status"];
          total_php?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_orders_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_orders_pass_id_fkey";
            columns: ["pass_id"];
            isOneToOne: false;
            referencedRelation: "passes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_webhook_events: {
        Row: {
          event_id: string;
          event_type: string;
          id: number;
          payload: Json;
          provider: Database["public"]["Enums"]["payment_provider"];
          received_at: string | null;
        };
        Insert: {
          event_id: string;
          event_type: string;
          id?: never;
          payload: Json;
          provider: Database["public"]["Enums"]["payment_provider"];
          received_at?: string | null;
        };
        Update: {
          event_id?: string;
          event_type?: string;
          id?: never;
          payload?: Json;
          provider?: Database["public"]["Enums"]["payment_provider"];
          received_at?: string | null;
        };
        Relationships: [];
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
          id?: string;
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
          coach_plan: Database["public"]["Enums"]["subscription_plan"];
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
          coach_plan?: Database["public"]["Enums"]["subscription_plan"];
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
          coach_plan?: Database["public"]["Enums"]["subscription_plan"];
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
      qr_codes: {
        Row: {
          created_at: string;
          event_id: string | null;
          facility_id: string | null;
          kind: Database["public"]["Enums"]["qr_kind"];
          revoked_at: string | null;
          status: string;
          token: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          event_id?: string | null;
          facility_id?: string | null;
          kind: Database["public"]["Enums"]["qr_kind"];
          revoked_at?: string | null;
          status?: string;
          token: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_id?: string | null;
          facility_id?: string | null;
          kind?: Database["public"]["Enums"]["qr_kind"];
          revoked_at?: string | null;
          status?: string;
          token?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "qr_codes_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: true;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "qr_codes_facility_id_fkey";
            columns: ["facility_id"];
            isOneToOne: true;
            referencedRelation: "facilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "qr_codes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      sodia_post_comments: {
        Row: {
          body: string;
          created_at: string | null;
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string | null;
          id?: string;
          post_id: string;
          user_id?: string;
        };
        Update: {
          body?: string;
          created_at?: string | null;
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sodia_post_comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "sodia_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sodia_post_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
          user_id?: string;
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
          {
            foreignKeyName: "sodia_post_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
          author_name?: string;
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
        Relationships: [
          {
            foreignKeyName: "sodia_posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
          author_name?: string;
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
        Relationships: [
          {
            foreignKeyName: "sodia_stories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
          id?: string;
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
      workouts_lift: {
        Row: {
          created_at: string | null;
          duration_seconds: number | null;
          exercises: Json | null;
          id: string;
          title: string;
          user_id: string;
          verified_stamp: Json | null;
        };
        Insert: {
          created_at?: string | null;
          duration_seconds?: number | null;
          exercises?: Json | null;
          id?: string;
          title?: string;
          user_id?: string;
          verified_stamp?: Json | null;
        };
        Update: {
          created_at?: string | null;
          duration_seconds?: number | null;
          exercises?: Json | null;
          id?: string;
          title?: string;
          user_id?: string;
          verified_stamp?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "workouts_lift_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      workouts_move: {
        Row: {
          created_at: string | null;
          current_pace: string | null;
          distance_km: number | null;
          duration_seconds: number | null;
          ended_at: string | null;
          id: string;
          is_court_mode: boolean | null;
          match_result: string | null;
          opponent_username: string | null;
          route: unknown | null;
          route_geojson: Json | null;
          score: string | null;
          started_at: string | null;
          type: string;
          user_id: string;
          verified_stamp: Json | null;
        };
        Insert: {
          created_at?: string | null;
          current_pace?: string | null;
          distance_km?: number | null;
          duration_seconds?: number | null;
          ended_at?: string | null;
          id?: string;
          is_court_mode?: boolean | null;
          match_result?: string | null;
          opponent_username?: string | null;
          route?: unknown | null;
          route_geojson?: Json | null;
          score?: string | null;
          started_at?: string | null;
          type?: string;
          user_id?: string;
          verified_stamp?: Json | null;
        };
        Update: {
          created_at?: string | null;
          current_pace?: string | null;
          distance_km?: number | null;
          duration_seconds?: number | null;
          ended_at?: string | null;
          id?: string;
          is_court_mode?: boolean | null;
          match_result?: string | null;
          opponent_username?: string | null;
          route?: unknown | null;
          route_geojson?: Json | null;
          score?: string | null;
          started_at?: string | null;
          type?: string;
          user_id?: string;
          verified_stamp?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "workouts_move_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      attach_payment_checkout: {
        Args: {
          p_order_id: string;
          p_provider_ref: string;
          p_checkout_url: string;
        };
        Returns: Database["public"]["Tables"]["payment_orders"]["Row"];
      };
      calculate_service_fee: {
        Args: {
          p_base: number;
          p_billing_kind: string;
        };
        Returns: number;
      };
      can_access_conversation: {
        Args: {
          p_conversation_id: string;
        };
        Returns: boolean;
      };
      can_manage_event: {
        Args: {
          p_event_id: string;
        };
        Returns: boolean;
      };
      can_view_user_content: {
        Args: {
          p_author: string;
        };
        Returns: boolean;
      };
      close_payment_order: {
        Args: {
          p_order_id: string;
          p_status: Database["public"]["Enums"]["payment_order_status"];
          p_reason?: string;
        };
        Returns: Database["public"]["Tables"]["payment_orders"]["Row"];
      };
      consume_ai_quota: {
        Args: {
          p_feature: string;
          p_daily_limit: number;
        };
        Returns: boolean;
      };
      conversation_facility_id: {
        Args: {
          p_conversation_id: string;
        };
        Returns: string;
      };
      create_payment_order: {
        Args: {
          p_facility_id: string;
          p_sku: string;
          p_idempotency_key: string;
        };
        Returns: Database["public"]["Tables"]["payment_orders"]["Row"];
      };
      ensure_facility_conversation: {
        Args: {
          p_facility_id: string;
          p_athlete_id?: string;
        };
        Returns: string;
      };
      facilities_nearby: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_radius_km?: number;
          p_registry?: Database["public"]["Enums"]["registry_type"];
          p_limit?: number;
        };
        Returns: { id: string | null; slug: string | null; name: string | null; registry_type: Database["public"]["Enums"]["registry_type"] | null; category: string | null; lat: number | null; lng: number | null; logo_url: string | null; is_open: boolean | null; inside_now_count: number | null; max_capacity: number | null; rating: number | null; distance_km: number | null }[];
      };
      get_my_profile: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Tables"]["profiles"]["Row"];
      };
      get_qr_code: {
        Args: {
          p_kind: Database["public"]["Enums"]["qr_kind"];
          p_target?: string;
        };
        Returns: Json;
      };
      has_facility_role: {
        Args: {
          p_facility_id: string;
          p_roles: Database["public"]["Enums"]["facility_role"][];
        };
        Returns: boolean;
      };
      is_conversation_participant: {
        Args: {
          p_conversation_id: string;
        };
        Returns: boolean;
      };
      is_facility_admin: {
        Args: {
          p_facility_id: string;
        };
        Returns: boolean;
      };
      is_facility_member: {
        Args: {
          p_facility_id: string;
        };
        Returns: boolean;
      };
      is_facility_staff: {
        Args: {
          p_facility_id: string;
        };
        Returns: boolean;
      };
      mark_conversation_read: {
        Args: {
          p_conversation_id: string;
        };
        Returns: undefined;
      };
      open_direct_conversation: {
        Args: {
          p_other_user_id: string;
        };
        Returns: string;
      };
      record_payment_webhook_event: {
        Args: {
          p_provider: Database["public"]["Enums"]["payment_provider"];
          p_event_id: string;
          p_event_type: string;
          p_payload: Json;
        };
        Returns: boolean;
      };
      redeem_qr_code: {
        Args: {
          p_token: string;
        };
        Returns: Json;
      };
      refund_payment_order: {
        Args: {
          p_order_id: string;
          p_reason: string;
        };
        Returns: Database["public"]["Tables"]["payment_orders"]["Row"];
      };
      resolve_qr_code: {
        Args: {
          p_token: string;
        };
        Returns: Json;
      };
      rotate_qr_code: {
        Args: {
          p_kind: Database["public"]["Enums"]["qr_kind"];
          p_target?: string;
        };
        Returns: Json;
      };
      send_crm_broadcast: {
        Args: {
          p_facility_id: string;
          p_suite_mode: string;
          p_audience: string;
          p_title: string;
          p_body: string;
          p_promo_code?: string;
          p_segment_key?: string;
          p_target_user_id?: string;
          p_badge_text?: string;
        };
        Returns: Database["public"]["Tables"]["crm_broadcasts"]["Row"];
      };
      settle_payment_order: {
        Args: {
          p_order_id: string;
          p_provider: Database["public"]["Enums"]["payment_provider"];
          p_provider_ref: string;
          p_paid_amount: number;
        };
        Returns: Database["public"]["Tables"]["payment_orders"]["Row"];
      };
      verify_pass_code: {
        Args: {
          p_pass_id: string;
          p_code: string;
          p_at?: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      conversation_kind: "DIRECT" | "GROUP" | "FACILITY";
      event_status: "DRAFT" | "PUBLISHED" | "CANCELLED";
      facility_role: "OWNER" | "ADMIN" | "STAFF" | "COACH";
      membership_status: "ACTIVE" | "CANCELLED" | "PENDING";
      pass_status: "ACTIVE" | "EXPIRED" | "REVOKED";
      payment_order_status: "PENDING" | "PAID" | "EXPIRED" | "FAILED" | "REFUNDED";
      payment_provider: "XENDIT" | "STRIPE" | "MAYA";
      qr_kind: "USER" | "COACH" | "ORGANIZER" | "FACILITY" | "EVENT";
      registry_type: "COMMERCIAL" | "COMMUNITY";
      scan_status: "GRANTED" | "DENIED";
      sender_kind: "USER" | "FACILITY";
      subscription_plan: "FREE" | "PRO";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
export type Functions<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T];
