import { redirect } from "next/navigation";
import { createServerSupabase } from "../../lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in | GetPhysical Business Suite" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  const params = await searchParams;
  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="login-title">
        <p style={styles.eyebrow}>GetPhysical Business Suite</p>
        <h1 id="login-title" style={styles.title}>Sign in to GymDash, Clubdash &amp; CoachDash</h1>
        {params.error === "link_expired" && (
          <p role="alert" style={styles.alert}>That sign-in link has expired. Request a new one below.</p>
        )}
        {params.error === "oauth_failed" && (
          <p role="alert" style={styles.alert}>Sign-in with Apple or Google didn&apos;t complete. Please try again.</p>
        )}
        <LoginForm next={params.next ?? "/"} />
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    background: "#0B0D12",
    color: "#F3F4F6",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#12151C",
    border: "1px solid #232836",
    borderRadius: 16,
    padding: 28,
  },
  eyebrow: { margin: 0, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" as const, color: "#FF5364", fontWeight: 700 },
  title: { margin: "8px 0 20px", fontSize: 22, lineHeight: 1.3 },
  alert: { background: "#2A1418", color: "#FCA5A5", padding: "10px 12px", borderRadius: 8, fontSize: 14 },
} as const;
