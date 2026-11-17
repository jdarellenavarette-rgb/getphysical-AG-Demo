import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { PageHeader } from "../../../components/ui/states";
import { canManageFacility, requireSuiteSession } from "../../../lib/active-facility";
import { loadVenueProfile } from "../../../lib/data/venue";
import { VenueProfileForm } from "./VenueProfileForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireSuiteSession();
  const facility = session.active;
  const venue = await loadVenueProfile(facility.id);
  const facts = [
    {
      label: "Type",
      value: facility.registryType === "COMMUNITY" ? "Community club (Clubdash)" : "Commercial gym (GymDash)",
    },
    { label: "Plan", value: facility.plan === "PRO" ? "Pro" : "Free" },
    { label: "Signed in as", value: session.email ?? session.displayName },
    { label: "Your role here", value: facility.role.charAt(0) + facility.role.slice(1).toLowerCase() },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Venue details shown to members in the Sodia app, and your account here."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Venue profile</CardTitle>
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
              Facility type and plan can&apos;t be changed here. Staff, payouts and photos aren&apos;t editable in the
              suite yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
