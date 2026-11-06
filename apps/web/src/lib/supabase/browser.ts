"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database, GetPhysicalClient } from "sodia-core";
import { supabasePublicConfig } from "../env";

let browserClient: GetPhysicalClient | null = null;

/** Singleton browser client (used for Realtime subscriptions only; writes go through Server Actions). */
export function getBrowserSupabase(): GetPhysicalClient {
  if (!browserClient) {
    const { supabaseUrl, supabaseAnonKey } = supabasePublicConfig();
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}
