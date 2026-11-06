import { z } from 'zod';

export const BROADCAST_TITLE_MAX = 80;
export const BROADCAST_BODY_MAX = 280;

export const broadcastFormSchema = z.object({
  audience: z.enum(['ALL', 'SEGMENT_1', 'SEGMENT_2', 'SEGMENT_3']),
  title: z
    .string()
    .trim()
    .min(1, 'Add a headline so members know what this is about.')
    .max(BROADCAST_TITLE_MAX, `Headline must be ${BROADCAST_TITLE_MAX} characters or fewer.`),
  body: z
    .string()
    .trim()
    .min(1, 'Write the message body.')
    .max(BROADCAST_BODY_MAX, `Message must be ${BROADCAST_BODY_MAX} characters or fewer.`),
  promoCode: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === '' || /^[A-Z0-9]{4,16}$/.test(v), 'Promo codes are 4–16 letters or digits, no spaces.'),
});

export type BroadcastFormInput = z.input<typeof broadcastFormSchema>;

export const directMessageSchema = z.object({
  threadId: z.string().min(1),
  senderName: z.string().min(1),
  targetAthleteId: z.string().min(1),
  text: z.string().trim().min(1, 'Message cannot be empty.').max(1000, 'Message must be 1000 characters or fewer.'),
});

export type DirectMessageInput = z.input<typeof directMessageSchema>;
