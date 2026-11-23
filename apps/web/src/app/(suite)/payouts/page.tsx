import { ArrowRight, Construction } from "lucide-react";
import { WORKSPACES } from "sodia-core";
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
    label: "Under construction",
    tone: "warning",
    text: "Online payments are being built. What you sell is saved and people can see it in the Sodia app, but nobody can pay in the app yet. Keep taking payment the way you do today.",
  },
  TEST_MODE: {
    label: "Test mode",
    tone: "warning",
    text: "Purchases go through the payment provider's test system. No real money moves and nothing is paid out.",
  },
  LIVE: {
    label: "Live",
    tone: "success",
    text: "People can buy from you in the Sodia app, and each payment is split to your account as it is made.",
  },
};

/** The split, in the order it happens. The same for every kind of business. */
const STEPS = [
  { title: "Your customer pays", text: "Your price plus a small service fee, shown separately before they pay." },
  { title: "The payment is split", text: "By the payment provider, at the moment of payment, not later by us." },
  {
    title: "Your price goes to you",
    text: "Into your own account with the provider. The service fee goes to GetPhysical.",
  },
];

const NEEDS = [
  "Your business registration (DTI, SEC or CDA) and tax number",
  "A valid ID of the owner or an authorised signatory",
  "A bank or e-wallet account in the business's name",
];

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
  const noun = WORKSPACES[active.kind].noun;

  return (
    <>
      <PageHeader title="Payouts" description={`How ${active.name} will be paid for what it sells in the Sodia app.`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 self-start lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <Badge tone={copy.tone}>
                {status.state === "NOT_SET_UP" && <Construction size={14} aria-hidden className="mr-1" />}
                {copy.label}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p>{copy.text}</p>
              {status.state === "TEST_MODE" && (
                <>
                  <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    Test payments run on <MayaMark /> sandbox
                  </p>
                  <Notice tone="warning" role="note">
                    To try a purchase, buy in the Sodia app and pay with one of the provider&apos;s published test
                    cards. Real cards are refused in test mode.
                  </Notice>
                </>
              )}
              {status.liveRequestedAt && status.state !== "LIVE" && (
                <Notice tone="success" role="note">
                  You asked to be told on {formatDate(status.liveRequestedAt)}. We&apos;ll contact you as soon as live
                  payments open for your {noun}.
                </Notice>
              )}
              <PayoutControls
                state={status.state}
                sandboxAvailable={status.sandboxAvailable}
                liveRequested={Boolean(status.liveRequestedAt)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How split payments will work</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-4 sm:grid-cols-3">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="relative rounded-xl border border-border p-4">
                    <span className="font-display text-2xl text-muted-foreground">{index + 1}</span>
                    <p className="mt-1 font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                    {index < STEPS.length - 1 && (
                      <ArrowRight
                        size={18}
                        aria-hidden
                        className="absolute top-1/2 -right-3.5 hidden -translate-y-1/2 rounded-full bg-card text-muted-foreground sm:block"
                      />
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-muted-foreground">
                GetPhysical never receives, holds or forwards your money, and never asks for your bank, e-wallet or card
                details here. The payment provider is still being finalised; this page will name it and show the steps
                to connect once it is.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 self-start">
          <Card>
            <CardHeader>
              <CardTitle>What you&apos;ll need</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Payment providers verify each business before paying it. Having these ready usually speeds that up:
              </p>
              <ul className="grid list-disc gap-2 pl-5 text-sm">
                {NEEDS.map((need) => (
                  <li key={need}>{need}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fees</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">₱15</span> on a one-time pass and{" "}
                <span className="font-semibold text-foreground">5%</span> on a membership, added on top of your price
                and paid by the customer. You receive your price.
              </p>
              <p>The payment provider may also charge its own processing fee; it will be shown here once confirmed.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
