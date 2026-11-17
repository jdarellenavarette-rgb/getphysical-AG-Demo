import { notFound } from "next/navigation";
import { SpatialCalendar } from "../../../components/clubdash/SpatialCalendar";
import { LegacyScreen } from "../../../components/suite/LegacyScreen";
import { SampleDataNotice } from "../../../components/suite/SampleDataNotice";
import { PageHeader } from "../../../components/ui/states";
import { requireSuiteSession } from "../../../lib/active-facility";

export const metadata = { title: "Court schedule" };

export default async function SchedulePage() {
  const { active } = await requireSuiteSession();
  // Court bookings only apply to community clubs.
  if (active.registryType !== "COMMUNITY") notFound();
  return (
    <>
      <PageHeader title="Court schedule" />
      <SampleDataNotice area="The court schedule" facilityName={active.name} />
      <LegacyScreen facility={active}>
        <SpatialCalendar />
      </LegacyScreen>
    </>
  );
}
