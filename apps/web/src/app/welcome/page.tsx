import { redirect } from "next/navigation";
import { BrandMark } from "../../components/shell/BrandMark";
import { getSuiteSession } from "../../lib/active-facility";
import { signOut } from "../actions/auth";
import { CreateFacilityForm } from "./CreateFacilityForm";

export const metadata = { title: "Set up your facility" };
export const dynamic = "force-dynamic";

/** First run: the account is signed in but does not staff any facility yet. */
export default async function WelcomePage() {
  const session = await getSuiteSession();
  if (!session) redirect("/login");
  if (session.active) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <BrandMark tagline className="mb-8" />
        <section className="rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Step 1 of 2</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Open your business profile</h1>
          <p className="mt-2 mb-7 text-muted-foreground">
            Signed in as {session.email ?? session.displayName}. Tell us about your venue; you&apos;ll add plans,
            payouts and members next. If your gym or club already uses GetPhysical, its owner needs to give your account
            access instead.
          </p>
          <CreateFacilityForm />
        </section>
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
