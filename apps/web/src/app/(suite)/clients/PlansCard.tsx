import { CalendarCheck, CalendarPlus, ClipboardCheck } from "lucide-react";
import { ActionButton } from "../../../components/ui/action-button";
import { ActionForm } from "../../../components/ui/action-form";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input, Label, Select } from "../../../components/ui/input";
import { EmptyState } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import type { CoachClient } from "../../../lib/data/coach";
import type { CoachPack, UpcomingSession } from "../../../lib/data/coach-packs";
import { WEEKDAYS, type CoachPlan } from "../../../lib/data/coach-plans";
import { formatDateTime } from "../../../lib/format";
import { cancelSession, endPlan, savePlan, scheduleSession } from "../../actions/coach";

// The form lists the week from Monday; weekday numbers stay 0 = Sunday.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

interface PlansCardProps {
  plans: CoachPlan[];
  /** The coach's own active and pending clients, with what they logged this week. */
  clients: CoachClient[];
}

/** What each client was asked to do in a week, next to what they logged. */
export function PlansCard({ plans, clients }: PlansCardProps) {
  const clientOf = new Map(clients.map((client) => [client.id, client]));
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Training plans</CardTitle>
        <Badge>{plans.length} current</Badge>
      </CardHeader>
      <CardContent className="grid gap-5">
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add a client first; then you can set their training week.</p>
        ) : (
          <ActionForm
            action={savePlan}
            submitLabel="Save plan"
            pendingLabel="Saving…"
            icon={<ClipboardCheck size={16} aria-hidden />}
            className="grid gap-4 [&>button]:justify-self-start"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Label>
                Client
                <Select name="clientId" required defaultValue={clients[0]?.id}>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
              </Label>
              <Label>
                Plan name
                <Input name="title" required maxLength={80} placeholder="Strength base, 4 days" />
              </Label>
            </div>
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium">Training days, and what each one is for</legend>
              {WEEK_ORDER.map((weekday) => (
                <div key={weekday} className="flex flex-wrap items-center gap-3">
                  <label className="flex h-11 w-36 items-center gap-2 text-sm font-medium">
                    <input type="checkbox" name={`day${weekday}`} className="size-5 accent-primary" />
                    {WEEKDAYS[weekday]}
                  </label>
                  <Input
                    name={`focus${weekday}`}
                    maxLength={80}
                    aria-label={`Focus for ${WEEKDAYS[weekday]}`}
                    placeholder="Lower body, intervals, mobility…"
                    className="min-w-48 flex-1"
                  />
                </div>
              ))}
            </fieldset>
          </ActionForm>
        )}
        <p className="text-sm text-muted-foreground">
          A client follows one plan at a time. Saving a new plan for someone replaces their current one.
        </p>
      </CardContent>
      {plans.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No plans yet"
          description="Set a client's training week and this shows how many of the planned days they logged."
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Client</Th>
              <Th>Plan</Th>
              <Th>The week</Th>
              <Th>Last 7 days</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const client = clientOf.get(plan.clientId);
              const done = client?.workouts7d ?? 0;
              const planned = plan.days.length;
              return (
                <tr key={plan.id}>
                  <Td className="font-semibold">{client?.name ?? "Former client"}</Td>
                  <Td>{plan.title}</Td>
                  <Td>
                    <ul className="grid gap-0.5 text-sm">
                      {plan.days.map((day) => (
                        <li key={day.weekday}>
                          <span className="font-medium">{WEEKDAYS[day.weekday]}</span>
                          {day.focus && <span className="text-muted-foreground"> · {day.focus}</span>}
                        </li>
                      ))}
                    </ul>
                  </Td>
                  <Td>
                    {client?.status === "ACTIVE" ? (
                      <Badge tone={done >= planned ? "success" : done === 0 ? "danger" : "warning"}>
                        {Math.min(done, planned)} of {planned} logged
                      </Badge>
                    ) : (
                      <Badge>Not accepted yet</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <ActionButton
                      action={endPlan.bind(null, plan.id)}
                      pendingLabel="Ending…"
                      variant="ghost"
                      aria-label={`End ${plan.title} for ${client?.name ?? "this client"}`}
                      confirm={{ question: `End ${plan.title}?`, yes: "Yes, end it" }}
                    >
                      End plan
                    </ActionButton>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

interface SessionsCardProps {
  upcoming: UpcomingSession[];
  /** Packs with sessions left; a booked session comes out of one. */
  packs: CoachPack[];
  nameOf: Map<string, string>;
}

/** The coach's calendar: sessions booked ahead, each already counted against its pack. */
export function SessionsCard({ upcoming, packs, nameOf }: SessionsCardProps) {
  const open = packs.filter((pack) => pack.left > 0);
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Upcoming sessions</CardTitle>
        <Badge>{upcoming.length} booked</Badge>
      </CardHeader>
      <CardContent className="grid gap-5">
        {open.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sessions are booked out of a pack. Create a pack with sessions left to book one.
          </p>
        ) : (
          <ActionForm
            action={scheduleSession}
            submitLabel="Book session"
            pendingLabel="Booking…"
            icon={<CalendarPlus size={16} aria-hidden />}
          >
            <Label className="min-w-56 flex-1">
              Client and pack
              <Select name="packId" required defaultValue={open[0]?.id}>
                {open.map((pack) => (
                  <option key={pack.id} value={pack.id}>
                    {nameOf.get(pack.clientId) ?? "Client"}: {pack.name} ({pack.left} left)
                  </option>
                ))}
              </Select>
            </Label>
            <Label className="w-44">
              Date
              <Input name="date" type="date" required />
            </Label>
            <Label className="w-32">
              Time
              <Input name="time" type="time" required />
            </Label>
            <Label className="min-w-48 flex-1">
              Note (optional)
              <Input name="note" maxLength={300} placeholder="Where, or what to bring" />
            </Label>
          </ActionForm>
        )}
        {upcoming.length > 0 && (
          <ul className="grid gap-3">
            {upcoming.map((session) => (
              <li
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {formatDateTime(session.at)} · {nameOf.get(session.clientId) ?? "Client"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.packName}
                    {session.note ? ` · ${session.note}` : ""}
                  </p>
                </div>
                <ActionButton
                  action={cancelSession.bind(null, session.id)}
                  pendingLabel="Cancelling…"
                  variant="ghost"
                  aria-label={`Cancel the session on ${formatDateTime(session.at)}`}
                  confirm={{ question: "Cancel this session?", yes: "Yes, cancel it" }}
                >
                  Cancel
                </ActionButton>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
