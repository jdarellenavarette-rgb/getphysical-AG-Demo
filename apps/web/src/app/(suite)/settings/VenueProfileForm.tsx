"use client";

import { useServerForm } from "../../../lib/use-server-form";
import { Button } from "../../../components/ui/button";
import { FieldError, Input, Label } from "../../../components/ui/input";
import { Notice } from "../../../components/ui/states";
import type { VenueProfile } from "../../../lib/data/venue";
import { updateVenueProfile, type VenueFormState } from "../../actions/venue";

const initialState: VenueFormState = { status: "idle" };

export function VenueProfileForm({
  venue,
  canEdit,
  showCourtPrice,
}: {
  venue: VenueProfile;
  canEdit: boolean;
  showCourtPrice: boolean;
}) {
  const [state, action, pending] = useServerForm(updateVenueProfile, initialState, { id: "venue-profile" });
  const errors = state.fieldErrors ?? {};
  const price = (value: number | null) => (value == null ? "" : String(value));

  return (
    <form action={action} noValidate className="grid gap-4">
      {!canEdit && (
        <Notice tone="warning" role="note">
          Only the owner or an admin can change venue details. You can view them here.
        </Notice>
      )}
      <fieldset disabled={!canEdit || pending} className="grid gap-4 sm:grid-cols-2">
        <Label className="sm:col-span-2">
          Venue name
          <Input
            name="name"
            defaultValue={venue.name}
            required
            maxLength={120}
            aria-invalid={Boolean(errors.name)}
            aria-describedby="venue-name-error"
          />
          <FieldError id="venue-name-error">{errors.name}</FieldError>
        </Label>
        <Label className="sm:col-span-2">
          Address
          <Input
            name="address"
            defaultValue={venue.address}
            maxLength={200}
            aria-invalid={Boolean(errors.address)}
            aria-describedby="venue-address-error"
          />
          <FieldError id="venue-address-error">{errors.address}</FieldError>
        </Label>
        <Label className="sm:col-span-2">
          Opening hours
          <Input
            name="hours"
            defaultValue={venue.hours}
            maxLength={200}
            placeholder="Mon–Sun, 5:00 AM – 11:00 PM"
            aria-invalid={Boolean(errors.hours)}
            aria-describedby="venue-hours-error"
          />
          <FieldError id="venue-hours-error">{errors.hours}</FieldError>
        </Label>
        {showCourtPrice ? (
          <Label>
            Court price per hour (₱)
            <Input
              name="courtHourlyPricePhp"
              inputMode="decimal"
              defaultValue={price(venue.courtHourlyPricePhp)}
              aria-invalid={Boolean(errors.courtHourlyPricePhp)}
              aria-describedby="venue-court-error"
            />
            <FieldError id="venue-court-error">{errors.courtHourlyPricePhp}</FieldError>
          </Label>
        ) : (
          <input type="hidden" name="courtHourlyPricePhp" value={price(venue.courtHourlyPricePhp)} />
        )}
        <Label>
          Capacity (people)
          <Input
            name="maxCapacity"
            inputMode="numeric"
            defaultValue={price(venue.maxCapacity)}
            aria-invalid={Boolean(errors.maxCapacity)}
            aria-describedby="venue-capacity-error"
          />
          <FieldError id="venue-capacity-error">{errors.maxCapacity}</FieldError>
        </Label>
        <Label className="sm:col-span-2">
          About (shown on your profile in the Sodia app)
          <textarea
            name="about"
            defaultValue={venue.about}
            maxLength={500}
            rows={3}
            placeholder="What you offer and who it is for, in a few sentences."
            aria-invalid={Boolean(errors.about)}
            aria-describedby="venue-about-error"
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger"
          />
          <FieldError id="venue-about-error">{errors.about}</FieldError>
        </Label>
        <Label className="sm:col-span-2">
          Amenities, separated by commas
          <Input
            name="amenities"
            defaultValue={venue.amenities.join(", ")}
            placeholder="Showers, Lockers, Parking"
            aria-invalid={Boolean(errors.amenities)}
            aria-describedby="venue-amenities-error"
          />
          <FieldError id="venue-amenities-error">{errors.amenities}</FieldError>
        </Label>
      </fieldset>
      {state.message && (
        <Notice
          tone={state.status === "success" ? "success" : "danger"}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </Notice>
      )}
      {canEdit && (
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save venue details"}
          </Button>
        </div>
      )}
    </form>
  );
}
