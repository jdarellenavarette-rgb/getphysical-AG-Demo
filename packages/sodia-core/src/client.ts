import { createClient, type SupabaseClient, type SupportedStorage } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type GetPhysicalClient = SupabaseClient<Database>;

export interface SupabaseConfig {
  supabaseUrl: string;
  /** The project's publishable/anon key. Never pass a service_role key to a client app. */
  supabaseAnonKey: string;
}

export interface GetPhysicalClientOptions {
  /** Session storage. Mobile must pass a SecureStore-backed adapter. */
  storage?: SupportedStorage;
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
}

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

/** Validates config and rejects service_role keys being shipped to clients. */
export function assertClientSupabaseConfig(config: Partial<SupabaseConfig>): SupabaseConfig {
  const { supabaseUrl, supabaseAnonKey } = config;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new SupabaseConfigError(
      "[sodia-core] Supabase URL and anon key are required. Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (web) or EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY (mobile)."
    );
  }
  if (!/^https:\/\//.test(supabaseUrl) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(supabaseUrl)) {
    throw new SupabaseConfigError("[sodia-core] Supabase URL must use https (http is allowed only for localhost).");
  }
  if (supabaseAnonKey.startsWith("sb_secret_") || jwtRole(supabaseAnonKey) === "service_role") {
    throw new SupabaseConfigError("[sodia-core] Refusing to create a client with a service_role/secret key.");
  }
  return { supabaseUrl, supabaseAnonKey };
}

function jwtRole(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob === "function" ? atob(base64) : "";
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === "object" && "role" in parsed) {
      const role = (parsed as { role: unknown }).role;
      return typeof role === "string" ? role : null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Creates a strictly typed Supabase client for the GetPhysical schema. */
export function createGetPhysicalClient(
  config: Partial<SupabaseConfig>,
  options: GetPhysicalClientOptions = {}
): GetPhysicalClient {
  const { supabaseUrl, supabaseAnonKey } = assertClientSupabaseConfig(config);
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: options.storage,
      persistSession: options.persistSession ?? true,
      autoRefreshToken: true,
      detectSessionInUrl: options.detectSessionInUrl ?? false,
    },
  });
}
