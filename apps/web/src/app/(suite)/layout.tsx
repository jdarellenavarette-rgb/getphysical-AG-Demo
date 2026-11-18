import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { FacilitySwitcher } from "../../components/shell/FacilitySwitcher";
import { SuiteNav } from "../../components/shell/SuiteNav";
import { ThemeToggle } from "../../components/shell/ThemeToggle";
import { Button } from "../../components/ui/button";
import { requireSuiteSession } from "../../lib/active-facility";
import { suiteNavFor } from "../../lib/nav";
import { signOut } from "../actions/auth";

export const dynamic = "force-dynamic";

const ROLE_LABELS = { OWNER: "Owner", ADMIN: "Admin", STAFF: "Staff", COACH: "Coach" } as const;

/** Signed-in shell: which facility you are acting for, who you are, and the sections available. */
export default async function SuiteLayout({ children }: { children: ReactNode }) {
  const session = await requireSuiteSession();
  const facility = session.active;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <SuiteNav items={suiteNavFor(facility.registryType)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border bg-card px-4 py-3 lg:px-8">
          <div className="min-w-0">
            {session.facilities.length > 1 ? (
              <FacilitySwitcher
                activeId={facility.id}
                facilities={session.facilities.map((f) => ({ id: f.id, name: f.name }))}
              />
            ) : (
              <p className="truncate text-base font-bold">{facility.name}</p>
            )}
            <p className="mt-0.5 text-sm text-muted-foreground">
              {facility.registryType === "COMMUNITY" ? "Clubdash · Community club" : "GymDash · Commercial gym"} ·{" "}
              {facility.plan === "PRO" ? "Pro plan" : "Free plan"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm leading-tight">
              <p className="font-semibold">{session.displayName}</p>
              <p className="text-muted-foreground">{ROLE_LABELS[facility.role]}</p>
            </div>
            <ThemeToggle />
            <form action={signOut}>
              <Button type="submit" variant="secondary" size="sm">
                <LogOut size={16} aria-hidden />
                Sign out
              </Button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
