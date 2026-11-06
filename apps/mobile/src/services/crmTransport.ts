import Constants from "expo-constants";
import { getSodiaSupabaseClient, type CrmBroadcast, type CrmChatMessage } from "sodia-core";

export const CRM_CHANNEL = "sodia_crm_broadcasts";
export const ATHLETE_ID = "usr_athlete_01";
export const ATHLETE_NAME = "Darelle Navarette";

export type CrmRealtimeChannel = ReturnType<ReturnType<typeof getSodiaSupabaseClient>["channel"]>;

/** Payload of a direct business-suite → athlete message. */
export interface CrmDirectPayload {
  readonly threadId?: string;
  readonly senderName?: string;
  readonly senderAvatar?: string;
  readonly text?: string;
}

export function getApiBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  if (hostUri) return `http://${hostUri.split(":")[0]}:3000`;
  return "http://192.168.1.48:3000";
}

export function threadIdForSuite(suiteMode: CrmBroadcast["suiteMode"] | undefined): string {
  if (suiteMode === "COACHDASH") return "thread_coach_ramos";
  if (suiteMode === "CLUBDASH") return "thread_bgc_pickleball";
  return "thread_metro_core";
}

export function isBroadcastForAthlete(bc: CrmBroadcast): boolean {
  return bc.audience === "ALL" || !bc.targetAthleteId || bc.targetAthleteId === ATHLETE_ID;
}

export function broadcastToMessage(bc: CrmBroadcast, threadId: string, id: string, time: string): CrmChatMessage {
  return {
    id,
    threadId,
    senderId: "business",
    senderName: bc.senderName || "Metro Core Arena (GymDash)",
    senderAvatar: bc.senderAvatar,
    text: `${bc.title}\n\n${bc.body}`,
    time,
    createdAt: bc.createdAt || new Date().toISOString(),
    isCrmBroadcast: true,
    broadcastData: { title: bc.title, body: bc.body, promoCode: bc.promoCode, suiteMode: bc.suiteMode },
  };
}

/** Realtime broadcast first, then HTTP fallback to the web CRM inbox. Both are best-effort. */
export async function deliverReply(reply: CrmChatMessage): Promise<void> {
  try {
    const channel = getSodiaSupabaseClient().channel(CRM_CHANNEL);
    await channel.send({
      type: "broadcast",
      event: "crm_reply",
      payload: { ...reply, senderHandle: "@darellenavarette" },
    });
  } catch (err) {
    console.warn("[CRM Send Realtime Error]:", err);
  }
  try {
    await fetch(`${getApiBaseUrl()}/api/crm/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: reply.threadId, senderId: reply.senderId, senderName: reply.senderName, text: reply.text }),
    });
  } catch {
    // Offline: realtime path above (or the next sync) covers delivery.
  }
}

function isBroadcastList(value: unknown): value is CrmBroadcast[] {
  return Array.isArray(value) && value.every((v) => typeof v === "object" && v !== null && "title" in v && "body" in v);
}

export async function fetchBroadcastHistory(): Promise<CrmBroadcast[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/crm/broadcast`);
    if (!res.ok) return [];
    const json: unknown = await res.json();
    if (typeof json === "object" && json !== null && "broadcasts" in json) {
      const list: unknown = json.broadcasts;
      return isBroadcastList(list) ? list : [];
    }
    return [];
  } catch {
    return [];
  }
}
