"use client";

import { useActionState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleX, ScanLine, WifiOff } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input, Label } from "../../../components/ui/input";
import { Notice } from "../../../components/ui/states";
import { verifyScan, type ScanResultState } from "../../actions/checkin";

const initialState: ScanResultState = { status: "idle" };

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Front-desk scanner. A handheld scanner types the code and presses Enter, so
 * the field keeps focus and clears itself after every scan.
 */
export function ScannerForm() {
  const [state, action, pending] = useActionState(verifyScan, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

  const router = useRouter();
  useEffect(() => {
    if (state.status !== "idle") {
      formRef.current?.reset();
      // Reload the scan list and counters; the live feed also does this when realtime is connected.
      router.refresh();
    }
    inputRef.current?.focus();
  }, [state, router]);

  const granted = state.status === "granted";
  return (
    <div className="grid gap-4">
      {!online && (
        <Notice tone="warning" role="alert">
          <WifiOff size={16} className="mr-2 inline" aria-hidden />
          You&apos;re offline. Cards can&apos;t be checked until the connection returns.
        </Notice>
      )}
      <form ref={formRef} action={action} className="flex flex-wrap items-end gap-3">
        <Label className="min-w-64 flex-1">
          Scan or type the code on the member&apos;s card
          <Input
            ref={inputRef}
            name="code"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            required
            placeholder="Waiting for a scan…"
            className="h-14 font-mono text-lg"
          />
        </Label>
        <Button type="submit" size="lg" className="h-14" disabled={pending || !online}>
          <ScanLine size={18} aria-hidden />
          {pending ? "Checking…" : "Check in"}
        </Button>
      </form>

      <div
        role={state.status === "idle" || granted ? "status" : "alert"}
        key={state.at}
        className={`flex min-h-28 items-center gap-4 rounded-2xl border-2 p-5 ${
          state.status === "idle"
            ? "border-border bg-muted text-muted-foreground"
            : granted
              ? "border-success bg-success-muted text-success"
              : "border-danger bg-danger-muted text-danger"
        }`}
      >
        {state.status === "idle" ? (
          <p className="text-base">The result of each scan appears here.</p>
        ) : (
          <>
            {granted ? <CircleCheck size={44} aria-hidden /> : <CircleX size={44} aria-hidden />}
            <div>
              <p className="text-2xl font-bold">
                {granted ? "Entry allowed" : state.status === "denied" ? "Entry denied" : "Not checked in"}
                {state.memberName ? ` · ${state.memberName}` : ""}
              </p>
              {state.message && <p className="mt-1 text-base">{state.message}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
