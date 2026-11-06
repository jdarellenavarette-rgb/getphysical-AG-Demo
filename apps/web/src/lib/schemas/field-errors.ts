import type { z } from 'zod';

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

/** Flattens a zod error into first-message-per-field for inline display. */
export function firstFieldErrors<K extends string>(error: z.ZodError): FieldErrors<K> {
  const out: FieldErrors<K> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in out)) {
      (out as Record<string, string>)[key] = issue.message;
    }
  }
  return out;
}
