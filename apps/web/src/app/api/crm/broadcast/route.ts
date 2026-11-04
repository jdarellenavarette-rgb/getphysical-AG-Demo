import { NextResponse } from 'next/server';
import { getSodiaSupabaseClient, CrmBroadcast } from 'sodia-core';

// In-memory store for broadcasts while dev server runs
declare global {
  // eslint-disable-next-line no-var
  var __GLOBAL_CRM_BROADCASTS__: CrmBroadcast[] | undefined;
}

if (!global.__GLOBAL_CRM_BROADCASTS__) {
  global.__GLOBAL_CRM_BROADCASTS__ = [
    {
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
    },
  ];
}

export async function GET() {
  return NextResponse.json({
    success: true,
    broadcasts: global.__GLOBAL_CRM_BROADCASTS__ || [],
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newBroadcast: CrmBroadcast = {
      id: data.id || `crm_bc_${Date.now()}`,
      suiteMode: data.suiteMode || 'GYMDASH',
      senderName: data.senderName || 'Metro Core Arena (GymDash)',
      senderAvatar:
        data.senderAvatar ||
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
      senderRole: data.senderRole,
      audience: data.audience || 'ALL',
      targetAthleteId: data.targetAthleteId,
      targetAthleteName: data.targetAthleteName,
      title: data.title || 'Official Announcement',
      body: data.body || '',
      promoCode: data.promoCode || undefined,
      badgeText: data.badgeText || `${data.suiteMode || 'BUSINESS'} BROADCAST`,
      createdAt: new Date().toISOString(),
    };

    // Prepend to server memory
    global.__GLOBAL_CRM_BROADCASTS__ = [newBroadcast, ...(global.__GLOBAL_CRM_BROADCASTS__ || [])];

    // Broadcast over Supabase Realtime channel
    try {
      const client = getSodiaSupabaseClient();
      const channel = client.channel('sodia_crm_broadcasts');
      await channel.send({
        type: 'broadcast',
        event: 'crm_broadcast',
        payload: newBroadcast,
      });
    } catch (realtimeErr) {
      console.warn('[CRM Broadcast API] Realtime dispatch warning:', realtimeErr);
    }

    return NextResponse.json({
      success: true,
      broadcast: newBroadcast,
      broadcasts: global.__GLOBAL_CRM_BROADCASTS__,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
