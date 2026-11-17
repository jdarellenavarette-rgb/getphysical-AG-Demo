import type { ComponentProps, LabelHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const field =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(field, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(field, "pr-8", className)} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("grid gap-1.5 text-sm font-medium text-foreground", className)} {...props} />;
}

/** Inline field error; always rendered so the layout does not jump. */
export function FieldError({ id, children }: { id?: string; children?: string }) {
  return (
    <span id={id} className="min-h-5 text-sm text-danger">
      {children}
    </span>
  );
}
