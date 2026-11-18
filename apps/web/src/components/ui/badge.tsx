import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Tone = "neutral" | "success" | "danger" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-foreground",
  success: "bg-success-muted text-success",
  danger: "bg-danger-muted text-danger",
  warning: "bg-warning-muted text-warning",
};

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
}
