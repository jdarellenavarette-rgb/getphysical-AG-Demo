/** Result of a form posted to a Server Action. */
export interface FormState {
  status: "idle" | "form_validation" | "error" | "success";
  message?: string;
}

/** Result of a one-tap Server Action. */
export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

export const idleFormState: FormState = { status: "idle" };

interface DbError {
  code?: string;
  message: string;
}

/** Turn a database refusal into words for the operator. `known` maps error names to messages. */
export function describeDbError(error: DbError, known: Record<string, string>, fallback: string): string {
  for (const [name, message] of Object.entries(known)) {
    if (error.message.includes(name)) return message;
  }
  if (error.code === "42501") return "You don't have permission to do this here.";
  return fallback;
}
