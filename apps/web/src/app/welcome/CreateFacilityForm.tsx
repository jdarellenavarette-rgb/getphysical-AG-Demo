"use client";

import { useActionState, useState } from "react";
import { Building2, ClipboardList, Dumbbell, Medal, Trophy, type LucideIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { FieldError, Input, Label } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { createFacility, type FacilityFormState } from "../actions/facility";

const initialState: FacilityFormState = { status: "idle" };

type Kind = "GYM" | "STUDIO" | "CLUB" | "COACH" | "ORGANIZER";
const KINDS: { id: Kind; label: string; text: string; icon: LucideIcon; registryType: "COMMERCIAL" | "COMMUNITY" }[] = [
  {
    id: "GYM",
    label: "Gym",
    text: "Members buy passes or memberships and scan in at the door.",
    icon: Dumbbell,
    registryType: "COMMERCIAL",
  },
  {
    id: "STUDIO",
    label: "Fitness studio",
    text: "Classes and training, sold as passes or memberships.",
    icon: Building2,
    registryType: "COMMERCIAL",
  },
  {
    id: "CLUB",
    label: "Sports club",
    text: "A community club people join. Free for up to 19 members.",
    icon: Trophy,
    registryType: "COMMUNITY",
  },
  {
    id: "COACH",
    label: "Coaching",
    text: "You train clients and follow their progress. Free for up to 3 clients.",
    icon: ClipboardList,
    registryType: "COMMUNITY",
  },
  {
    id: "ORGANIZER",
    label: "Event organizer",
    text: "You run tournaments, races and open-play days people sign up for.",
    icon: Medal,
    registryType: "COMMUNITY",
  },
];

const NAME_LABELS: Record<Kind, string> = {
  GYM: "Name of your gym",
  STUDIO: "Name of your fitness studio",
  CLUB: "Name of your sports club",
  COACH: "Name of your coaching business",
  ORGANIZER: "Name you organise events under",
};

/** First step of setting up a business: what kind of venue it is and what it is called. */
export function CreateFacilityForm() {
  const [state, action, pending] = useActionState(createFacility, initialState);
  const [kind, setKind] = useState<Kind>("GYM");
  const selected = KINDS.find((k) => k.id === kind)!;

  return (
    <form action={action} noValidate className="grid gap-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">What are you opening?</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {KINDS.map(({ id, label, text, icon: Icon }) => (
            <label
              key={id}
              className={cn(
                "cursor-pointer rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                kind === id ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
              )}
            >
              <input
                type="radio"
                name="kind"
                value={id}
                checked={kind === id}
                onChange={() => setKind(id)}
                className="sr-only"
              />
              <Icon size={22} aria-hidden className={kind === id ? "text-primary" : "text-muted-foreground"} />
              <span className="mt-2 block font-semibold">{label}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{text}</span>
            </label>
          ))}
        </div>
        <input type="hidden" name="registryType" value={selected.registryType} />
        <input type="hidden" name="category" value={selected.label} />
        <FieldError>{state.fieldErrors?.registryType}</FieldError>
      </fieldset>

      <Label>
        {NAME_LABELS[kind]}
        <Input
          name="name"
          required
          maxLength={120}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby="facility-name-error"
        />
        <FieldError id="facility-name-error">{state.fieldErrors?.name}</FieldError>
      </Label>
      <Label>
        Address (you can add this later)
        <Input name="address" maxLength={200} />
      </Label>
      {state.message && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Creating…" : "Create and continue"}
      </Button>
    </form>
  );
}
