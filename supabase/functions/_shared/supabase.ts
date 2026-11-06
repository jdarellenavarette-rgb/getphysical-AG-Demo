import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts";
import { requireEnv } from "./env.ts";
import { HttpError } from "./http.ts";

export type Db = SupabaseClient<Database>;

/** Client that acts as the calling user, so RLS and auth.uid() apply. */
export async function userClient(req: Request): Promise<{ db: Db; user: User }> {
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "AUTH_REQUIRED", "Sign in to continue");
  }
  const db = createClient<Database>(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db.auth.getUser(authorization.slice("Bearer ".length));
  if (error || !data.user) throw new HttpError(401, "SESSION_EXPIRED", "Your session has expired");
  return { db, user: data.user };
}

/** service_role client. Only for webhook settlement and provider bookkeeping. */
export function serviceClient(): Db {
  return createClient<Database>(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
