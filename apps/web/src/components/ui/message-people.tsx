"use client";

import { MessageSquare, Send } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { messagePeople } from "../../app/actions/messages";
import { idleFormState } from "../../lib/form-state";
import { submitWith, useServerForm } from "../../lib/use-server-form";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Label } from "./input";

interface MessagePeopleProps {
  /** Sodia accounts to write to. People added at the desk without an account can't be messaged. */
  userIds: string[];
  /** Who this reaches, as it reads on the button: "everyone signed up", "Ana". */
  audience: string;
  placeholder?: string;
  size?: "sm" | "md";
}

/** A message to the people on the list in front of you, without going to the inbox to find them. */
export function MessagePeople({ userIds, audience, placeholder, size = "sm" }: MessagePeopleProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useServerForm(messagePeople.bind(null, userIds), idleFormState, {
    shouldRefresh: () => false,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const resultId = useId();
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);
  const failed = state.status === "form_validation" || state.status === "error";

  if (userIds.length === 0) return null;
  if (!open) {
    return (
      <Button variant="secondary" size={size} onClick={() => setOpen(true)}>
        <MessageSquare size={16} aria-hidden />
        Message {audience}
      </Button>
    );
  }
  return (
    <form
      ref={formRef}
      onSubmit={submitWith(formAction)}
      noValidate
      aria-describedby={resultId}
      className="grid w-full gap-2 text-left"
    >
      <Label>
        Message to {audience}
        <textarea
          name="body"
          required
          maxLength={2000}
          rows={3}
          autoFocus
          placeholder={placeholder ?? "Each person gets this in their own conversation with you."}
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground"
        />
      </Label>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size={size} disabled={pending}>
          <Send size={16} aria-hidden />
          {pending ? "Sending…" : `Send to ${userIds.length === 1 ? "1 person" : `${userIds.length} people`}`}
        </Button>
        <Button variant="ghost" size={size} onClick={() => setOpen(false)}>
          Close
        </Button>
        <p
          id={resultId}
          role={failed ? "alert" : "status"}
          className={cn("text-sm", failed ? "text-danger" : "text-success")}
        >
          {state.message}
        </p>
      </div>
    </form>
  );
}
