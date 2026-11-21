import Link from "next/link";
import { BellOff, FileSpreadsheet, SearchX, Users } from "lucide-react";
import { MEMBER_STANDINGS, WORKSPACES, describeStanding, type MemberStanding } from "sodia-core";
import { Badge } from "../../../components/ui/badge";
import { Button, buttonClasses } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input, Label, Select } from "../../../components/ui/input";
import { EmptyState, PageHeader, StatCard } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { canManageFacility, requireSection } from "../../../lib/active-facility";
import { loadJoinCode } from "../../../lib/data/join-code";
import { loadMembers, type MemberRow } from "../../../lib/data/members";
import { loadPeople, type MemberExtras, type OtherPerson } from "../../../lib/data/people";
import { formatDate, formatDateTime } from "../../../lib/format";
import { removeImportedMember } from "../../actions/imports";
import { ActionButton } from "../../../components/ui/action-button";
import { AddContactForm } from "./AddContactForm";
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

const OTHER_FILTERS = ["NOT_ON_APP", "GUEST"] as const;
type OtherFilter = (typeof OTHER_FILTERS)[number];

/** What else a person has done here: events, court bookings, a plan carried over from a spreadsheet. */
function activityLine(extras: MemberExtras): string | null {
  const parts = [
    extras.eventsCount > 0 ? `${extras.eventsCount} ${extras.eventsCount === 1 ? "event" : "events"}` : null,
    extras.bookingsCount > 0 ? `${extras.bookingsCount} ${extras.bookingsCount === 1 ? "booking" : "bookings"}` : null,
    extras.nextBookingAt ? `next ${formatDateTime(extras.nextBookingAt)}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function recordLine(person: Pick<OtherPerson, "planName" | "planExpiresOn">): string | null {
  if (!person.planName && !person.planExpiresOn) return null;
  return [
    person.planName ? `${person.planName} on your old list` : "On your old list",
    person.planExpiresOn ? `until ${formatDate(`${person.planExpiresOn}T00:00:00+08:00`)}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; standing?: string }>;
}) {
  const { active } = await requireSection("members");
  const params = await searchParams;
  const otherFilter: OtherFilter | null = OTHER_FILTERS.find((f) => f === params.standing) ?? null;
  const standing = MEMBER_STANDINGS.find((s) => s === params.standing) ?? "ALL";
  const [{ members: matchedMembers, total: memberTotal, counts }, joinCode, people] = await Promise.all([
    loadMembers(active.id, { query: params.q, standing }),
    loadJoinCode(active.id),
    loadPeople(active.id),
  ]);
  // One list: members, then everyone else the business knows (records without an account, and
  // app users who signed up to an event or hold a booking without being members).
  const needle = params.q?.trim().toLowerCase().replace(/^@/, "") ?? "";
  const others = people.others.filter(
    (person) =>
      (standing === "ALL" || otherFilter !== null) &&
      (otherFilter === null || (otherFilter === "NOT_ON_APP" ? !person.onApp : person.onApp)) &&
      (!needle ||
        [person.name, person.handle, person.email, person.phone].some((value) =>
          value?.toLowerCase().includes(needle),
        )),
  );
  const members = otherFilter ? [] : matchedMembers;
  const total = memberTotal + people.others.length;
  const notOnApp = people.others.filter((person) => !person.onApp).length;
  const guests = people.others.length - notOnApp;
  const usesPasses = active.registryType === "COMMERCIAL";
  const canManage = canManageFacility(active.role);
  const workspace = WORKSPACES[active.kind];
  const noun = workspace.people.many;
  const filtered = Boolean(params.q) || standing !== "ALL" || otherFilter !== null;
  const shown = members.length + others.length;
  const filterOptions: MemberStanding[] = usesPasses
    ? ["ACTIVE", "LAPSED", "NO_PASS", "CANCELLED"]
    : ["ACTIVE", "CANCELLED"];

  return (
    <>
      <PageHeader
        title={noun.charAt(0).toUpperCase() + noun.slice(1)}
        description={
          usesPasses
            ? `Everyone connected to your ${workspace.noun}. Active means they hold a valid pass today.`
            : active.kind === "ORGANIZER"
              ? "Everyone who follows your events. They join by scanning your code in the Sodia app."
              : `Everyone who belongs to your ${workspace.noun}.`
        }
        actions={
          <Link href="/members/import" className={buttonClasses("secondary")}>
            <FileSpreadsheet size={16} aria-hidden />
            Import from a spreadsheet
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active"
          value={String(counts.ACTIVE)}
          hint={usesPasses ? "Hold a valid pass" : `Current ${noun}`}
        />
        {usesPasses && (
          <StatCard label="Lapsed" value={String(counts.LAPSED)} hint="Pass ended; worth a win-back message" />
        )}
        {usesPasses && (
          <StatCard label="No pass yet" value={String(counts.NO_PASS)} hint="On your list, can't check in" />
        )}
        <StatCard label="Cancelled" value={String(counts.CANCELLED)} />
        {notOnApp > 0 && (
          <StatCard label="Not on the app" value={String(notOnApp)} hint="Records and walk-ins without an account" />
        )}
        {guests > 0 && <StatCard label="Guests" value={String(guests)} hint="Signed up or booked, not a member" />}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <AddMemberForm />
            <div className="mt-2 border-t border-border pt-5">
              <AddContactForm />
            </div>
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
              <Select name="standing" defaultValue={otherFilter ?? standing}>
                <option value="ALL">All</option>
                {filterOptions.map((option) => (
                  <option key={option} value={option}>
                    {describeStanding(option).label}
                  </option>
                ))}
                {notOnApp > 0 && <option value="NOT_ON_APP">Not on the app</option>}
                {guests > 0 && <option value="GUEST">Guests</option>}
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
        ) : shown === 0 ? (
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
                <Th>Activity</Th>
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
                const extras = people.memberExtras.get(member.userId);
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
                    <Td>
                      {usesPasses && (
                        <p>
                          {member.lastVisitAt ? `Checked in ${formatDateTime(member.lastVisitAt)}` : "No check-in yet"}
                        </p>
                      )}
                      {extras && activityLine(extras) && (
                        <p className="text-muted-foreground">{activityLine(extras)}</p>
                      )}
                      {extras && recordLine(extras) && <p className="text-muted-foreground">{recordLine(extras)}</p>}
                      {!usesPasses && !(extras && (activityLine(extras) || recordLine(extras))) && "—"}
                    </Td>
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
              {others.map((person) => (
                <tr key={person.key}>
                  <Td>
                    <p className="font-semibold">{person.name}</p>
                    <p className="text-muted-foreground">
                      {[person.handle, person.phone, person.email].filter(Boolean).join(" · ") || "No contact details"}
                    </p>
                  </Td>
                  <Td>
                    <Badge>{person.onApp ? "Guest" : "Not on the app"}</Badge>
                  </Td>
                  <Td>
                    {recordLine(person) ??
                      (person.onApp
                        ? "Not a member"
                        : person.email
                          ? "Matched when they join with this email"
                          : "Add an email to match them later")}
                  </Td>
                  <Td>{activityLine(person) ?? "—"}</Td>
                  {canManage && (
                    <Td>
                      {person.contactId && !person.onApp && (
                        <div className="flex justify-end">
                          <ActionButton
                            action={removeImportedMember.bind(null, person.contactId)}
                            pendingLabel="Removing…"
                            variant="ghost"
                            aria-label={`Remove ${person.name}`}
                            confirm={{ question: "Remove this record?", yes: "Yes, remove" }}
                          >
                            Remove
                          </ActionButton>
                        </div>
                      )}
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      {filtered && shown > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Showing {shown} of {total}.{" "}
          <Link href="/members" className="font-semibold underline">
            Clear search
          </Link>
        </p>
      )}
    </>
  );
}
