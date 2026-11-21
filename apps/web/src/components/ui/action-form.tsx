"use client";

import { useServerForm } from "../../lib/use-server-form";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { idleFormState, type FormState } from "../../lib/form-state";
import { cn } from "../../lib/utils";
import { Button } from "./button";

interface ActionFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel: string;
  pendingLabel: string;
  icon?: ReactNode;
  className?: string;
  /** Keep what was typed after a successful save (settings-style forms). */
  keepValues?: boolean;
  /** Names the form on its page when the button label can change. Defaults to the label. */
  id?: string;
}

/**
 * A form posted to a Server Action: disables the button while it runs (no duplicate submissions),
 * announces the outcome, and reloads the server-rendered data on success.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  icon,
  className,
  keepValues = false,
  id,
}: ActionFormProps) {
  const [state, formAction, pending] = useServerForm(action, idleFormState, { id: id ?? submitLabel });
  const formRef = useRef<HTMLFormElement>(null);
  const resultId = useId();
  // The form clears itself after a save unless it shows settings that should stay on screen.
  useEffect(() => {
    if (state.status === "success" && !keepValues) formRef.current?.reset();
  }, [state, keepValues]);
  const failed = state.status === "form_validation" || state.status === "error";

  return (
    <form ref={formRef} action={formAction} noValidate aria-describedby={resultId} className="grid gap-2">
      <div className={cn("flex flex-wrap items-end gap-3", className)}>
        {children}
        <Button type="submit" disabled={pending}>
          {icon}
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
      <p
        id={resultId}
        role={failed ? "alert" : "status"}
        className={cn("min-h-5 text-sm", failed ? "text-danger" : "text-success")}
      >
        {state.message}
      </p>
    </form>
  );
}
