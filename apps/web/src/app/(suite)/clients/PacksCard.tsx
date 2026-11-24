import { Layers, PackagePlus } from "lucide-react";
import { ActionButton } from "../../../components/ui/action-button";
import { ActionForm } from "../../../components/ui/action-form";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input, Label, Select } from "../../../components/ui/input";
import { PayButton } from "../../../components/ui/pay-button";
import { EmptyState } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import type { CoachPack } from "../../../lib/data/coach-packs";
import { paidKey } from "../../../lib/data/desk";
import { formatDate } from "../../../lib/format";
import { createPack, logSession, undoSession } from "../../actions/coach";

interface PacksCardProps {
  packs: CoachPack[];
  /** Clients a pack can be sold to. */
  clients: { id: string; name: string }[];
  paid: Map<string, number>;
  /** Payments are recorded under a business; a coach on a venue's team records them at their own. */
  canRecordPayments: boolean;
}

/** Sessions bought and sessions held. One tap after each session keeps the count right. */
export function PacksCard({ packs, clients, paid, canRecordPayments }: PacksCardProps) {
  const nameOf = new Map(clients.map((client) => [client.id, client.name]));
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Session packs</CardTitle>
        <Badge>{packs.filter((pack) => pack.left > 0).length} in use</Badge>
      </CardHeader>
      <CardContent className="grid gap-5">
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a client first; then you can sell them a pack of sessions.
          </p>
        ) : (
          <ActionForm
            action={createPack}
            submitLabel="Create pack"
            pendingLabel="Creating…"
            icon={<PackagePlus size={16} aria-hidden />}
          >
            <Label className="min-w-44 flex-1">
              Client
              <Select name="clientId" required defaultValue={clients[0]?.id}>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </Label>
            <Label className="min-w-44 flex-1">
              Pack name
              <Input name="name" required maxLength={80} placeholder="10-session pack" />
            </Label>
            <Label className="w-28">
              Sessions
              <Input name="sessions" type="number" min={1} max={500} required inputMode="numeric" />
            </Label>
            <Label className="w-36">
              Price in ₱ (optional)
              <Input name="price" type="number" min={0} step="any" inputMode="decimal" />
            </Label>
          </ActionForm>
        )}
      </CardContent>
      {packs.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No packs yet"
          description="A pack is a number of sessions a client has bought. Log each session as you hold it and the pack counts down."
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Client</Th>
              <Th>Pack</Th>
              <Th>Sessions</Th>
              <Th>Payment</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {packs.map((pack) => (
              <tr key={pack.id}>
                <Td className="font-semibold">{nameOf.get(pack.clientId) ?? "Former client"}</Td>
                <Td>
                  <p>{pack.name}</p>
                  <p className="text-sm text-muted-foreground">Since {formatDate(pack.createdAt)}</p>
                </Td>
                <Td>
                  <Badge tone={pack.left === 0 ? "danger" : pack.left <= 2 ? "warning" : "success"}>
                    {pack.left} of {pack.total} left
                  </Badge>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pack.lastSessionAt ? `Last session ${formatDate(pack.lastSessionAt)}` : "None held yet"}
                  </p>
                </Td>
                <Td>
                  {canRecordPayments ? (
                    <PayButton
                      kind="PACK"
                      refId={pack.id}
                      userId={pack.clientId}
                      price={pack.price}
                      paid={paid.get(paidKey(pack.id, pack.clientId)) ?? 0}
                      payerName={nameOf.get(pack.clientId) ?? "Client"}
                    />
                  ) : (
                    "—"
                  )}
                </Td>
                <Td className="text-right">
                  <span className="inline-flex flex-wrap justify-end gap-2">
                    {pack.left > 0 && (
                      <ActionButton action={logSession.bind(null, pack.id)} pendingLabel="Logging…" variant="primary">
                        Log session
                      </ActionButton>
                    )}
                    {pack.used > 0 && (
                      <ActionButton
                        action={undoSession.bind(null, pack.id)}
                        pendingLabel="Undoing…"
                        variant="ghost"
                        aria-label={`Undo the last session on ${pack.name}`}
                      >
                        Undo last
                      </ActionButton>
                    )}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
