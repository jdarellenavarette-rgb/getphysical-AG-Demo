"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { ActionForm } from "../../../components/ui/action-form";
import { Input, Label, Select } from "../../../components/ui/input";
import { createPost } from "../../actions/posts";

interface ComposerProps {
  events: { id: string; title: string }[];
  plans: { id: string; name: string }[];
  /** What this business calls the things it sells. */
  planWord: string;
  hasMembers: boolean;
}

const LIMIT = 1000;

/** Write a post, optionally point it at an event or a plan, and send it now or later. */
export function Composer({ events, plans, planWord, hasMembers }: ComposerProps) {
  const [body, setBody] = useState("");
  const [when, setWhen] = useState<"now" | "later">("now");
  return (
    <ActionForm
      action={createPost}
      submitLabel={when === "now" ? "Post now" : "Schedule post"}
      pendingLabel={when === "now" ? "Posting…" : "Scheduling…"}
      icon={<Send size={16} aria-hidden />}
      className="grid items-stretch gap-4"
    >
      <Label>
        What do you want to say?
        <textarea
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          maxLength={LIMIT}
          rows={5}
          placeholder="A new class, a free court tonight, places left on Saturday…"
          aria-describedby="post-count"
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground"
        />
        <span id="post-count" className="text-sm font-normal text-muted-foreground tabular-nums">
          {body.length} of {LIMIT} characters
        </span>
      </Label>

      {(events.length > 0 || plans.length > 0) && (
        <Label>
          Point people to (optional)
          <Select name="link" defaultValue="">
            <option value="">Nothing: just the post</option>
            {events.length > 0 && (
              <optgroup label="An event to sign up for">
                {events.map((event) => (
                  <option key={event.id} value={`event:${event.id}`}>
                    {event.title}
                  </option>
                ))}
              </optgroup>
            )}
            {plans.length > 0 && (
              <optgroup label={`A ${planWord} to buy`}>
                {plans.map((plan) => (
                  <option key={plan.id} value={`plan:${plan.id}`}>
                    {plan.name}
                  </option>
                ))}
              </optgroup>
            )}
          </Select>
        </Label>
      )}

      <fieldset className="grid gap-3">
        <legend className="mb-2 text-sm font-medium">When</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {(["now", "later"] as const).map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm font-medium">
              <input
                type="radio"
                name="when"
                value={option}
                checked={when === option}
                onChange={() => setWhen(option)}
                className="size-4 accent-[var(--primary)]"
              />
              {option === "now" ? "Now" : "At a set time"}
            </label>
          ))}
        </div>
        {when === "later" && (
          <div className="grid grid-cols-2 gap-3">
            <Label>
              Date
              <Input name="date" type="date" required />
            </Label>
            <Label>
              Time
              <Input name="time" type="time" required />
            </Label>
          </div>
        )}
      </fieldset>

      {when === "now" && hasMembers && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="alsoInbox" className="mt-0.5 size-4 accent-[var(--primary)]" />
          <span>
            <span className="font-medium">Also send to members&apos; inboxes</span>
            <span className="block text-muted-foreground">
              Arrives as a message in the Sodia app today. Members who muted you are skipped.
            </span>
          </span>
        </label>
      )}
    </ActionForm>
  );
}
