import { InboxView } from "../../../components/inbox/InboxView";
import { PageHeader } from "../../../components/ui/states";
import { requireSuiteSession } from "../../../lib/active-facility";

export const metadata = { title: "Inbox" };

export default async function InboxPage() {
  const { active } = await requireSuiteSession();
  return (
    <>
      <PageHeader
        title="Inbox"
        description="Conversations with members, and broadcasts to everyone or a chosen group."
      />
      <InboxView
        key={active.id}
        facilityId={active.id}
        facilityName={active.name}
        suiteMode={active.registryType === "COMMUNITY" ? "CLUBDASH" : "GYMDASH"}
      />
    </>
  );
}
