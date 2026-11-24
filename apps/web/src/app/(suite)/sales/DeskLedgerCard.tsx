import { Banknote } from "lucide-react";
import { ActionButton } from "../../../components/ui/action-button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { DESK_KIND_LABELS, DESK_METHOD_LABELS, type DeskLedger } from "../../../lib/data/desk";
import { formatDateTime, formatPeso } from "../../../lib/format";
import { reverseDeskPayment } from "../../actions/desk";

/** Money the business took itself, as it recorded it. Entries are never edited; a mistake is reversed. */
export function DeskLedgerCard({ ledger }: { ledger: DeskLedger }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Taken at the desk</CardTitle>
        <span className="text-sm text-muted-foreground">
          Last 30 days · <span className="font-semibold text-foreground">{formatPeso(ledger.total30d)}</span>
        </span>
      </CardHeader>
      {ledger.payments.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="Nothing recorded yet"
          description="When someone pays you in person for a booking, a class, a pack or an event, record it where you see them. It adds up here."
        />
      ) : (
        <>
          {ledger.byKind30d.length > 0 && (
            <CardContent className="flex flex-wrap gap-2 pb-0">
              {ledger.byKind30d.map((entry) => (
                <Badge key={entry.kind}>
                  {DESK_KIND_LABELS[entry.kind]}: {formatPeso(entry.total)}
                </Badge>
              ))}
            </CardContent>
          )}
          <div className="pt-3">
            <Table>
              <thead>
                <tr>
                  <Th>From</Th>
                  <Th>For</Th>
                  <Th>How</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>When</Th>
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {ledger.payments.map((payment) => (
                  <tr key={payment.id}>
                    <Td className="font-semibold">{payment.payerName ?? "—"}</Td>
                    <Td>
                      {DESK_KIND_LABELS[payment.kind]}
                      {payment.isReversal && <span className="text-muted-foreground"> · reversal</span>}
                    </Td>
                    <Td>{DESK_METHOD_LABELS[payment.method]}</Td>
                    <Td className="text-right tabular-nums">{formatPeso(payment.amount)}</Td>
                    <Td className="whitespace-nowrap">{formatDateTime(payment.createdAt)}</Td>
                    <Td className="text-right">
                      {payment.reversed ? (
                        <Badge>Reversed</Badge>
                      ) : (
                        !payment.isReversal && (
                          <ActionButton
                            action={reverseDeskPayment.bind(null, payment.id)}
                            pendingLabel="Reversing…"
                            variant="ghost"
                            aria-label={`Reverse the payment of ${formatPeso(payment.amount)} from ${payment.payerName ?? "unknown"}`}
                            confirm={{ question: "Reverse this payment?", yes: "Yes, reverse" }}
                          >
                            Reverse
                          </ActionButton>
                        )
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </Card>
  );
}
