import "server-only";
import { AUTOMATIONS, type AutomationKind } from "../automations";
import { createServerSupabase } from "../supabase/server";

export interface AutomationRule {
  kind: AutomationKind;
  enabled: boolean;
  body: string;
  /** Messages sent by this automation in the last 30 days. */
  sent30d: number;
  lastSentAt: string | null;
}

export async function loadAutomations(facilityId: string, kinds: AutomationKind[]): Promise<AutomationRule[]> {
  const supabase = await createServerSupabase();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [rules, sends] = await Promise.all([
    supabase.from("facility_automations").select("kind, enabled, body").eq("facility_id", facilityId),
    supabase
      .from("automation_sends")
      .select("kind, sent_at")
      .eq("facility_id", facilityId)
      .gte("sent_at", since)
      .order("sent_at", { ascending: false })
      .limit(2000),
  ]);
  if (rules.error) throw new Error("Could not load automations.", { cause: rules.error });
  if (sends.error) throw new Error("Could not load what was sent.", { cause: sends.error });
  return kinds.map((kind) => {
    const rule = (rules.data ?? []).find((row) => row.kind === kind);
    const sent = (sends.data ?? []).filter((row) => row.kind === kind);
    return {
      kind,
      enabled: rule?.enabled ?? false,
      body: rule?.body ?? AUTOMATIONS[kind].defaultBody,
      sent30d: sent.length,
      lastSentAt: sent[0]?.sent_at ?? null,
    };
  });
}
