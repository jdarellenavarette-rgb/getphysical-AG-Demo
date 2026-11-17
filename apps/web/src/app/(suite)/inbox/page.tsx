import { AthleticInboxCRMView } from "../../../components/suite/AthleticInboxCRMView";
import { LegacyScreen } from "../../../components/suite/LegacyScreen";
import { PageHeader } from "../../../components/ui/states";
import { requireSuiteSession } from "../../../lib/active-facility";

export const metadata = { title: "Inbox" };

export default async function InboxPage() {
  const { active } = await requireSuiteSession();
  return (
    <>
      <PageHeader title="Inbox" description="Conversations with members, and broadcasts to everyone or a segment." />
      <LegacyScreen facility={active}>
        <AthleticInboxCRMView suiteMode={active.registryType === "COMMUNITY" ? "CLUBDASH" : "GYMDASH"} />
      </LegacyScreen>
    </>
  );
}
