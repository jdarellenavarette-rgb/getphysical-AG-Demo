import Link from "next/link";
import { BellRing, UserPlus } from "lucide-react";
import { acceptClient } from "../../app/actions/coach";
import type { ActiveSuiteSession } from "../../lib/active-facility";
import { FREE_CLIENT_CAP, loadCoachDesk, NUDGE_AFTER_DAYS } from "../../lib/data/coach";
import { loadSetupProgress } from "../../lib/data/setup";
import { SetupChecklist } from "../shell/SetupChecklist";
import { ActionButton } from "../ui/action-button";
import { Badge } from "../ui/badge";
import { buttonClasses } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState, StatCard } from "../ui/states";
import { HomeHeader, SeeAll } from "./shared";

/** CoachDash home: a coach's day is about individual people, so it opens on who needs them today. */
export async function CoachHome({ session }: { session: ActiveSuiteSession }) {
  const [desk, setup] = await Promise.all([
    loadCoachDesk(session.userId, session.active),
    loadSetupProgress(session.active.id, "COACH", session.userId),
  ]);
  const nudges = desk.clients.filter((c) => c.needsNudge);
  const requests = desk.clients.filter((c) => c.isMine && c.awaiting === "COACH");
  const invited = desk.clients.filter((c) => c.isMine && c.awaiting === "CLIENT");
  const onTrack = desk.activeCount - nudges.length;
  const trainedThisWeek = desk.clients.reduce((sum, c) => sum + c.workouts7d, 0);

  return (
    <>
      <HomeHeader
        name={session.displayName}
        line={
          desk.activeCount === 0
            ? "Invite your first client to start following their training."
            : nudges.length === 0
              ? "Everyone you coach has trained in the last three days."
              : `${nudges.length} of your ${desk.activeCount} clients ${nudges.length === 1 ? "has" : "have"} gone quiet.`
        }
        action={
          <Link href="/clients" className={buttonClasses("primary")}>
            <UserPlus size={16} aria-hidden />
            Invite a client
          </Link>
        }
      />
      {!setup.complete && <SetupChecklist progress={setup} venueName={session.active.name} audience="clients" />}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active clients"
          value={desk.plan === "FREE" ? `${desk.activeCount} of ${FREE_CLIENT_CAP}` : String(desk.activeCount)}
          hint={desk.plan === "FREE" ? "Free plan" : "Pro plan"}
        />
        <StatCard label="On track" value={String(Math.max(onTrack, 0))} hint="Trained in the last 3 days" />
        <StatCard
          label="Need a nudge"
          value={String(nudges.length)}
          hint={`Quiet for ${NUDGE_AFTER_DAYS} days or more`}
        />
        <StatCard label="Workouts this week" value={String(trainedThisWeek)} hint="Logged by your clients" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Check in on today</CardTitle>
            <SeeAll href="/clients">All clients</SeeAll>
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
            <CardTitle>Waiting on a reply</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length + invited.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests or invitations are waiting.</p>
            ) : (
              <ul className="grid gap-3">
                {requests.map((client) => (
                  <li key={client.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{client.name}</span>
                      <span className="block text-sm text-muted-foreground">Asked to be coached by you</span>
                    </span>
                    <ActionButton
                      action={acceptClient.bind(null, client.id)}
                      pendingLabel="Accepting…"
                      variant="primary"
                    >
                      Accept
                    </ActionButton>
                  </li>
                ))}
                {invited.map((client) => (
                  <li key={client.id}>
                    <span className="block truncate font-semibold">{client.name}</span>
                    <span className="block text-sm text-muted-foreground">Invited; waiting for them to accept</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
