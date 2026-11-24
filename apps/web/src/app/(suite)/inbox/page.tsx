import Link from "next/link";
import { Zap } from "lucide-react";
import { buttonClasses } from "../../../components/ui/button";
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
        actions={
          <Link href="/inbox/automations" className={buttonClasses("secondary")}>
            <Zap size={16} aria-hidden />
            Automated messages
          </Link>
        }
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
