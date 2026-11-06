import * as SecureStore from "expo-secure-store";
import { SodiaQueries } from "sodia-core";
import { getSessionUserId, getSupabase } from "../lib/supabase";

/**
 * Per-pass TOTP secrets. Fetched once while online (RLS: owner only) and kept
 * in the Keychain/Keystore so the Cards QR keeps working offline.
 */
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

function cacheKey(passId: string): string {
  return `pass_secret_${passId.replace(/[^A-Za-z0-9._-]/g, "_")}`;
}

export type PassSecretResult =
  | { status: "ready"; secret: string; source: "network" | "cache" }
  | { status: "signed_out" }
  | { status: "unavailable" };

export async function loadPassSecret(passId: string): Promise<PassSecretResult> {
  const cached = await SecureStore.getItemAsync(cacheKey(passId), SECURE_OPTIONS);
  const supabase = getSupabase();
  const userId = await getSessionUserId();

  if (!supabase || !userId) {
    return cached ? { status: "ready", secret: cached, source: "cache" } : { status: "signed_out" };
  }

  try {
    const secret = await SodiaQueries.getPassSecret(supabase, passId);
    if (!secret) {
      // Revoked, expired or transferred: forget any stale copy.
      await SecureStore.deleteItemAsync(cacheKey(passId), SECURE_OPTIONS);
      return { status: "unavailable" };
    }
    if (secret !== cached) await SecureStore.setItemAsync(cacheKey(passId), secret, SECURE_OPTIONS);
    return { status: "ready", secret, source: "network" };
  } catch {
    // Offline: fall back to the locally cached secret (AGENTS.md §3 no_internet).
    return cached ? { status: "ready", secret: cached, source: "cache" } : { status: "unavailable" };
  }
}
