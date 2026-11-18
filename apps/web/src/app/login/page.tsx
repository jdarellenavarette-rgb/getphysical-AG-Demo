import { redirect } from "next/navigation";
import { CalendarDays, ClipboardList, Dumbbell, Trophy } from "lucide-react";
import { BrandMark } from "../../components/shell/BrandMark";
import { Notice } from "../../components/ui/states";
import { createServerSupabase } from "../../lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

const WORKSPACES = [
  { icon: Dumbbell, title: "GymDash", text: "Members, check-in at the door, plans and sales." },
  { icon: CalendarDays, title: "Clubdash", text: "Courts, bookings, players and open play." },
  { icon: ClipboardList, title: "CoachDash", text: "Your clients and who needs a check-in today." },
  { icon: Trophy, title: "Organizer Pro", text: "Events, sign-ups and arrivals on the day." },
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
      <section className="relative hidden overflow-hidden bg-zinc-950 text-white lg:block">
        <div aria-hidden className="absolute -top-40 -right-40 size-[34rem] rounded-full bg-rose-600/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-rose-500/15 blur-3xl" />
        {/* One centred column with a capped width, so the panel reads the same on a laptop and an ultrawide. */}
        <div className="relative mx-auto flex h-full w-full max-w-2xl flex-col justify-between gap-12 px-12 py-12 xl:px-16 xl:py-14 min-[1800px]:max-w-3xl min-[1800px]:py-20 min-[2400px]:max-w-5xl min-[2400px]:py-24">
          <BrandMark size="lg" className="[&_.text-muted-foreground]:text-zinc-300" tagline />
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-rose-300 uppercase min-[1800px]:text-base">
              For gyms, clubs, coaches and organizers
            </p>
            <h2 className="font-display mt-4 text-5xl leading-[1.02] text-balance xl:text-6xl min-[1800px]:text-7xl min-[2400px]:text-8xl">
              Run your fitness business from one place.
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-7 xl:grid-cols-2 min-[1800px]:mt-14">
              {WORKSPACES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon size={22} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-base font-semibold min-[1800px]:text-lg min-[2400px]:text-xl">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-sm text-zinc-300 min-[1800px]:text-base min-[2400px]:text-lg">
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-zinc-400 min-[1800px]:text-base">
            Connected to the Sodia app your members, players and clients already use.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10" aria-labelledby="login-title">
        <div className="w-full max-w-sm min-[1800px]:max-w-md min-[2400px]:max-w-lg">
          <BrandMark size="lg" className="mb-10 lg:hidden" tagline />
          <h1 id="login-title" className="text-3xl min-[1800px]:text-4xl">
            Sign in
          </h1>
          <p className="mt-2 mb-7 text-muted-foreground min-[1800px]:text-lg">
            Use the same account you use in the Sodia app.
          </p>
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
