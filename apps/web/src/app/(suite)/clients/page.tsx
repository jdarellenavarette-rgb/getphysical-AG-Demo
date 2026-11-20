import { BellRing, ClipboardList, UserPlus } from "lucide-react";
import { ActionButton } from "../../../components/ui/action-button";
import { ActionForm } from "../../../components/ui/action-form";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input, Label } from "../../../components/ui/input";
import { QrCode } from "../../../components/ui/qr";
import { EmptyState, Notice, PageHeader, StatCard } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { requireSection } from "../../../lib/active-facility";
import { FREE_CLIENT_CAP, loadCoachDesk, NUDGE_AFTER_DAYS, type CoachClient } from "../../../lib/data/coach";
import { loadQrCode } from "../../../lib/data/join-code";
import { formatDate } from "../../../lib/format";
import { acceptClient, endClientLink, inviteClient } from "../../actions/coach";

export const metadata = { title: "Clients" };

function lastTrained(client: CoachClient): string {
  if (client.status !== "ACTIVE") return "—";
  if (client.daysSinceWorkout === null) return "Nothing logged yet";
  if (client.daysSinceWorkout === 0) return "Today";
  if (client.daysSinceWorkout === 1) return "Yesterday";
  return `${client.daysSinceWorkout} days ago`;
}

function endLabel(client: CoachClient): string {
  if (client.status === "ACTIVE") return "Stop coaching";
  return client.awaiting === "COACH" ? "Decline" : "Withdraw";
}

function StatusBadge({ client }: { client: CoachClient }) {
  if (client.status === "ACTIVE") {
    return client.needsNudge ? <Badge tone="warning">Needs a nudge</Badge> : <Badge tone="success">On track</Badge>;
  }
  if (client.status === "PENDING") {
    return <Badge>{client.awaiting === "COACH" ? "Asked to join" : "Invited"}</Badge>;
  }
  return <Badge tone="danger">Ended</Badge>;
}

export default async function ClientsPage() {
  const session = await requireSection("clients");
  const [desk, code] = await Promise.all([loadCoachDesk(session.userId, session.active), loadQrCode("COACH", null)]);
  const current = desk.clients.filter((c) => c.status !== "CANCELLED");
  const nudges = desk.clients.filter((c) => c.needsNudge);
  const waiting = desk.clients.filter((c) => c.isMine && c.status === "PENDING");
  const hasTeam = desk.clients.some((c) => !c.isMine);
  const atCap = desk.plan === "FREE" && desk.activeCount >= FREE_CLIENT_CAP;

  return (
    <>
      <PageHeader
        title="Clients"
        description="The people you coach and how recently each one trained. You see a client's lift and move logs once they accept."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active clients"
          value={desk.plan === "FREE" ? `${desk.activeCount} of ${FREE_CLIENT_CAP}` : String(desk.activeCount)}
          hint={desk.plan === "FREE" ? "Free plan" : "Pro plan"}
        />
        <StatCard
          label="Need a nudge"
          value={String(nudges.length)}
          hint={`No workout logged for ${NUDGE_AFTER_DAYS} days or more`}
        />
        <StatCard label="Waiting" value={String(waiting.length)} hint="Invitations and requests not yet accepted" />
      </div>

      {atCap && (
        <div className="mb-6">
          <Notice tone="warning" role="note">
            You have {FREE_CLIENT_CAP} active clients, the most the free plan covers. New invitations can be sent, but a
            fourth client can&apos;t be accepted until you move to Pro or end one.
          </Notice>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Check in on today</CardTitle>
          </CardHeader>
          <CardContent>
            {nudges.length === 0 ? (
              <EmptyState
                icon={BellRing}
                title="All clear"
                description={
                  desk.activeCount === 0
                    ? "Once clients accept, anyone who goes quiet for three days shows up here."
                    : "Every active client has logged a workout in the last three days."
                }
              />
            ) : (
              <ul className="grid gap-3">
                {nudges.map((client) => (
                  <li
                    key={client.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.daysSinceWorkout === null
                          ? "Has not logged a workout yet"
                          : `Last trained ${client.daysSinceWorkout} days ago`}{" "}
                        · {client.workouts28d} in the last 4 weeks
                      </p>
                    </div>
                    <Badge tone="warning">Check in</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Add a client</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <ActionForm
              action={inviteClient}
              submitLabel="Send invitation"
              pendingLabel="Sending…"
              icon={<UserPlus size={16} aria-hidden />}
            >
              <Label className="min-w-48 flex-1">
                Client&apos;s Sodia username
                <Input name="username" placeholder="@username" autoComplete="off" autoCapitalize="none" required />
              </Label>
            </ActionForm>
            {code ? (
              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5">
                <QrCode modules={code.modules} label="Your coach code" />
                <p className="max-w-52 text-sm text-muted-foreground">
                  Or have them scan your coach code in the Sodia app. Their request appears below for you to accept.
                </p>
              </div>
            ) : (
              <p className="border-t border-border pt-5 text-sm text-muted-foreground">
                A scannable coach code appears here once your account is approved as a coach.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your list</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {current.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No clients yet"
              description="Invite your first client by username. They accept in the Sodia app and appear here."
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Client</Th>
                  <Th>Status</Th>
                  <Th>Last trained</Th>
                  <Th className="text-right">This week</Th>
                  <Th className="text-right">4 weeks</Th>
                  <Th>Since</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {current.map((client) => (
                  <tr key={client.id}>
                    <Td>
                      <p className="font-semibold">{client.name}</p>
                      {client.username && <p className="text-sm text-muted-foreground">@{client.username}</p>}
                      {client.coachName && (
                        <p className="text-sm text-muted-foreground">Coached by {client.coachName}</p>
                      )}
                    </Td>
                    <Td>{client.isMine ? <StatusBadge client={client} /> : <Badge>Team client</Badge>}</Td>
                    <Td>{client.isMine ? lastTrained(client) : "—"}</Td>
                    <Td className="text-right tabular-nums">
                      {client.isMine && client.status === "ACTIVE" ? client.workouts7d : "—"}
                    </Td>
                    <Td className="text-right tabular-nums">
                      {client.isMine && client.status === "ACTIVE" ? client.workouts28d : "—"}
                    </Td>
                    <Td>{formatDate(client.since)}</Td>
                    <Td className="text-right">
                      <span className={client.isMine ? "inline-flex flex-wrap justify-end gap-2" : "hidden"}>
                        {client.awaiting === "COACH" && (
                          <ActionButton
                            action={acceptClient.bind(null, client.id)}
                            pendingLabel="Accepting…"
                            variant="primary"
                          >
                            Accept
                          </ActionButton>
                        )}
                        <ActionButton
                          action={endClientLink.bind(null, client.id)}
                          pendingLabel="Removing…"
                          variant="ghost"
                          aria-label={`${endLabel(client)} ${client.name}`}
                          confirm={{ question: `${endLabel(client)} ${client.name}?`, yes: "Yes, remove" }}
                        >
                          {endLabel(client)}
                        </ActionButton>
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
      <p className="mt-4 text-sm text-muted-foreground">
        {hasTeam &&
          "You see who your teammates coach, but a client's training is visible only to the coach they agreed to. "}
        Clients are flagged from the workouts they log. Comparing against a planned programme needs training plans,
        which are not in the suite yet.
      </p>
    </>
  );
}
