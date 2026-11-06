import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database, GetPhysicalClient } from "sodia-core";
import { supabasePublicConfig } from "../env";

/**
 * Supabase client for Server Components and Server Actions. Acts as the
 * signed-in user (session from cookies), so every query is subject to RLS.
 * Talks to PostgREST over HTTPS — no direct Postgres connections are opened
 * from Next.js, so the Supavisor pooler is only needed for SQL tooling.
 */
export async function createServerSupabase(): Promise<GetPhysicalClient> {
  const { supabaseUrl, supabaseAnonKey } = supabasePublicConfig();
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: middleware refreshes the session instead.
        }
      },
    },
  });
}
