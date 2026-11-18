"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { FieldError, Input, Label } from "../../../components/ui/input";
import type { SellingSettings } from "../../../lib/data/products";
import { updateSellingSettings, type ProductFormState } from "../../actions/products";

const initialState: ProductFormState = { status: "idle" };

/** Venue-wide switches. Not every gym sells memberships; some only take walk-ins. */
export function SellingSettingsForm({ settings, canEdit }: { settings: SellingSettings; canEdit: boolean }) {
  const [state, action, pending] = useActionState(updateSellingSettings, initialState);
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state, router]);
  const failed = state.status !== "success" && state.status !== "idle";

  return (
    <form action={action} noValidate className="grid gap-4">
      <fieldset disabled={!canEdit || pending} className="grid gap-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="sellsPasses"
            defaultChecked={settings.sellsPasses}
            className="mt-1 size-5 accent-primary"
          />
          <span>
            <span className="font-semibold">We sell passes</span>
            <span className="block text-sm text-muted-foreground">
              One-off access such as a day or week pass. Turn off if you only take members.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="sellsMemberships"
            defaultChecked={settings.sellsMemberships}
            className="mt-1 size-5 accent-primary"
          />
          <span>
            <span className="font-semibold">We offer memberships</span>
            <span className="block text-sm text-muted-foreground">
              Turn off if you only take walk-ins. Your membership plans stay saved but can&apos;t be bought.
            </span>
          </span>
        </label>
        <Label className="max-w-sm">
          Grace period after a pass ends (days)
          <Input
            name="graceDays"
            inputMode="numeric"
            defaultValue={String(settings.graceDays)}
            aria-invalid={Boolean(state.fieldErrors?.graceDays)}
            aria-describedby="grace-help grace-error"
          />
          <span id="grace-help" className="text-sm font-normal text-muted-foreground">
            How long someone still counts as an active member before they move to Lapsed. 0 to 30. Door access always
            ends with the pass.
          </span>
          <FieldError id="grace-error">{state.fieldErrors?.graceDays}</FieldError>
        </Label>
      </fieldset>
      {canEdit && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
          <span role={failed ? "alert" : "status"} className={`text-sm ${failed ? "text-danger" : "text-success"}`}>
            {state.message}
          </span>
        </div>
      )}
    </form>
  );
}
