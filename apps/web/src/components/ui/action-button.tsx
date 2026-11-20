"use client";

import { useRefreshAfterAction } from "../../lib/use-server-form";
import { useState, useTransition, type ReactNode } from "react";
import type { ActionResult } from "../../lib/form-state";
import { Button, type ButtonProps } from "./button";

interface ActionButtonProps {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  pendingLabel: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  /** Ask first: shown as the question, with a confirm and a keep button. */
  confirm?: { question: string; yes: string };
  "aria-label"?: string;
}

/** A one-tap Server Action with a pending state, an optional confirmation step and an announced result. */
export function ActionButton({
  action,
  children,
  pendingLabel,
  variant = "secondary",
  size = "sm",
  confirm,
  ...rest
}: ActionButtonProps) {
  const refresh = useRefreshAfterAction();
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const run = () =>
    startTransition(async () => {
      const outcome = await action();
      setAsking(false);
      setFailure(outcome.ok ? null : outcome.message);
      if (outcome.ok) refresh();
    });

  return (
    <span className="inline-flex flex-col items-end gap-1">
      {asking && confirm ? (
        <span className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-sm">{confirm.question}</span>
          <Button size="sm" variant="danger" disabled={pending} onClick={run}>
            {pending ? pendingLabel : confirm.yes}
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setAsking(false)}>
            Keep
          </Button>
        </span>
      ) : (
        <Button
          size={size}
          variant={variant}
          disabled={pending}
          aria-label={rest["aria-label"]}
          onClick={confirm ? () => setAsking(true) : run}
        >
          {pending ? pendingLabel : children}
        </Button>
      )}
      {failure && (
        <span role="alert" className="max-w-xs text-right text-sm text-danger">
          {failure}
        </span>
      )}
    </span>
  );
}
