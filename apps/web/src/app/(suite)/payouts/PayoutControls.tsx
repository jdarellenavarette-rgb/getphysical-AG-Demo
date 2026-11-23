"use client";

import { useRefreshAfterAction } from "../../../lib/use-server-form";
import { useState, useTransition } from "react";
import { Button } from "../../../components/ui/button";
import type { PayoutState } from "../../../lib/data/payouts";
import {
  connectTestPayouts,
  disconnectTestPayouts,
  requestLivePayouts,
  type PayoutActionResult,
} from "../../actions/payouts";

interface PayoutControlsProps {
  state: PayoutState;
  sandboxAvailable: boolean;
  liveRequested: boolean;
}

export function PayoutControls({ state, sandboxAvailable, liveRequested }: PayoutControlsProps) {
  const refresh = useRefreshAfterAction();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<PayoutActionResult | null>(null);
  const run = (action: () => Promise<PayoutActionResult>) =>
    startTransition(async () => {
      const outcome = await action();
      setResult(outcome);
      if (outcome.ok) refresh();
    });

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-3">
        {state === "NOT_SET_UP" && sandboxAvailable && (
          <Button disabled={pending} onClick={() => run(connectTestPayouts)}>
            {pending ? "Connecting…" : "Try it in test mode"}
          </Button>
        )}
        {state === "TEST_MODE" && (
          <Button variant="danger" disabled={pending} onClick={() => run(disconnectTestPayouts)}>
            {pending ? "Working…" : "Turn off test payments"}
          </Button>
        )}
        {state !== "LIVE" && !liveRequested && (
          <Button variant="secondary" disabled={pending} onClick={() => run(requestLivePayouts)}>
            Tell me when payments are ready
          </Button>
        )}
      </div>
      {result && (
        <p role={result.ok ? "status" : "alert"} className={`text-sm ${result.ok ? "text-success" : "text-danger"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
