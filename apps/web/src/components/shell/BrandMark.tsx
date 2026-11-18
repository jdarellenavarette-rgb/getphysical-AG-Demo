import { cn } from "../../lib/utils";

/** Wordmark used in the navigation and on signed-out pages. */
export function BrandMark({ className, tagline = false }: { className?: string; tagline?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="flex size-9 items-center justify-center rounded-xl bg-primary text-base font-black text-primary-foreground italic"
      >
        GP
      </span>
      <span className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight">GetPhysical</span>
        {tagline && <span className="block text-xs font-medium text-muted-foreground">Business Suite</span>}
      </span>
    </span>
  );
}
