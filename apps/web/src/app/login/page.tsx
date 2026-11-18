import { redirect } from "next/navigation";
import { MessageSquare, ScanLine, Users } from "lucide-react";
import { BrandMark } from "../../components/shell/BrandMark";
import { Notice } from "../../components/ui/states";
import { createServerSupabase } from "../../lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

const POINTS = [
  { icon: Users, title: "Know every member", text: "Who is active, who has lapsed, and who to win back." },
  { icon: ScanLine, title: "Check in at the door", text: "Scan the card in the Sodia app. Each code works once." },
  { icon: MessageSquare, title: "Talk to your members", text: "One inbox, and broadcasts to exactly the right group." },
];

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
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute -top-40 -right-40 size-[34rem] rounded-full bg-rose-600/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-rose-500/15 blur-3xl" />
        <BrandMark className="relative [&_.text-muted-foreground]:text-zinc-300" tagline />
        <div className="relative">
          <h2 className="max-w-md text-5xl leading-[1.05] font-black tracking-tight">
            Run your gym or club from one place.
          </h2>
          <ul className="mt-10 grid max-w-md gap-6">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon size={20} aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-zinc-300">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-zinc-400">Connected to the Sodia app your members already use.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10" aria-labelledby="login-title">
        <div className="w-full max-w-sm">
          <BrandMark className="mb-10 lg:hidden" tagline />
          <h1 id="login-title" className="text-3xl font-bold tracking-tight">
            Sign in
          </h1>
          <p className="mt-2 mb-7 text-muted-foreground">Use the same account you use in the Sodia app.</p>
          {params.error === "link_expired" && (
            <div className="mb-5">
              <Notice tone="danger" role="alert">
                That sign-in link has expired. Request a new one below.
              </Notice>
            </div>
          )}
          {params.error === "oauth_failed" && (
            <div className="mb-5">
              <Notice tone="danger" role="alert">
                Sign-in with Google didn&apos;t complete. Please try again.
              </Notice>
            </div>
          )}
          <LoginForm next={params.next ?? "/"} />
        </div>
      </section>
    </main>
  );
}
