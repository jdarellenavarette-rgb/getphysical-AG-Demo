import { assertClientSupabaseConfig, type SupabaseConfig } from "sodia-core";

/**
 * Public Supabase config for the web app. Values are inlined at build time by
 * Next.js, so they must be referenced as literal `process.env.NEXT_PUBLIC_*`.
 * Only the anon/publishable key belongs here — never the service_role key.
 */
export function supabasePublicConfig(): SupabaseConfig {
  return assertClientSupabaseConfig({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

/** Absolute origin used for auth email redirects. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
