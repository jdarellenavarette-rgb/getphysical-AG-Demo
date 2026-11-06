import { HttpError } from "./http.ts";

export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    // Name the missing secret in server logs only, never in the response body.
    console.error(JSON.stringify({ code: "SERVER_MISCONFIGURED", missingEnv: name }));
    throw new HttpError(503, "SERVER_MISCONFIGURED", "This service is not configured yet");
  }
  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  return Deno.env.get(name) || fallback;
}

export function allowedOrigins(): string[] {
  return (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
