import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { getSupabase } from "../lib/supabase";

/**
 * Social sign-in:
 *  - Apple on iOS: native sheet → identity token → Supabase signInWithIdToken (nonce-protected)
 *  - Google (all platforms) and Apple on Android: Supabase OAuth in a secure
 *    browser session with PKCE, returning to sodia://auth/callback
 * Both end with a normal Supabase session stored in SecureStore.
 */
export const OAUTH_REDIRECT_URL = "sodia://auth/callback";

export type SocialResult = { ok: true } | { ok: false; cancelled: boolean; message: string };

const CANCELLED: SocialResult = { ok: false, cancelled: true, message: "" };

export async function isNativeAppleSignInAvailable(): Promise<boolean> {
  return Platform.OS === "ios" && (await AppleAuthentication.isAvailableAsync());
}

export async function signInWithApple(): Promise<SocialResult> {
  if (!(await isNativeAppleSignInAvailable())) return signInWithOAuthBrowser("apple");
  const supabase = getSupabase();
  if (!supabase) return { ok: false, cancelled: false, message: "Sign-in is unavailable in this build." };

  // Apple receives the SHA-256 of the nonce; Supabase receives the raw nonce and checks they match.
  const rawNonce = Array.from(Crypto.getRandomBytes(32), (b) => b.toString(16).padStart(2, "0")).join("");
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ERR_REQUEST_CANCELED") return CANCELLED;
    return { ok: false, cancelled: false, message: "Apple sign-in failed. Please retry." };
  }
  if (!credential.identityToken) return { ok: false, cancelled: false, message: "Apple didn't return a sign-in token." };

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) return { ok: false, cancelled: false, message: "Apple sign-in failed. Please retry." };

  // Apple shares the name only on the very first sign-in, and never inside the token.
  const given = credential.fullName?.givenName?.trim();
  const family = credential.fullName?.familyName?.trim();
  if (given || family) {
    await supabase.auth.updateUser({
      data: { first_name: given ?? null, last_name: family ?? null, name: [given, family].filter(Boolean).join(" ") },
    });
  }
  return { ok: true };
}

export function signInWithGoogle(): Promise<SocialResult> {
  return signInWithOAuthBrowser("google");
}

async function signInWithOAuthBrowser(provider: "google" | "apple"): Promise<SocialResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, cancelled: false, message: "Sign-in is unavailable in this build." };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: OAUTH_REDIRECT_URL, skipBrowserRedirect: true },
  });
  if (error || !data.url) return { ok: false, cancelled: false, message: "Couldn't start sign-in. Please retry." };

  const result = await WebBrowser.openAuthSessionAsync(data.url, OAUTH_REDIRECT_URL);
  if (result.type !== "success") return CANCELLED;

  const params = new URL(result.url).searchParams;
  const code = params.get("code");
  if (!code) {
    const denied = params.get("error") === "access_denied";
    return { ok: false, cancelled: denied, message: denied ? "" : "Sign-in didn't complete. Please retry." };
  }
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return { ok: false, cancelled: false, message: "Sign-in expired. Please try again." };
  return { ok: true };
}
