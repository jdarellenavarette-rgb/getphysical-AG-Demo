'use server';

import { createCorrelationCode, type CrmBroadcast } from 'sodia-core';
import { broadcastFormSchema, directMessageSchema, type BroadcastFormInput, type DirectMessageInput } from '../../lib/schemas/broadcast';
import { firstFieldErrors, type FieldErrors } from '../../lib/schemas/field-errors';
import { dispatchRealtime, storeBroadcast } from '../../lib/crm-server';
import { SUITE_MODES, type SuiteMode } from '../../lib/suite-routes';
import { BROADCAST_SENDERS } from '../../lib/broadcast-senders';

export type ActionResult<T, K extends string = string> =
  | { ok: true; data: T; delivered: boolean }
  | { ok: false; kind: 'validation'; fieldErrors: FieldErrors<K> }
  | { ok: false; kind: 'server'; errorCode: string; message: string };

/** Server Action: validates, persists and fans out a CRM broadcast. */
export async function sendBroadcastAction(
  suiteMode: SuiteMode,
  input: BroadcastFormInput
): Promise<ActionResult<CrmBroadcast, keyof BroadcastFormInput>> {
  if (!SUITE_MODES.includes(suiteMode)) {
    return { ok: false, kind: 'server', errorCode: createCorrelationCode('GP-400'), message: 'Unknown workspace.' };
  }
  const parsed = broadcastFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, kind: 'validation', fieldErrors: firstFieldErrors<keyof BroadcastFormInput>(parsed.error) };
  }
  try {
    const sender = BROADCAST_SENDERS[suiteMode];
    const broadcast: CrmBroadcast = {
      id: `bc_${Date.now()}`,
      suiteMode,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      audience: parsed.data.audience,
      title: parsed.data.title,
      body: parsed.data.body,
      promoCode: parsed.data.promoCode || undefined,
      createdAt: new Date().toISOString(),
      badgeText: `${suiteMode} CRM`,
    };
    storeBroadcast(broadcast);
    const delivered = await dispatchRealtime('crm_broadcast', { ...broadcast });
    return { ok: true, data: broadcast, delivered };
  } catch (err) {
    console.error('[sendBroadcastAction]', err);
    return { ok: false, kind: 'server', errorCode: createCorrelationCode('GP-500'), message: 'The broadcast could not be saved.' };
  }
}

/** Server Action: pushes a business → athlete direct message to the Sodia app (event `crm_direct`). */
export async function sendDirectMessageAction(
  input: DirectMessageInput
): Promise<ActionResult<{ text: string }, keyof DirectMessageInput>> {
  const parsed = directMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, kind: 'validation', fieldErrors: firstFieldErrors<keyof DirectMessageInput>(parsed.error) };
  }
  const delivered = await dispatchRealtime('crm_direct', { ...parsed.data });
  return { ok: true, data: { text: parsed.data.text }, delivered };
}
