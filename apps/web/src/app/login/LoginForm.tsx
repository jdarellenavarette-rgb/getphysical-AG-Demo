"use client";

import { useActionState, useState } from "react";
import { Button } from "../../components/ui/button";
import { FieldError, Input, Label } from "../../components/ui/input";
import { sendMagicLink, signInWithPassword, signInWithProvider, type AuthFormState } from "../actions/auth";

const initialState: AuthFormState = { status: "idle" };

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [passwordState, passwordAction, passwordPending] = useActionState(signInWithPassword, initialState);
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, initialState);
  const state = mode === "password" ? passwordState : magicState;
  const pending = mode === "password" ? passwordPending : magicPending;

  return (
    <div className="grid gap-5">
      <form action={signInWithProvider.bind(null, "google")}>
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="secondary" size="lg" className="w-full">
          Continue with Google
        </Button>
      </form>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={mode === "password" ? passwordAction : magicAction} noValidate className="grid gap-3">
        <input type="hidden" name="next" value={next} />
        <Label>
          Email
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby="email-error"
          />
          <FieldError id="email-error">{state.fieldErrors?.email}</FieldError>
        </Label>

        {mode === "password" && (
          <Label>
            Password
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(state.fieldErrors?.password)}
              aria-describedby="password-error"
            />
            <FieldError id="password-error">{state.fieldErrors?.password}</FieldError>
          </Label>
        )}

        {state.message && (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={state.status === "error" ? "text-sm text-danger" : "text-sm text-success"}
          >
            {state.message}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Please wait…" : mode === "password" ? "Sign in" : "Email me a sign-in link"}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "password" ? "magic" : "password")}
          className="justify-self-center text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {mode === "password" ? "Use a one-time email link instead" : "Use my password instead"}
        </button>
      </form>
    </div>
  );
}
