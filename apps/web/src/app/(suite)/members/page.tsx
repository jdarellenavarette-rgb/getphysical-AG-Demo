import Link from "next/link";
import { BellOff, SearchX, Users } from "lucide-react";
import { MEMBER_STANDINGS, describeStanding, type MemberStanding } from "sodia-core";
import { Badge } from "../../../components/ui/badge";
import { Button, buttonClasses } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input, Label, Select } from "../../../components/ui/input";
import { EmptyState, PageHeader, StatCard } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { canManageFacility, requireSuiteSession } from "../../../lib/active-facility";
import { loadJoinCode } from "../../../lib/data/join-code";
import { loadMembers, type MemberRow } from "../../../lib/data/members";
import { formatDate, formatDateTime } from "../../../lib/format";
import { AddMemberForm } from "./AddMemberForm";
import { JoinCodeCard } from "./JoinCodeCard";
import { MemberActions } from "./MemberActions";

export const metadata = { title: "Members" };

const SOURCE_LABELS: Record<string, string> = {
  STAFF_ADDED: "Added by staff",
  JOIN: "Joined in the app",
  PURCHASE: "Bought a pass",
};

function accessLine(member: MemberRow, usesPasses: boolean): string {
  if (member.standing === "CANCELLED") return "—";
  if (member.passValidUntil) return `Pass until ${formatDate(member.passValidUntil)}`;
  if (!usesPasses) return "No pass needed";
  if (member.lastPassEndedAt) return `Pass ended ${formatDate(member.lastPassEndedAt)}`;
  return "No pass yet";
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; standing?: string }>;
}) {
  const { active } = await requireSuiteSession();
  const params = await searchParams;
  const standing = MEMBER_STANDINGS.find((s) => s === params.standing) ?? "ALL";
  const [{ members, total, counts }, joinCode] = await Promise.all([
    loadMembers(active.id, { query: params.q, standing }),
    loadJoinCode(active.id),
  ]);
  const usesPasses = active.registryType === "COMMERCIAL";
  const canManage = canManageFacility(active.role);
  const filtered = Boolean(params.q) || standing !== "ALL";
  const filterOptions: MemberStanding[] = usesPasses
    ? ["ACTIVE", "LAPSED", "NO_PASS", "CANCELLED"]
    : ["ACTIVE", "CANCELLED"];

  return (
    <>
      <PageHeader
        title="Members"
        description={
          usesPasses
            ? "Everyone connected to your gym. Active means they hold a valid pass today."
            : "Everyone who belongs to your club."
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active"
          value={String(counts.ACTIVE)}
          hint={usesPasses ? "Hold a valid pass" : "Current members"}
        />
        {usesPasses && (
          <StatCard label="Lapsed" value={String(counts.LAPSED)} hint="Pass ended; worth a win-back message" />
        )}
        {usesPasses && (
          <StatCard label="No pass yet" value={String(counts.NO_PASS)} hint="On your list, can't check in" />
        )}
        <StatCard label="Cancelled" value={String(counts.CANCELLED)} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <AddMemberForm />
          </CardContent>
        </Card>
        {joinCode && <JoinCodeCard code={joinCode} isClub={!usesPasses} venueName={active.name} />}
      </div>

      <Card>
        <CardContent className="border-b border-border">
          <form method="get" className="flex flex-wrap items-end gap-3">
            <Label className="min-w-56 flex-1">
              Search by name or username
              <Input name="q" type="search" defaultValue={params.q ?? ""} />
            </Label>
            <Label>
              Standing
              <Select name="standing" defaultValue={standing}>
                <option value="ALL">All</option>
                {filterOptions.map((option) => (
                  <option key={option} value={option}>
                    {describeStanding(option).label}
                  </option>
                ))}
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
            description={
              usesPasses
                ? "Add someone above by their Sodia username, or show the venue code. People who buy a pass in the app appear here automatically."
                : "Add someone above by their Sodia username, or show the join code for people to scan."
            }
          />
        ) : members.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No members match"
            description="Try a different name or standing."
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
                <Th>Standing</Th>
                <Th>Access</Th>
                <Th>Last check-in</Th>
                {canManage && (
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const label = describeStanding(member.standing);
                return (
                  <tr key={member.userId}>
                    <Td>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-muted-foreground">
                        {member.handle ?? "No username"} · {SOURCE_LABELS[member.source] ?? "Member"} · since{" "}
                        {formatDate(member.joinedAt)}
                      </p>
                    </Td>
                    <Td>
                      <Badge tone={label.tone}>{label.label}</Badge>
                      {member.broadcastsMuted && (
                        <span className="mt-1 flex items-center gap-1 text-muted-foreground">
                          <BellOff size={14} aria-hidden /> Muted broadcasts
                        </span>
                      )}
                    </Td>
                    <Td>{accessLine(member, usesPasses)}</Td>
                    <Td>{member.lastVisitAt ? formatDateTime(member.lastVisitAt) : "Never"}</Td>
                    {canManage && (
                      <Td>
                        <MemberActions
                          userId={member.userId}
                          memberName={member.name}
                          standing={member.standing}
                          usesPasses={usesPasses}
                        />
                      </Td>
                    )}
                  </tr>
                );
              })}
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
