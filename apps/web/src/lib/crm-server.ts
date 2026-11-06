import 'server-only';
import { getSodiaSupabaseClient, type CrmBroadcast, type CrmChatMessage } from 'sodia-core';

export const CRM_CHANNEL = 'sodia_crm_broadcasts';

declare global {
  // eslint-disable-next-line no-var
  var __GLOBAL_CRM_BROADCASTS__: CrmBroadcast[] | undefined;
  // eslint-disable-next-line no-var
  var __GLOBAL_CRM_REPLIES__: CrmChatMessage[] | undefined;
}

const SEED_BROADCAST: CrmBroadcast = {
  id: 'crm_bc_seed_01',
  suiteMode: 'GYMDASH',
  senderName: 'Metro Core Arena (GymDash)',
  senderAvatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
  audience: 'ALL',
  title: 'Facility Open House & Olympic Lifting Clinic',
  body: 'Welcome to all athletes! Drop by this Saturday at 10 AM for Coach Miguel’s Form Clinic and free Recovery Sauna sessions.',
  promoCode: 'METROCORE2026',
  badgeText: 'FACILITY BROADCAST',
  createdAt: new Date(Date.now() - 3600000).toISOString(),
};

export function listBroadcasts(): CrmBroadcast[] {
  if (!globalThis.__GLOBAL_CRM_BROADCASTS__) globalThis.__GLOBAL_CRM_BROADCASTS__ = [SEED_BROADCAST];
  return globalThis.__GLOBAL_CRM_BROADCASTS__;
}

export function storeBroadcast(b: CrmBroadcast): CrmBroadcast[] {
  globalThis.__GLOBAL_CRM_BROADCASTS__ = [b, ...listBroadcasts()];
  return globalThis.__GLOBAL_CRM_BROADCASTS__;
}

export function listReplies(): CrmChatMessage[] {
  if (!globalThis.__GLOBAL_CRM_REPLIES__) globalThis.__GLOBAL_CRM_REPLIES__ = [];
  return globalThis.__GLOBAL_CRM_REPLIES__;
}

export function storeReply(r: CrmChatMessage): CrmChatMessage[] {
  globalThis.__GLOBAL_CRM_REPLIES__ = [...listReplies(), r];
  return globalThis.__GLOBAL_CRM_REPLIES__;
}

/**
 * Sends one realtime broadcast and always releases the channel (removeChannel)
 * so serverless invocations never leak sockets. Returns false on failure.
 */
export async function dispatchRealtime(event: string, payload: Record<string, unknown>): Promise<boolean> {
  const client = getSodiaSupabaseClient();
  const channel = client.channel(CRM_CHANNEL);
  try {
    const result = await channel.send({ type: 'broadcast', event, payload });
    return result === 'ok';
  } catch (err) {
    console.warn(`[CRM realtime] ${event} dispatch failed:`, err);
    return false;
  } finally {
    await client.removeChannel(channel);
  }
}
