"use client";

import { useActionState } from "react";
import { Button } from "../../components/ui/button";
import { FieldError, Input, Label } from "../../components/ui/input";
import { createFacility, type FacilityFormState } from "../actions/facility";

const initialState: FacilityFormState = { status: "idle" };

/** First-run form for operators who don't staff any facility yet. */
export function CreateFacilityForm() {
  const [state, action, pending] = useActionState(createFacility, initialState);
  return (
    <form action={action} noValidate className="grid gap-3">
      <Label>
        Facility name
        <Input
          name="name"
          required
          maxLength={120}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby="facility-name-error"
        />
        <FieldError id="facility-name-error">{state.fieldErrors?.name}</FieldError>
      </Label>
      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-sm font-medium">Facility type</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="registryType" value="COMMERCIAL" defaultChecked /> Commercial gym (GymDash)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="registryType" value="COMMUNITY" /> Community club (Clubdash, free up to 19 members)
        </label>
        <FieldError>{state.fieldErrors?.registryType}</FieldError>
      </fieldset>
      <Label>
        Address (optional)
        <Input name="address" maxLength={200} />
      </Label>
      {state.message && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create facility"}
      </Button>
    </form>
  );
}
