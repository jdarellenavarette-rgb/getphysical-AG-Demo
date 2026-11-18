"use client";

import { useActionState, useEffect, useId, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
}: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, idleFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const resultId = useId();
  useEffect(() => {
    if (state.status !== "success") return;
    if (!keepValues) formRef.current?.reset();
    router.refresh();
  }, [state, router, keepValues]);
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
