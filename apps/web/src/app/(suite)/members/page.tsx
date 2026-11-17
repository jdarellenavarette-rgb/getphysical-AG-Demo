import Link from "next/link";
import { SearchX, Users } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button, buttonClasses } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input, Label, Select } from "../../../components/ui/input";
import { EmptyState, PageHeader } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { requireSuiteSession } from "../../../lib/active-facility";
import { loadMembers, type MembershipStatus } from "../../../lib/data/members";
import { formatDate, formatDateTime } from "../../../lib/format";
import { setMemberStatus } from "../../actions/members";
import { AddMemberForm } from "./AddMemberForm";

export const metadata = { title: "Members" };

const STATUS_LABELS: Record<MembershipStatus, string> = {
  ACTIVE: "Active",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
};
const STATUS_TONES = { ACTIVE: "success", CANCELLED: "neutral", PENDING: "warning" } as const;
const SOURCE_LABELS: Record<string, string> = {
  STAFF_ADDED: "Added by staff",
  JOIN: "Joined in the app",
  PURCHASE: "Bought a pass",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { active } = await requireSuiteSession();
  const params = await searchParams;
  const status =
    params.status === "ACTIVE" || params.status === "CANCELLED" || params.status === "PENDING" ? params.status : "ALL";
  const { members, total, activeCount } = await loadMembers(active.id, { query: params.q, status });
  const filtered = Boolean(params.q) || status !== "ALL";

  return (
    <>
      <PageHeader title="Members" description={`${activeCount} active · ${total} in total at ${active.name}`} />

      <Card className="mb-6">
        <CardContent>
          <AddMemberForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="border-b border-border">
          <form method="get" className="flex flex-wrap items-end gap-3">
            <Label className="min-w-56 flex-1">
              Search by name or username
              <Input name="q" type="search" defaultValue={params.q ?? ""} />
            </Label>
            <Label>
              Status
              <Select name="status" defaultValue={status}>
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </Label>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>

        {total === 0 ? (
          <EmptyState
            icon={Users}
            title="No members yet"
            description="Add your first member above with their Sodia username. Members who buy a pass in the app appear here too."
          />
        ) : members.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No members match"
            description="Try a different name or status."
            action={
              <Link href="/members" className={buttonClasses("secondary", "sm")}>
                Clear search
              </Link>
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Member</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th>Last check-in</Th>
                <Th>
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId}>
                  <Td>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-muted-foreground">
                      {member.handle ?? "No username"} · {SOURCE_LABELS[member.source] ?? "Member"}
                    </p>
                  </Td>
                  <Td>
                    <Badge tone={STATUS_TONES[member.status]}>{STATUS_LABELS[member.status]}</Badge>
                  </Td>
                  <Td>{formatDate(member.joinedAt)}</Td>
                  <Td>{member.lastVisitAt ? formatDateTime(member.lastVisitAt) : "Never"}</Td>
                  <Td className="text-right">
                    <form
                      action={setMemberStatus.bind(
                        null,
                        member.userId,
                        member.status === "ACTIVE" ? "CANCELLED" : "ACTIVE",
                      )}
                    >
                      <Button type="submit" size="sm" variant={member.status === "ACTIVE" ? "danger" : "secondary"}>
                        {member.status === "ACTIVE" ? "Cancel membership" : "Reactivate"}
                      </Button>
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      {filtered && members.length > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Showing {members.length} of {total}.{" "}
          <Link href="/members" className="font-semibold underline">
            Clear search
          </Link>
        </p>
      )}
    </>
  );
}
