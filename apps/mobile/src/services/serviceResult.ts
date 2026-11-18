/** One result shape for every backend call the screens make. */
export type ServiceResult<T> =
  { ok: true; data: T } | { ok: false; reason: "signed_out" | "forbidden" | "offline" | "error"; message: string };

/** Turns a Supabase error into something a person can act on. */
export function failure(error: { message: string; code?: string }): ServiceResult<never> {
  if (error.code === "42501" || /FORBIDDEN|ROLE_NOT_GRANTED/.test(error.message)) {
    return { ok: false, reason: "forbidden", message: "You don't have access to this." };
  }
  if (/fetch|network/i.test(error.message)) {
    return { ok: false, reason: "offline", message: "You're offline. Reconnect and retry." };
  }
  return { ok: false, reason: "error", message: "Something went wrong. Please retry." };
}
