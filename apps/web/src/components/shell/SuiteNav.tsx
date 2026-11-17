"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Home,
  MessageSquare,
  ScanLine,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { SuiteNavItem } from "../../lib/nav";
import { cn } from "../../lib/utils";

const ICONS: Record<SuiteNavItem["icon"], LucideIcon> = {
  overview: Home,
  members: Users,
  checkin: ScanLine,
  inbox: MessageSquare,
  schedule: CalendarDays,
  sales: ShoppingCart,
  settings: Settings,
};

/** Section navigation: a side rail on desktop, a scrollable strip on tablets and phones. */
export function SuiteNav({ items }: { items: SuiteNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Business Suite sections"
      className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 lg:w-60 lg:shrink-0 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0 lg:px-3 lg:py-5"
    >
      <Link href="/" className="mb-4 hidden px-3 text-xl font-black tracking-tight italic lg:block">
        GetPhysical
      </Link>
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
            )}
          >
            <Icon size={18} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
