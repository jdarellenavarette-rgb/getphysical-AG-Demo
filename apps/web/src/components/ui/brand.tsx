import { cn } from "../../lib/utils";

/** Maya's wordmark on the dark background it is designed for. */
export function MayaMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-8 items-center rounded-lg bg-black px-3", className)}>
      <img src="/brand/maya.svg" alt="Maya" width={62} height={18} className="h-[18px] w-auto" />
    </span>
  );
}

/** Google's "G", for sign-in buttons. */
export function GoogleMark({ className }: { className?: string }) {
  return (
    <img src="/brand/google-g.png" alt="" aria-hidden width={20} height={20} className={cn("size-5", className)} />
  );
}
