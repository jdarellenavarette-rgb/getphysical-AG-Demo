"use client";

import { useRefreshAfterAction } from "../../../lib/use-server-form";
import { useState, useTransition } from "react";
import type { MemberStanding } from "sodia-core";
import { Button } from "../../../components/ui/button";
import { Select } from "../../../components/ui/input";
import { endMembership, grantPass, reactivateMembership, type MemberActionResult } from "../../actions/members";

interface MemberActionsProps {
  userId: string;
  memberName: string;
  standing: MemberStanding;
  /** Commercial gyms need a pass for the door; community clubs do not. */
  usesPasses: boolean;
}

/** Owner/admin actions on one member. Ending a membership asks for confirmation because it revokes door access. */
export function MemberActions({ userId, memberName, standing, usesPasses }: MemberActionsProps) {
  const refresh = useRefreshAfterAction();
  const [pending, startTransition] = useTransition();
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [days, setDays] = useState(30);
  const [result, setResult] = useState<MemberActionResult | null>(null);

  const run = (action: () => Promise<MemberActionResult>) =>
    startTransition(async () => {
      const outcome = await action();
      setResult(outcome);
      setConfirmingEnd(false);
      if (outcome.ok) refresh();
    });

  return (
    <div className="flex flex-col items-end gap-2">
      {standing === "CANCELLED" ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => reactivateMembership(userId))}
        >
          Reactivate
        </Button>
      ) : confirmingEnd ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-sm">End membership{usesPasses ? " and revoke door access" : ""}?</span>
          <Button size="sm" variant="danger" disabled={pending} onClick={() => run(() => endMembership(userId))}>
            {pending ? "Ending…" : "Yes, end it"}
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirmingEnd(false)}>
            Keep
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {usesPasses && (
            <>
              <Select
                aria-label={`Pass length for ${memberName}`}
                className="h-9 w-32 text-sm"
                value={days}
                disabled={pending}
                onChange={(event) => setDays(Number(event.target.value))}
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={365}>1 year</option>
              </Select>
              <Button
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => run(() => grantPass(userId, days))}
              >
                {pending ? "Working…" : "Grant pass"}
              </Button>
            </>
          )}
          <Button size="sm" variant="danger" disabled={pending} onClick={() => setConfirmingEnd(true)}>
            End membership
          </Button>
        </div>
      )}
      {result && (
        <p
          role={result.ok ? "status" : "alert"}
          className={`max-w-xs text-right text-sm ${result.ok ? "text-success" : "text-danger"}`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
