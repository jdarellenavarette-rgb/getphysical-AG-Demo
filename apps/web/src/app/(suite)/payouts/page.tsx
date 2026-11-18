import { Badge } from "../../../components/ui/badge";
import { MayaMark } from "../../../components/ui/brand";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Notice, PageHeader } from "../../../components/ui/states";
import { canManageFacility, requireSection } from "../../../lib/active-facility";
import { loadPayoutStatus, type PayoutState } from "../../../lib/data/payouts";
import { formatDate } from "../../../lib/format";
import { PayoutControls } from "./PayoutControls";

export const metadata = { title: "Payouts" };

const STATE_COPY: Record<PayoutState, { label: string; tone: "success" | "warning" | "neutral"; text: string }> = {
  NOT_SET_UP: {
    label: "Not set up",
    tone: "neutral",
    text: "Members can see your plans but can't buy them yet.",
  },
  TEST_MODE: {
    label: "Test mode",
    tone: "warning",
    text: "Purchases go through Maya's test system. No real money moves and nothing is paid out.",
  },
  LIVE: {
    label: "Live",
    tone: "success",
    text: "Members can buy your plans and you are paid out by your payment provider.",
  },
};

export default async function PayoutsPage() {
  const { active } = await requireSection("payouts");
  const canManage = canManageFacility(active.role);
  if (!canManage) {
    return (
      <>
        <PageHeader title="Payouts" />
        <Notice tone="warning" role="note">
          Only the owner or an admin can see and set up payouts.
        </Notice>
      </>
    );
  }
  const status = await loadPayoutStatus(active.id, canManage);
  const copy = STATE_COPY[status.state];

  return (
    <>
      <PageHeader title="Payouts" description={`How ${active.name} gets paid for plans sold in the Sodia app.`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <Badge tone={copy.tone}>{copy.label}</Badge>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p>{copy.text}</p>
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              Payments are processed by <MayaMark />
            </p>
            {status.state === "TEST_MODE" && (
              <Notice tone="warning" role="note">
                To try a purchase, buy a plan in the Sodia app and pay with one of Maya&apos;s published test cards.
                Real cards are refused in test mode.
              </Notice>
            )}
            {status.liveRequestedAt && status.state !== "LIVE" && (
              <Notice tone="success" role="note">
                Live payouts requested on {formatDate(status.liveRequestedAt)}. We&apos;ll contact you to start
                verification with Maya.
              </Notice>
            )}
            {status.state === "NOT_SET_UP" && !status.sandboxAvailable && !status.liveRequestedAt && (
              <p className="text-sm text-muted-foreground">Request live payouts to start selling.</p>
            )}
            <PayoutControls
              state={status.state}
              sandboxAvailable={status.sandboxAvailable}
              liveRequested={Boolean(status.liveRequestedAt)}
            />
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>How payouts work</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>
              Payments are handled by Maya. GetPhysical never holds your money and never asks for your bank, GCash or
              card details here.
            </p>
            <p>
              For live payouts, Maya verifies your business and the account you want to be paid into, directly with you.
              Once approved, this page shows Live.
            </p>
            <p>The member pays your price plus the service fee. You receive your price.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
