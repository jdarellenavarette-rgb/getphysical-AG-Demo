import Link from "next/link";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { ActionButton } from "../../../../components/ui/action-button";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { EmptyState, Notice, PageHeader } from "../../../../components/ui/states";
import { Table, Td, Th } from "../../../../components/ui/table";
import { canManageFacility, requireSection } from "../../../../lib/active-facility";
import { IMPORT_LIST_LIMIT, loadImportedMembers } from "../../../../lib/data/imports";
import { formatDate } from "../../../../lib/format";
import { removeImportedMember } from "../../../actions/imports";
import { ImportWizard } from "./ImportWizard";

export const metadata = { title: "Import members" };

export default async function ImportMembersPage() {
  const { active } = await requireSection("members");
  const canManage = canManageFacility(active.role);
  const { rows, total } = await loadImportedMembers(active.id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Link
        href="/members"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden />
        Members
      </Link>
      <PageHeader
        title="Import members"
        description="Bring your existing member list over from a spreadsheet, so your records are in one place from day one."
      />

      <div className="mb-6">
        <Notice tone="warning" role="note">
          Imported records are not Sodia accounts: they can&apos;t check in at the door or receive messages until the
          person joins in the app. When someone joins with the same confirmed email, their record is matched to their
          account automatically and appears on their row in your list.
        </Notice>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>From a spreadsheet</CardTitle>
        </CardHeader>
        <CardContent>
          {canManage ? (
            <ImportWizard />
          ) : (
            <p className="text-sm text-muted-foreground">Only the owner or an admin can import members.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Records</CardTitle>
          <Badge>{total} in all</Badge>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {rows.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="Nothing imported yet"
              description="Records you import appear here with their plan and expiry date."
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Plan</Th>
                  <Th>Expires</Th>
                  {canManage && <Th className="text-right">Actions</Th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <Td>
                      <p className="font-semibold">{row.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {row.source === "DESK" ? "Added at the desk" : "Imported"}
                        {row.onApp ? " · now on the app" : ""}
                      </p>
                    </Td>
                    <Td>
                      {row.email ?? row.phone ?? "—"}
                      {row.email && row.phone && <p className="text-sm text-muted-foreground">{row.phone}</p>}
                    </Td>
                    <Td>{row.planName ?? "—"}</Td>
                    <Td>
                      {row.expiresOn ? (
                        <span className="inline-flex flex-wrap items-center gap-2">
                          {formatDate(`${row.expiresOn}T00:00:00+08:00`)}
                          {row.expiresOn < today && <Badge tone="warning">Expired</Badge>}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                    {canManage && (
                      <Td className="text-right">
                        <ActionButton
                          action={removeImportedMember.bind(null, row.id)}
                          pendingLabel="Removing…"
                          variant="ghost"
                          aria-label={`Remove ${row.fullName}`}
                          confirm={{ question: "Remove this record?", yes: "Yes, remove" }}
                        >
                          Remove
                        </ActionButton>
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
      {total > rows.length && (
        <p className="mt-3 text-sm text-muted-foreground">
          Showing the newest {IMPORT_LIST_LIMIT} of {total}.
        </p>
      )}
    </>
  );
}
