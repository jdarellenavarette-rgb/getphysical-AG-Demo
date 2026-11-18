import { InboxView } from "../../../components/inbox/InboxView";
import { PageHeader } from "../../../components/ui/states";
import { requireSection } from "../../../lib/active-facility";

export const metadata = { title: "Inbox" };

const AUDIENCES = ["ALL", "ACTIVE", "LAPSED"] as const;

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ compose?: string }> }) {
  const { active } = await requireSection("inbox");
  const { compose } = await searchParams;
  const initialAudience = AUDIENCES.find((a) => a === compose);
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
        initialAudience={initialAudience}
        suiteMode={active.registryType === "COMMUNITY" ? "CLUBDASH" : "GYMDASH"}
      />
    </>
  );
}
