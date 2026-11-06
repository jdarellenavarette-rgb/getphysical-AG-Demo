import { redirect } from "next/navigation";
import { BusinessSuiteShell } from "../components/suite/BusinessSuiteShell";
import { getSuiteSession } from "../lib/active-facility";
import { CreateFacilityForm } from "./CreateFacilityForm";
import { signOut } from "./actions/auth";

export const dynamic = "force-dynamic";

/**
 * Server Component: resolves the signed-in operator and their facility on the
 * server, then hands only what the client shell needs to the client leaf.
 */
export default async function SuiteRootPage() {
  const session = await getSuiteSession();
  if (!session) redirect("/login");

  if (!session.active) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "#0B0D12", color: "#F3F4F6", fontFamily: "system-ui, sans-serif" }}>
        <section style={{ width: "100%", maxWidth: 460, background: "#12151C", border: "1px solid #232836", borderRadius: 16, padding: 28 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 22 }}>Set up your first facility</h1>
          <p style={{ margin: "0 0 20px", color: "#9CA3AF", fontSize: 14 }}>
            Signed in as {session.email}. If your gym already uses GetPhysical, ask its owner to add you as staff.
          </p>
          <CreateFacilityForm />
          <form action={signOut} style={{ marginTop: 16 }}>
            <button type="submit" style={{ background: "none", border: "none", color: "#9CA3AF", textDecoration: "underline", cursor: "pointer" }}>
              Sign out
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <BusinessSuiteShell
      facility={session.active}
      facilities={session.facilities}
      operatorName={session.displayName}
    />
  );
}
