import { z } from "zod";

export type CrmSuiteMode = "GYMDASH" | "CLUBDASH" | "COACHDASH" | "ORGANIZERDASH";

/** UI audience picker values. SEGMENT_n maps to facility_segments.key. */
export type CrmAudience = "ALL" | "SEGMENT_1" | "SEGMENT_2" | "SEGMENT_3";

/** View-model for a broadcast as rendered in the apps (sender comes from the facility row). */
export interface CrmBroadcast {
  id: string;
  suiteMode: CrmSuiteMode;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  audience: CrmAudience;
  targetAthleteId?: string;
  targetAthleteName?: string;
  title: string;
  body: string;
  promoCode?: string;
  createdAt: string;
  badgeText?: string;
  recipientCount?: number;
}

/** View-model for a message in a CRM / DM thread. */
export interface CrmChatMessage {
  id: string;
  threadId: string;
  senderId: "business" | string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: string;
  time: string;
  isCrmBroadcast?: boolean;
  broadcastData?: {
    title: string;
    body: string;
    promoCode?: string;
    suiteMode: CrmSuiteMode;
  };
}

// -----------------------------------------------------------------------------
// Validated inputs (used by web Server Actions before calling the database)
// -----------------------------------------------------------------------------
export const crmSuiteModeSchema = z.enum(["GYMDASH", "CLUBDASH", "COACHDASH", "ORGANIZERDASH"]);

export const crmBroadcastInputSchema = z
  .object({
    facilityId: z.string().trim().min(1).max(64),
    suiteMode: crmSuiteModeSchema,
    audience: z.enum(["ALL", "SEGMENT_1", "SEGMENT_2", "SEGMENT_3", "USER"]),
    targetUserId: z.string().uuid().optional(),
    title: z.string().trim().min(1, "Title is required").max(120, "Title cannot exceed 120 characters"),
    body: z.string().trim().min(1, "Message is required").max(2000, "Message cannot exceed 2000 characters"),
    promoCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{1,32}$/, "Promo codes use A–Z, 0–9, - and _ (max 32)")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    badgeText: z.string().trim().max(40).optional(),
  })
  .refine((v) => v.audience !== "USER" || Boolean(v.targetUserId), {
    message: "Choose an athlete for a direct broadcast",
    path: ["targetUserId"],
  });
export type CrmBroadcastInput = z.input<typeof crmBroadcastInputSchema>;

export const crmReplyInputSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1, "Message is required").max(4000, "Message cannot exceed 4000 characters"),
});
export type CrmReplyInput = z.input<typeof crmReplyInputSchema>;

/** Maps the UI audience picker to the database's (audience, segment_key) pair. */
export function toDbAudience(audience: CrmBroadcastInput["audience"]): {
  audience: "ALL" | "SEGMENT" | "USER";
  segmentKey: string | null;
} {
  if (audience === "ALL" || audience === "USER") return { audience, segmentKey: null };
  return { audience: "SEGMENT", segmentKey: audience };
}
