"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CircleCheck, Megaphone, X } from "lucide-react";
import { loadBroadcastAudiences, sendCrmBroadcast, type BroadcastAudiences } from "../../app/actions/crm";
import type { SuiteMode } from "../../lib/suite-modes";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { FieldError, Input, Label } from "../ui/input";

type Audience = "ALL" | "ACTIVE" | "LAPSED" | "SEGMENT_1" | "SEGMENT_2" | "SEGMENT_3";

interface BroadcastDialogProps {
  open: boolean;
  onClose: () => void;
  facilityId: string;
  facilityName: string;
  suiteMode: SuiteMode;
  initialAudience?: Audience;
}

/** Compose a broadcast. A native <dialog> gives focus trapping, Escape to close and a backdrop. */
export function BroadcastDialog({
  open,
  onClose,
  facilityId,
  facilityName,
  suiteMode,
  initialAudience,
}: BroadcastDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [audiences, setAudiences] = useState<BroadcastAudiences | null>(null);
  const [audience, setAudience] = useState<Audience>(initialAudience ?? "ALL");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Real reach for this venue, from the same member directory the Members screen shows.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setSentTo(null);
    void loadBroadcastAudiences(facilityId).then((result) => {
      if (!cancelled && result.ok) setAudiences(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, facilityId]);

  const options: { id: Audience; label: string }[] = [
    { id: "ALL", label: "All members" },
    ...(audiences?.usesPasses
      ? [
          { id: "ACTIVE" as const, label: "Active (valid pass)" },
          { id: "LAPSED" as const, label: "Lapsed (win-back)" },
        ]
      : []),
    ...(audiences?.segments ?? []).map((segment) => ({ id: segment.key, label: segment.label })),
  ];
  // Null when the audience is a segment: the database counts those on send.
  const reach =
    audiences === null
      ? null
      : audience === "ALL"
        ? audiences.all
        : audience === "ACTIVE"
          ? audiences.active
          : audience === "LAPSED"
            ? audiences.lapsed
            : null;

  const submit = (formData: FormData) => {
    setFieldErrors({});
    setFormError(null);
    startTransition(async () => {
      const result = await sendCrmBroadcast({
        facilityId,
        suiteMode,
        audience,
        title: String(formData.get("title") ?? ""),
        body: String(formData.get("body") ?? ""),
        promoCode: String(formData.get("promoCode") ?? ""),
      });
      if (!result.ok) {
        if (result.state === "form_validation") setFieldErrors(result.fieldErrors);
        else setFormError(result.message);
        return;
      }
      setSentTo(result.data.recipientCount);
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="broadcast-title"
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h2 id="broadcast-title" className="flex items-center gap-2 text-lg font-bold">
          <Megaphone size={18} aria-hidden /> New broadcast
        </h2>
        <Button variant="ghost" size="sm" aria-label="Close" onClick={onClose}>
          <X size={18} aria-hidden />
        </Button>
      </div>

      {sentTo !== null ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center" role="status">
          <CircleCheck size={44} className="text-success" aria-hidden />
          <p className="text-lg font-bold">Broadcast sent</p>
          <p className="text-sm text-muted-foreground">
            {sentTo === 0
              ? `Nobody in that audience at ${facilityName}, so nothing was delivered.`
              : `Delivered to ${sentTo} ${sentTo === 1 ? "member" : "members"} of ${facilityName}.`}
          </p>
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <form action={submit} noValidate className="grid gap-4 px-6 py-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Send to</legend>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={audience === option.id}
                  onClick={() => setAudience(option.id)}
                  className={cn(
                    "h-10 rounded-full border px-4 text-sm font-semibold transition-colors",
                    audience === option.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
              {audiences === null
                ? "Checking who this will reach…"
                : reach === null
                  ? "Goes to the members in this segment who haven't muted you."
                  : reach === 0
                    ? "Nobody is in this audience right now, so nothing would be delivered."
                    : `Goes to ${reach} ${reach === 1 ? "member" : "members"}. Members who muted your broadcasts are left out.`}
            </p>
            <FieldError>{fieldErrors.audience}</FieldError>
          </fieldset>
          <Label>
            Title
            <Input
              name="title"
              maxLength={120}
              required
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby="broadcast-title-error"
            />
            <FieldError id="broadcast-title-error">{fieldErrors.title}</FieldError>
          </Label>
          <Label>
            Message
            <textarea
              name="body"
              rows={4}
              maxLength={2000}
              required
              aria-invalid={Boolean(fieldErrors.body)}
              aria-describedby="broadcast-body-error"
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground aria-[invalid=true]:border-danger"
            />
            <FieldError id="broadcast-body-error">{fieldErrors.body}</FieldError>
          </Label>
          <Label>
            Promo code to show in the message (optional)
            <Input
              name="promoCode"
              maxLength={32}
              autoCapitalize="characters"
              aria-invalid={Boolean(fieldErrors.promoCode)}
              aria-describedby="broadcast-promo-error"
            />
            <FieldError id="broadcast-promo-error">{fieldErrors.promoCode}</FieldError>
          </Label>
          {formError && (
            <p role="alert" className="text-sm text-danger">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || reach === 0}>
              {pending ? "Sending…" : "Send broadcast"}
            </Button>
          </div>
        </form>
      )}
    </dialog>
  );
}
