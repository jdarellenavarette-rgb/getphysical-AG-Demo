"use client";

import { useActionState } from "react";
import { createFacility, type FacilityFormState } from "./actions/facility";

const initialState: FacilityFormState = { status: "idle" };

/** Empty state for operators who don't staff any facility yet. */
export function CreateFacilityForm() {
  const [state, action, pending] = useActionState(createFacility, initialState);
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 14 }}>
      <label style={labelStyle}>
        Facility name
        <input name="name" required maxLength={120} style={inputStyle} aria-invalid={Boolean(state.fieldErrors?.name)} />
        <span style={errorStyle}>{state.fieldErrors?.name}</span>
      </label>
      <fieldset style={{ border: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
        <legend style={{ ...labelStyle, marginBottom: 6 }}>Facility type</legend>
        <label style={radioStyle}>
          <input type="radio" name="registryType" value="COMMERCIAL" defaultChecked /> Commercial gym (GymDash · Xendit payouts)
        </label>
        <label style={radioStyle}>
          <input type="radio" name="registryType" value="COMMUNITY" /> Community club (Clubdash · free up to 19 members)
        </label>
        <span style={errorStyle}>{state.fieldErrors?.registryType}</span>
      </fieldset>
      <label style={labelStyle}>
        Address (optional)
        <input name="address" maxLength={200} style={inputStyle} />
      </label>
      {state.message && <p role="alert" style={{ margin: 0, color: "#FCA5A5", fontSize: 14 }}>{state.message}</p>}
      <button type="submit" disabled={pending} style={{ ...buttonStyle, opacity: pending ? 0.6 : 1 }}>
        {pending ? "Creating…" : "Create facility"}
      </button>
    </form>
  );
}

const labelStyle = { display: "grid", gap: 6, fontSize: 14, color: "#D1D5DB" } as const;
const radioStyle = { display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "#E5E7EB" } as const;
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
