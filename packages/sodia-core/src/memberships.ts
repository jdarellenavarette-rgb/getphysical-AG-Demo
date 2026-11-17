import { z } from "zod";

/**
 * Member ↔ venue relationship, shared by the mobile app and the Business Suite.
 *
 * The database derives one STANDING per member per venue from two records: the
 * membership (the relationship) and the member's passes (door access). Both
 * apps read it through `facility_member_directory` (venue side) and
 * `my_memberships` (member side) and label it with the helpers below, so a
 * member and a venue always see the same thing.
 */
export const MEMBER_STANDINGS = ["ACTIVE", "LAPSED", "NO_PASS", "PENDING", "CANCELLED"] as const;
export type MemberStanding = (typeof MEMBER_STANDINGS)[number];

export const memberStandingSchema = z.enum(MEMBER_STANDINGS);

const registryTypeSchema = z.enum(["COMMERCIAL", "COMMUNITY"]);

/** One row of `facility_member_directory(p_facility_id)`. */
export const memberDirectoryRowSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string(),
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),
  membership_status: z.enum(["ACTIVE", "CANCELLED", "PENDING"]),
  source: z.string(),
  joined_at: z.string().nullable(),
  standing: memberStandingSchema,
  pass_valid_until: z.string().nullable(),
  last_pass_ended_at: z.string().nullable(),
  last_visit_at: z.string().nullable(),
  broadcasts_muted: z.boolean(),
});
export type MemberDirectoryRow = z.infer<typeof memberDirectoryRowSchema>;

/** One row of `my_memberships()`. */
export const myMembershipRowSchema = z.object({
  facility_id: z.string(),
  facility_name: z.string(),
  slug: z.string().nullable(),
  logo_url: z.string().nullable(),
  registry_type: registryTypeSchema,
  standing: memberStandingSchema,
  pass_valid_until: z.string().nullable(),
  broadcasts_muted: z.boolean(),
  joined_at: z.string().nullable(),
});
export type MyMembershipRow = z.infer<typeof myMembershipRowSchema>;

export const grantPassResultSchema = z.object({ pass_id: z.string().uuid(), valid_until: z.string() });
export const endMembershipResultSchema = z.object({ revoked_passes: z.number().int().nonnegative() });

/** Whether this standing lets the member through the door today. */
export function standingAllowsEntry(standing: MemberStanding, registryType: "COMMERCIAL" | "COMMUNITY"): boolean {
  // Community clubs have no door pass; an active member simply belongs.
  return standing === "ACTIVE" && registryType === "COMMERCIAL";
}

export interface StandingLabel {
  /** Short badge text. */
  label: string;
  /** One sentence for the venue's staff. */
  forVenue: string;
  /** One sentence for the member. */
  forMember: string;
  tone: "success" | "warning" | "neutral" | "danger";
}

const LABELS: Record<MemberStanding, StandingLabel> = {
  ACTIVE: {
    label: "Active",
    forVenue: "Member in good standing.",
    forMember: "You're a member here.",
    tone: "success",
  },
  LAPSED: {
    label: "Lapsed",
    forVenue: "Their last pass has ended. They can't check in until they renew.",
    forMember: "Your pass has ended. Renew to get back in.",
    tone: "warning",
  },
  NO_PASS: {
    label: "No pass",
    forVenue: "On your list but has never held a pass, so they can't check in yet.",
    forMember: "You're on this venue's list. Buy a pass to get in.",
    tone: "warning",
  },
  PENDING: {
    label: "Pending",
    forVenue: "Waiting for approval.",
    forMember: "Waiting for the venue to approve you.",
    tone: "neutral",
  },
  CANCELLED: {
    label: "Cancelled",
    forVenue: "This membership was ended.",
    forMember: "You're no longer a member here.",
    tone: "neutral",
  },
};

/** The same wording in both apps for a given standing. */
export function describeStanding(standing: MemberStanding): StandingLabel {
  return LABELS[standing];
}
