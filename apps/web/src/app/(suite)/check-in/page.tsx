import { ScanLine } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState, PageHeader, StatCard } from "../../../components/ui/states";
import { Table, Td, Th } from "../../../components/ui/table";
import { requireSuiteSession } from "../../../lib/active-facility";
import { loadAttendanceSummary, loadRecentScans } from "../../../lib/data/attendance";
import { formatDateTime } from "../../../lib/format";
import { LiveScanFeed } from "./LiveScanFeed";
import { ScannerForm } from "./ScannerForm";

export const metadata = { title: "Check-in" };

export default async function CheckInPage() {
  const { active } = await requireSuiteSession();
  const [summary, scans] = await Promise.all([loadAttendanceSummary(active.id), loadRecentScans(active.id)]);

  return (
    <>
      <PageHeader
        title="Check-in"
        description={`Scan membership cards at ${active.name}. Each code works once and changes every minute.`}
      />
      <LiveScanFeed facilityId={active.id} />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardContent>
            <ScannerForm />
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <StatCard label="Check-ins today" value={String(summary.grantedToday)} />
          <StatCard
            label="Entered in the last 2 hours"
            value={String(summary.lastTwoHours)}
            hint="Estimate of who is inside"
          />
          <StatCard label="Denied today" value={String(summary.deniedToday)} />
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent scans</CardTitle>
          <span className="text-sm text-muted-foreground">Updates as scans happen</span>
        </CardHeader>
        {scans.length === 0 ? (
          <EmptyState
            icon={ScanLine}
            title="No scans yet"
            description="Scans from this desk and from staff phones appear here as they happen."
          />
        ) : (
          <div className="pt-3">
            <Table>
              <thead>
                <tr>
                  <Th>Member</Th>
                  <Th>Result</Th>
                  <Th>Time</Th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr key={scan.id}>
                    <Td className="font-semibold">{scan.memberName}</Td>
                    <Td>
                      <Badge tone={scan.granted ? "success" : "danger"}>{scan.granted ? "Allowed" : "Denied"}</Badge>
                      {scan.detail && <span className="ml-2 text-muted-foreground">{scan.detail}</span>}
                    </Td>
                    <Td>{formatDateTime(scan.at)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </>
  );
}
