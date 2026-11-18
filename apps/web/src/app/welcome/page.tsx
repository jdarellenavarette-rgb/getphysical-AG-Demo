import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "../../components/shell/BrandMark";
import { getSuiteSession } from "../../lib/active-facility";
import { signOut } from "../actions/auth";
import { createServerSupabase } from "../../lib/supabase/server";
import { CreateFacilityForm } from "./CreateFacilityForm";
import { DemoVenueButton } from "./DemoVenueButton";

export const metadata = { title: "Open a business" };
export const dynamic = "force-dynamic";

/** First run: the account is signed in but does not staff any facility yet. */
export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const session = await getSuiteSession();
  if (!session) redirect("/login");
  // Someone who already runs a business comes here on purpose to open another one.
  const adding = Boolean(session.active) && (await searchParams).new === "1";
  if (session.active && !adding) redirect("/");
  const { data: mode } = await (await createServerSupabase()).rpc("payments_mode");
  const demoAvailable = mode === "sandbox";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <BrandMark size="lg" tagline className="mb-8" />
        <section className="rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            {adding ? "Another business" : "Step 1 of 2"}
          </p>
          <h1 className="mt-1 text-3xl">Open your business profile</h1>
          <p className="mt-2 mb-7 text-muted-foreground">
            Signed in as {session.email ?? session.displayName}. Choose what you run. Each kind of business gets its own
            workspace, built around how it works. If your gym or club already uses GetPhysical, its owner needs to give
            your account access instead.
          </p>
          <CreateFacilityForm />
        </section>
        {demoAvailable && !adding && (
          <section className="mt-5 rounded-3xl border border-dashed border-border p-6">
            <h2 className="font-semibold">Just looking around?</h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              Open four demo businesses, one per workspace: a gym, a sports club, a coaching business and an event
              organizer. Nothing in them is real, and payments run in test mode.
            </p>
            <DemoVenueButton />
          </section>
        )}
        {adding && (
          <p className="mt-5 text-center text-sm">
            <Link
              href="/"
              className="font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Back to {session.active?.name}
            </Link>
          </p>
        )}
        <form action={signOut} className="mt-5 text-center">
          <button
            type="submit"
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
