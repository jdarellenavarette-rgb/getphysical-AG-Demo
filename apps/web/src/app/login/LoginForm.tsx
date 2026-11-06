"use client";

import { useActionState, useState } from "react";
import { sendMagicLink, signInWithPassword, type AuthFormState } from "../actions/auth";

const initialState: AuthFormState = { status: "idle" };

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [passwordState, passwordAction, passwordPending] = useActionState(signInWithPassword, initialState);
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, initialState);
  const state = mode === "password" ? passwordState : magicState;
  const pending = mode === "password" ? passwordPending : magicPending;

  return (
    <form action={mode === "password" ? passwordAction : magicAction} noValidate style={{ display: "grid", gap: 14 }}>
      <input type="hidden" name="next" value={next} />
      <label style={labelStyle}>
        Work email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby="email-error"
          style={{ ...inputStyle, borderColor: state.fieldErrors?.email ? "#F87171" : "#2C3242" }}
        />
        <span id="email-error" style={errorStyle}>{state.fieldErrors?.email}</span>
      </label>

      {mode === "password" && (
        <label style={labelStyle}>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby="password-error"
            style={{ ...inputStyle, borderColor: state.fieldErrors?.password ? "#F87171" : "#2C3242" }}
          />
          <span id="password-error" style={errorStyle}>{state.fieldErrors?.password}</span>
        </label>
      )}

      {state.message && (
        <p role={state.status === "error" ? "alert" : "status"} style={{ margin: 0, fontSize: 14, color: state.status === "error" ? "#FCA5A5" : "#6EE7B7" }}>
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} style={{ ...buttonStyle, opacity: pending ? 0.6 : 1 }}>
        {pending ? "Please wait…" : mode === "password" ? "Sign in" : "Email me a sign-in link"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "password" ? "magic" : "password")}
        style={linkButtonStyle}
      >
        {mode === "password" ? "Use a one-time email link instead" : "Use my password instead"}
      </button>
    </form>
  );
}

const labelStyle = { display: "grid", gap: 6, fontSize: 14, color: "#D1D5DB" } as const;
const inputStyle = {
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid #2C3242",
  background: "#0B0D12",
  color: "#F3F4F6",
  fontSize: 15,
} as const;
const errorStyle = { minHeight: 16, fontSize: 12, color: "#F87171" } as const;
const buttonStyle = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "none",
  background: "#FF5364",
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
} as const;
const linkButtonStyle = {
  background: "none",
  border: "none",
  color: "#9CA3AF",
  fontSize: 13,
  cursor: "pointer",
  textDecoration: "underline",
} as const;
