import { Banknote, DoorClosed, DoorOpen } from "lucide-react";
import { ActionForm } from "../../../components/ui/action-form";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input, Label } from "../../../components/ui/input";
import { EmptyState, PageHeader, StatCard } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { canManageFacility, requireSection } from "../../../lib/active-facility";
import { loadTill, TILL_TOLERANCE_PHP } from "../../../lib/data/till";
import { formatDateTime, formatPeso } from "../../../lib/format";
import { closeShift, openShift } from "../../actions/till";

export const metadata = { title: "Till" };

export default async function TillPage() {
  const session = await requireSection("till");
  const canManage = canManageFacility(session.active.role);
  const till = await loadTill(session.active.id, session.userId);
  const shift = till.open;

  return (
    <>
      <PageHeader
        title="Till"
        description="Your shift at the desk. Open it with the cash in the drawer, record payments where you take them, and count the drawer when you finish."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="self-start lg:col-span-2">
          <CardHeader>
            <CardTitle>{shift ? "Your shift" : "No shift open"}</CardTitle>
            {shift ? <Badge tone="success">Open since {formatDateTime(shift.openedAt)}</Badge> : <Badge>Closed</Badge>}
          </CardHeader>
          <CardContent className="grid gap-5">
            {shift ? (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Opening float" value={formatPeso(shift.float)} />
                  <StatCard
                    label="Cash payments"
                    value={String(shift.cashPayments)}
                    hint="The total is shown after you count"
                  />
                  <StatCard
                    label="Other payments"
                    value={formatPeso(shift.otherTotal)}
                    hint={`${shift.otherPayments} by e-wallet, card or transfer`}
                  />
                </div>
                <ActionForm
                  action={closeShift.bind(null, shift.id)}
                  submitLabel="Close shift"
                  pendingLabel="Closing…"
                  icon={<DoorClosed size={16} aria-hidden />}
                >
                  <Label className="min-w-44 flex-1">
                    Cash counted in the drawer (₱)
                    <Input name="counted" type="number" min={0} step="any" inputMode="decimal" required />
                  </Label>
                  <Label className="min-w-56 flex-[2]">
                    Note (optional)
                    <Input name="note" maxLength={300} placeholder="Anything the owner should know" />
                  </Label>
                </ActionForm>
                <p className="text-sm text-muted-foreground">
                  Count everything in the drawer, including the float. The expected amount is shown only after you enter
                  your count.
                </p>
              </>
            ) : (
              <>
                <ActionForm
                  action={openShift}
                  submitLabel="Open shift"
                  pendingLabel="Opening…"
                  icon={<DoorOpen size={16} aria-hidden />}
                >
                  <Label className="min-w-56 flex-1">
                    Cash in the drawer now (₱)
                    <Input name="float" type="number" min={0} step="any" inputMode="decimal" required />
                  </Label>
                </ActionForm>
                <p className="text-sm text-muted-foreground">
                  While your shift is open, every payment you record anywhere in the suite is added to it.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Open</span> with the float: the cash already in the
              drawer.
            </p>
            <p>
              <span className="font-semibold text-foreground">Record payments</span> where you see the person: on a
              booking, a class, an event entry or a session pack.
            </p>
            <p>
              <span className="font-semibold text-foreground">Close</span> by counting the drawer. The suite compares
              your count with the float plus the cash you recorded.
            </p>
            <p>Payments can&apos;t be edited. An owner or admin reverses a mistake under Sales.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{canManage ? "Closed shifts" : "Your closed shifts"}</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {till.closed.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title="No closed shifts yet"
              description="Each closed shift is listed here with what was expected, what was counted and the difference."
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  {canManage && <Th>Who</Th>}
                  <Th>Opened</Th>
                  <Th>Closed</Th>
                  <Th className="text-right">Float</Th>
                  <Th className="text-right">Expected</Th>
                  <Th className="text-right">Counted</Th>
                  <Th>Result</Th>
                </tr>
              </thead>
              <tbody>
                {till.closed.map((closed) => (
                  <tr key={closed.id}>
                    {canManage && <Td className="font-semibold">{closed.openedBy}</Td>}
                    <Td className="whitespace-nowrap">{formatDateTime(closed.openedAt)}</Td>
                    <Td className="whitespace-nowrap">{formatDateTime(closed.closedAt)}</Td>
                    <Td className="text-right tabular-nums">{formatPeso(closed.float)}</Td>
                    <Td className="text-right tabular-nums">{formatPeso(closed.expected)}</Td>
                    <Td className="text-right tabular-nums">{formatPeso(closed.counted)}</Td>
                    <Td>
                      {Math.abs(closed.difference) <= TILL_TOLERANCE_PHP ? (
                        <Badge tone="success">{closed.difference === 0 ? "Balanced" : "Within tolerance"}</Badge>
                      ) : (
                        <Badge tone="danger">
                          {closed.difference > 0 ? "Over" : "Short"} {formatPeso(Math.abs(closed.difference))}
                        </Badge>
                      )}
                      {closed.note && <p className="mt-1 text-sm text-muted-foreground">{closed.note}</p>}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
