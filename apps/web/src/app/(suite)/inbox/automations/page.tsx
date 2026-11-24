import Link from "next/link";
import { ArrowLeft, Play, Zap } from "lucide-react";
import { ActionButton } from "../../../../components/ui/action-button";
import { ActionForm } from "../../../../components/ui/action-form";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/input";
import { EmptyState, Notice, PageHeader } from "../../../../components/ui/states";
import { canManageFacility, requireSection } from "../../../../lib/active-facility";
import { AUTOMATIONS, automationsFor } from "../../../../lib/automations";
import { loadAutomations } from "../../../../lib/data/automations";
import { formatDateTime } from "../../../../lib/format";
import { runAutomationsNow, saveAutomation } from "../../../actions/automations";

export const metadata = { title: "Automated messages" };

export default async function AutomationsPage() {
  const { active } = await requireSection("inbox");
  const canManage = canManageFacility(active.role);
  const rules = await loadAutomations(active.id, automationsFor(active.kind, active.role));
  const on = rules.filter((rule) => rule.enabled).length;

  return (
    <>
      <Link
        href="/inbox"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden />
        Inbox
      </Link>
      <PageHeader
        title="Automated messages"
        description="Messages the suite sends for you at the right moment. Each arrives in the person's own conversation with you, and nobody gets the same one twice."
        actions={
          on > 0 ? (
            <ActionButton action={runAutomationsNow} pendingLabel="Checking…" variant="secondary" size="md">
              <Play size={16} aria-hidden />
              Send what is due now
            </ActionButton>
          ) : undefined
        }
      />

      {!canManage && (
        <div className="mb-6">
          <Notice tone="warning" role="note">
            You can see what is switched on. Only an owner or admin can change these.
          </Notice>
        </div>
      )}

      {rules.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="Nothing to automate here"
          description="This workspace has no automated messages."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {rules.map((rule) => {
            const definition = AUTOMATIONS[rule.kind];
            return (
              <Card key={rule.kind}>
                <CardHeader>
                  <CardTitle>{definition.title}</CardTitle>
                  <Badge tone={rule.enabled ? "success" : "neutral"}>{rule.enabled ? "On" : "Off"}</Badge>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <p className="text-sm text-muted-foreground">{definition.when}</p>
                  {canManage ? (
                    <ActionForm
                      action={saveAutomation.bind(null, rule.kind)}
                      submitLabel="Save"
                      pendingLabel="Saving…"
                      keepValues
                      className="grid gap-3 [&>button]:justify-self-start"
                    >
                      <Label>
                        Message
                        <textarea
                          name="body"
                          required
                          maxLength={1000}
                          rows={4}
                          defaultValue={rule.body}
                          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground"
                        />
                      </Label>
                      <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          name="enabled"
                          defaultChecked={rule.enabled}
                          className="size-5 accent-primary"
                        />
                        Send this automatically
                      </label>
                    </ActionForm>
                  ) : (
                    <p className="rounded-lg bg-muted p-3 text-sm">{rule.body}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {"{name}"} becomes the person&apos;s first name and {"{business}"} your business name
                    {definition.detail ? `; {detail} becomes ${definition.detail}` : ""}.{" "}
                    {rule.sent30d === 0
                      ? "None sent in the last 30 days."
                      : `${rule.sent30d} sent in the last 30 days, the latest ${formatDateTime(rule.lastSentAt)}.`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
        Welcomes go out the moment someone joins. The others are checked whenever someone on your team opens Home, or
        when you press “Send what is due now”. People who muted your group messages are not sent pass or win-back
        messages.
      </p>
    </>
  );
}
