import { NextResponse } from 'next/server';
import type { CrmBroadcast } from 'sodia-core';
import { dispatchRealtime, listBroadcasts, storeBroadcast } from '../../../../lib/crm-server';

/**
 * REST surface kept for the Sodia mobile app (it calls this over LAN; see
 * apps/mobile/src/services/crmTransport.ts). Web UI mutations go through the
 * Server Actions in src/app/actions/crm.ts instead.
 */
export async function GET() {
  return NextResponse.json({ success: true, broadcasts: listBroadcasts() });
}

export async function POST(req: Request) {
  try {
    const data: Partial<CrmBroadcast> = await req.json();
    const suiteMode = data.suiteMode ?? 'GYMDASH';
    const newBroadcast: CrmBroadcast = {
      id: data.id || `crm_bc_${Date.now()}`,
      suiteMode,
      senderName: data.senderName || 'Metro Core Arena (GymDash)',
      senderAvatar: data.senderAvatar || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
      senderRole: data.senderRole,
      audience: data.audience || 'ALL',
      targetAthleteId: data.targetAthleteId,
      targetAthleteName: data.targetAthleteName,
      title: data.title || 'Official Announcement',
      body: data.body || '',
      promoCode: data.promoCode || undefined,
      badgeText: data.badgeText || `${suiteMode} BROADCAST`,
      createdAt: new Date().toISOString(),
    };
    const broadcasts = storeBroadcast(newBroadcast);
    await dispatchRealtime('crm_broadcast', { ...newBroadcast });
    return NextResponse.json({ success: true, broadcast: newBroadcast, broadcasts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
