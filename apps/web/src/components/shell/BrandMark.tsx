import { cn } from "../../lib/utils";

/**
 * GetPhysical lockup (emblem + wordmark) used in the navigation and on signed-out pages.
 * The artwork is a single-colour mark, so it is painted as a mask in the current text colour and
 * follows the light and dark themes without a second file.
 */
const SIZES = {
  md: { mark: "h-[22px] w-[140px]", tagline: "text-[11px]" },
  lg: {
    mark: "h-[34px] w-[217px] min-[1800px]:h-[42px] min-[1800px]:w-[268px] min-[2400px]:h-[56px] min-[2400px]:w-[357px]",
    tagline: "text-xs min-[1800px]:text-sm min-[2400px]:text-base",
  },
} as const;

export function BrandMark({
  className,
  tagline = false,
  size = "md",
}: {
  className?: string;
  tagline?: boolean;
  /** `lg` for the signed-out pages, where the brand leads the page. */
  size?: keyof typeof SIZES;
}) {
  return (
    <span className={cn("inline-flex flex-col", size === "lg" ? "gap-2.5" : "gap-1.5", className)}>
      <span
        role="img"
        aria-label="GetPhysical"
        className={cn("block bg-current", SIZES[size].mark)}
        style={{
          mask: "url(/brand/getphysical-lockup.png) left center / contain no-repeat",
          WebkitMask: "url(/brand/getphysical-lockup.png) left center / contain no-repeat",
        }}
      />
      {tagline && (
        <span className={cn("font-semibold tracking-[0.18em] text-muted-foreground uppercase", SIZES[size].tagline)}>
          Business Suite
        </span>
      )}
    </span>
  );
}
