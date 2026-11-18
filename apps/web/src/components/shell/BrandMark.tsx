import { cn } from "../../lib/utils";

/**
 * GetPhysical lockup (emblem + wordmark) used in the navigation and on signed-out pages.
 * The artwork is a single-colour mark, so it is painted as a mask in the current text colour and
 * follows the light and dark themes without a second file.
 */
export function BrandMark({ className, tagline = false }: { className?: string; tagline?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col gap-1.5", className)}>
      <span
        role="img"
        aria-label="GetPhysical"
        className="block h-[22px] w-[140px] bg-current"
        style={{
          mask: "url(/brand/getphysical-lockup.png) left center / contain no-repeat",
          WebkitMask: "url(/brand/getphysical-lockup.png) left center / contain no-repeat",
        }}
      />
      {tagline && (
        <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Business Suite
        </span>
      )}
    </span>
  );
}
