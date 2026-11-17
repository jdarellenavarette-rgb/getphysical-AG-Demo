import { redirect } from "next/navigation";
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
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-7">
        <h1 className="text-2xl font-bold">Set up your first facility</h1>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          Signed in as {session.email ?? session.displayName}. If your gym or club already uses GetPhysical, its owner
          needs to give your account access before it appears here.
        </p>
        <CreateFacilityForm />
        <form action={signOut} className="mt-4">
          <button type="submit" className="text-sm text-muted-foreground underline">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
