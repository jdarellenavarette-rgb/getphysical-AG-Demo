import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";
import { createGetPhysicalClient, SupabaseConfigError, type GetPhysicalClient } from "sodia-core";

/**
 * Session storage backed by the iOS Keychain / Android Keystore (AGENTS.md §5:
 * refresh tokens live in the secure enclave, never AsyncStorage).
 * SecureStore values are size-limited, so the session JSON is chunked.
 */
const CHUNK_SIZE = 1800;
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

function storageKey(key: string): string {
  // SecureStore keys allow only [A-Za-z0-9._-].
  return key.replace(/[^A-Za-z0-9._-]/g, "_");
}

export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    const base = storageKey(key);
    const countRaw = await SecureStore.getItemAsync(`${base}.n`, SECURE_OPTIONS);
    if (!countRaw) return null;
    const count = Number(countRaw);
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${base}.${i}`, SECURE_OPTIONS);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join("");
  },
  async setItem(key: string, value: string): Promise<void> {
    const base = storageKey(key);
    await secureSessionStorage.removeItem(key);
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(`${base}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE), SECURE_OPTIONS);
    }
    await SecureStore.setItemAsync(`${base}.n`, String(count), SECURE_OPTIONS);
  },
  async removeItem(key: string): Promise<void> {
    const base = storageKey(key);
    const countRaw = await SecureStore.getItemAsync(`${base}.n`, SECURE_OPTIONS);
    const count = countRaw ? Number(countRaw) : 0;
    for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(`${base}.${i}`, SECURE_OPTIONS);
    await SecureStore.deleteItemAsync(`${base}.n`, SECURE_OPTIONS);
  },
};

let client: GetPhysicalClient | null = null;

/**
 * Returns the app's Supabase client, or null when the build has no Supabase
 * config (e.g. a local UI-only build). Callers treat null as "offline/demo".
 * EXPO_PUBLIC_* values must be referenced literally so Expo inlines them.
 */
export function getSupabase(): GetPhysicalClient | null {
  if (client) return client;
  try {
    client = createGetPhysicalClient(
      {
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      },
      { storage: secureSessionStorage, persistSession: true, detectSessionInUrl: false }
    );
  } catch (error) {
    if (error instanceof SupabaseConfigError) return null;
    throw error;
  }

  // Only refresh tokens while the app is in the foreground.
  const auth = client.auth;
  AppState.addEventListener("change", (state) => {
    if (state === "active") void auth.startAutoRefresh();
    else void auth.stopAutoRefresh();
  });
  return client;
}

/** Signed-in user id, or null when signed out / not configured. */
export async function getSessionUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}
