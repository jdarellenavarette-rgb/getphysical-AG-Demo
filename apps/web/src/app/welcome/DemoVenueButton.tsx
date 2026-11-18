"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { openDemoVenue, type FacilityFormState } from "../actions/facility";

const initialState: FacilityFormState = { status: "idle" };

/** Shown only while the platform is in test mode. */
export function DemoVenueButton({ label = "Explore with a demo venue" }: { label?: string }) {
  const [state, action, pending] = useActionState(openDemoVenue, initialState);
  return (
    <form action={action} className="grid gap-2">
      <Button type="submit" variant="secondary" size="lg" disabled={pending}>
        <Sparkles size={18} aria-hidden />
        {pending ? "Setting up your demo…" : label}
      </Button>
      {state.message && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}
    </form>
  );
}
