"use client";

import { useState, useTransition } from "react";
import { recordDeskPayment, type DeskPaymentInput } from "../../app/actions/desk";
import { useRefreshAfterAction } from "../../lib/use-server-form";
import { Badge } from "./badge";
import { Button } from "./button";
import { Select } from "./input";

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });

interface PayButtonProps {
  kind: DeskPaymentInput["kind"];
  refId: string;
  userId?: string | null;
  /** What it costs. Null when no price is set. */
  price: number | null;
  /** Already recorded at the desk, net of reversals. */
  paid: number;
  payerName: string;
}

/**
 * Whether something has been paid for, and a way to record that it has. Nothing is charged: the
 * business took the money itself and this keeps its record.
 */
export function PayButton({ kind, refId, userId = null, price, paid, payerName }: PayButtonProps) {
  const refresh = useRefreshAfterAction();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<DeskPaymentInput["method"]>("CASH");
  const [failure, setFailure] = useState<string | null>(null);

  if (price === null || price === 0) return <span className="text-muted-foreground">{price === 0 ? "Free" : "—"}</span>;
  const due = Math.round((price - paid) * 100) / 100;
  if (due <= 0) return <Badge tone="success">Paid {peso.format(paid)}</Badge>;

  const take = () =>
    startTransition(async () => {
      const outcome = await recordDeskPayment({ kind, refId, userId, amount: due, method, payerName });
      if (outcome.ok) refresh();
      else setFailure(outcome.message);
    });

  return (
    <span className="inline-flex flex-col items-start gap-1">
      {open ? (
        <span className="flex flex-wrap items-center gap-2">
          <Select
            aria-label={`How ${payerName} paid`}
            value={method}
            onChange={(event) => setMethod(event.target.value as DeskPaymentInput["method"])}
            className="h-9 w-auto text-sm"
          >
            <option value="CASH">Cash</option>
            <option value="EWALLET">E-wallet</option>
            <option value="CARD">Card</option>
            <option value="BANK">Bank transfer</option>
            <option value="OTHER">Other</option>
          </Select>
          <Button size="sm" disabled={pending} onClick={take}>
            {pending ? "Saving…" : `Record ${peso.format(due)}`}
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>
            Back
          </Button>
        </span>
      ) : (
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone="warning">{paid > 0 ? `${peso.format(due)} due` : `${peso.format(price)} unpaid`}</Badge>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOpen(true)}
            aria-label={`Record payment from ${payerName}`}
          >
            Record payment
          </Button>
        </span>
      )}
      {failure && (
        <span role="alert" className="text-sm text-danger">
          {failure}
        </span>
      )}
    </span>
  );
}
