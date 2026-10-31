import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

/**
 * Creates a strictly typed Supabase client configured for the GetPhysical schema.
 */
export function createGetPhysicalClient(
  config: SupabaseConfig
): SupabaseClient<Database> {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      "[sodia-core] Supabase URL and Anon Key must be provided. Check environment variables."
    );
  }

  return createClient<Database>(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}
