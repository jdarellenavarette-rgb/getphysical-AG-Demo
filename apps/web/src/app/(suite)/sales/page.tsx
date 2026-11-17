import { DailyDash } from "../../../components/daily-dash/DailyDash";
import { LegacyScreen } from "../../../components/suite/LegacyScreen";
import { SampleDataNotice } from "../../../components/suite/SampleDataNotice";
import { PageHeader } from "../../../components/ui/states";
import { requireSuiteSession } from "../../../lib/active-facility";

export const metadata = { title: "Front desk sales" };

export default async function SalesPage() {
  const { active } = await requireSuiteSession();
  return (
    <>
      <PageHeader title="Front desk sales" />
      <SampleDataNotice area="The till" facilityName={active.name} />
      <LegacyScreen facility={active}>
        <DailyDash />
      </LegacyScreen>
    </>
  );
}
