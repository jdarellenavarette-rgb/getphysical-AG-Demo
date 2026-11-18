import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { SUITE_TIME_ZONE } from "../../lib/format";

const hourOf = new Intl.DateTimeFormat("en-PH", { timeZone: SUITE_TIME_ZONE, hour: "numeric", hour12: false });
const today = new Intl.DateTimeFormat("en-PH", {
  timeZone: SUITE_TIME_ZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function greeting(): string {
  const hour = Number(hourOf.format(new Date()));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

/** The top of every workspace's home: who you are, what day it is, and the one thing you most often do next. */
export function HomeHeader({ name, line, action }: { name: string; line: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-muted-foreground">{today.format(new Date())}</p>
        <h1 className="mt-1 text-3xl">
          {greeting()}, {name.split(/[\s@]/)[0]}
        </h1>
        <p className="mt-1.5 max-w-2xl text-muted-foreground">{line}</p>
      </div>
      {action}
    </div>
  );
}

export function SeeAll({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
    >
      {children}
      <ArrowRight size={14} aria-hidden />
    </Link>
  );
}

/** A filled bar for "how full is it". */
export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className="h-2.5 overflow-hidden rounded-full bg-muted"
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
    </div>
  );
}
