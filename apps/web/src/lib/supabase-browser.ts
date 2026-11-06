import { getSodiaSupabaseClient } from 'sodia-core';

/** Supabase types derived from sodia-core so apps/web needs no direct supabase-js dependency. */
export type BrowserSupabaseClient = ReturnType<typeof getSodiaSupabaseClient>;
export type BrowserRealtimeChannel = ReturnType<BrowserSupabaseClient['channel']>;

let browserClient: BrowserSupabaseClient | null = null;

/** One Supabase client per browser tab (avoids duplicate GoTrue instances and sockets). */
export function getBrowserSupabase(): BrowserSupabaseClient {
  if (!browserClient) browserClient = getSodiaSupabaseClient();
  return browserClient;
}
