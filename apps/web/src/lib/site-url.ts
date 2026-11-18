import "server-only";
import { headers } from "next/headers";

/**
 * Origin the visitor is actually using, for sign-in redirects. Taken from the
 * request so every deployment (production, previews, localhost) returns people
 * to itself without per-environment configuration. Supabase only honours it if
 * the address is on the project's redirect allow list, so a forged Host header
 * cannot send anyone elsewhere.
 */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const proto = h.get("x-forwarded-proto")?.split(",")[0] ?? (local ? "http" : "https");
    return `${proto}://${host}`;
  }
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
