import Link from "next/link";
import { Check } from "lucide-react";
import type { SetupProgress } from "../../lib/data/setup";
import { cn } from "../../lib/utils";
import { buttonClasses } from "../ui/button";

/** First-run guide on the Overview. Disappears once every step is done. */
export function SetupChecklist({
  progress,
  venueName,
  audience = "members",
}: {
  progress: SetupProgress;
  venueName: string;
  /** What this business calls the people it serves. */
  audience?: string;
}) {
  const next = progress.steps.find((step) => !step.done);
  const percent = Math.round((progress.doneCount / progress.steps.length) * 100);
  return (
    <section
      aria-labelledby="setup-title"
      className="mb-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 bg-foreground px-6 py-6 text-background lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-wide uppercase opacity-80">Getting started</p>
          <h2 id="setup-title" className="mt-1 text-2xl font-bold tracking-tight">
            Get {venueName} ready for {audience}
          </h2>
        </div>
        <div className="min-w-48">
          <p className="text-sm font-semibold">
            {progress.doneCount} of {progress.steps.length} done
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-background/25"
            role="progressbar"
            aria-label="Setup progress"
            aria-valuemin={0}
            aria-valuemax={progress.steps.length}
            aria-valuenow={progress.doneCount}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
      <ol className="divide-y divide-border">
        {progress.steps.map((step, index) => (
          <li key={step.id} className="flex flex-wrap items-center gap-4 px-6 py-4 lg:px-8">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                step.done
                  ? "bg-success-muted text-success"
                  : step === next
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
              aria-hidden
            >
              {step.done ? <Check size={18} /> : index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("font-semibold", step.done && "text-muted-foreground line-through")}>
                {step.title}
                <span className="sr-only">{step.done ? " (done)" : " (to do)"}</span>
              </p>
              {!step.done && <p className="text-sm text-muted-foreground">{step.description}</p>}
            </div>
            {!step.done && (
              <Link href={step.href} className={buttonClasses(step === next ? "primary" : "secondary", "sm")}>
                {step.action}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
