import { HttpError } from "./http.ts";

export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new HttpError(500, "SERVER_MISCONFIGURED", `Missing environment variable ${name}`);
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
