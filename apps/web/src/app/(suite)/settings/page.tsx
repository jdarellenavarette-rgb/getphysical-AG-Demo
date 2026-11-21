import Link from "next/link";
import { WORKSPACES } from "sodia-core";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { PageHeader } from "../../../components/ui/states";
import { canManageFacility, requireSection } from "../../../lib/active-facility";
import { loadTeam } from "../../../lib/data/team";
import { loadVenueProfile } from "../../../lib/data/venue";
import { createServerSupabase } from "../../../lib/supabase/server";
import { DemoVenueButton } from "../../welcome/DemoVenueButton";
import { TeamCard } from "./TeamCard";
import { VenueProfileForm } from "./VenueProfileForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireSection("settings");
  const facility = session.active;
  const [venue, team, { data: mode }] = await Promise.all([
    loadVenueProfile(facility.id),
    loadTeam(facility.id),
    (await createServerSupabase()).rpc("payments_mode"),
  ]);
  const isDemo = facility.id.startsWith("demo_");
  const facts = [
    {
      label: "Type",
      value: `${WORKSPACES[facility.kind].product} · ${WORKSPACES[facility.kind].category}`,
    },
    { label: "Plan", value: facility.plan === "PRO" ? "Pro" : "Free" },
    { label: "Signed in as", value: session.email ?? session.displayName },
    { label: "Your role here", value: facility.role.charAt(0) + facility.role.slice(1).toLowerCase() },
  ];

  return (
    <>
      <PageHeader title="Settings" description="Your business details, your team, and your account here." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Business profile</CardTitle>
            </CardHeader>
            <CardContent>
              <VenueProfileForm
                key={facility.id}
                venue={venue}
                canEdit={canManageFacility(facility.role)}
                showCourtPrice={facility.registryType === "COMMUNITY"}
              />
            </CardContent>
          </Card>
          <TeamCard
            team={team}
            canManage={canManageFacility(facility.role)}
            isOwner={facility.role === "OWNER"}
            currentUserId={session.userId}
          />
        </div>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-muted-foreground">{fact.label}</dt>
                  <dd className="font-semibold">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">
              Business type and plan can&apos;t be changed here. Photos aren&apos;t editable in the suite yet.
            </p>
            <p className="mt-4 text-sm">
              <Link href="/welcome?new=1" className="font-semibold underline underline-offset-4">
                Open another business
              </Link>
              <span className="text-muted-foreground">
                {" "}
                — a second location, or a different kind of business. Each one has its own workspace.
              </span>
            </p>
            {mode === "sandbox" && !isDemo && (
              <div className="mt-5 border-t border-border pt-5">
                <p className="mb-3 text-sm text-muted-foreground">
                  Want to see the suite with data in it? Open a demo gym with sample members, check-ins and sales.
                </p>
                <DemoVenueButton label="Open a demo venue" />
              </div>
            )}
            {isDemo && (
              <p className="mt-5 border-t border-border pt-5 text-sm text-muted-foreground">
                This is a demo business. Everything in it is sample data, and payments run in test mode. Switch between
                the four demo workspaces at the top of the page.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
