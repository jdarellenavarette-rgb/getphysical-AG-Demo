"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Home,
  Megaphone,
  MessageSquare,
  ScanLine,
  Settings,
  ShoppingCart,
  Tags,
  Trophy,
  Wallet,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { SuiteNavItem } from "../../lib/nav";
import { cn } from "../../lib/utils";
import { BrandMark } from "./BrandMark";

const ICONS: Record<SuiteNavItem["icon"], LucideIcon> = {
  home: Home,
  members: Users,
  checkin: ScanLine,
  inbox: MessageSquare,
  posts: Megaphone,
  plans: Tags,
  payouts: Wallet,
  sales: ShoppingCart,
  settings: Settings,
  clients: ClipboardList,
  events: Trophy,
  schedule: CalendarDays,
};

/** Section navigation: a side rail on desktop, a scrollable strip on tablets and phones. */
export function SuiteNav({ items }: { items: SuiteNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Business Suite sections"
      className="sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 lg:static lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-4 lg:py-6"
    >
      <Link href="/" className="mb-6 hidden px-2 lg:block">
        <BrandMark tagline />
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
              "group flex h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-semibold whitespace-nowrap transition-colors",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={18} aria-hidden className={cn(active ? "text-primary" : "text-current")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
