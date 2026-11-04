import { NextResponse } from 'next/server';
import { getSodiaSupabaseClient, CrmChatMessage } from 'sodia-core';

declare global {
  // eslint-disable-next-line no-var
  var __GLOBAL_CRM_REPLIES__: CrmChatMessage[] | undefined;
}

if (!global.__GLOBAL_CRM_REPLIES__) {
  global.__GLOBAL_CRM_REPLIES__ = [];
}

export async function GET() {
  return NextResponse.json({
    success: true,
    replies: global.__GLOBAL_CRM_REPLIES__ || [],
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const reply: CrmChatMessage = {
      id: data.id || `crm_reply_${Date.now()}`,
      threadId: data.threadId || 'thread_metro_core',
      senderId: data.senderId || 'usr_athlete_01',
      senderName: data.senderName || 'Darelle Navarette',
      senderAvatar: data.senderAvatar,
      text: data.text || '',
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    global.__GLOBAL_CRM_REPLIES__ = [...(global.__GLOBAL_CRM_REPLIES__ || []), reply];

    // Broadcast over Supabase Realtime channel so web CRM receives it
    try {
      const client = getSodiaSupabaseClient();
      const channel = client.channel('sodia_crm_broadcasts');
      await channel.send({
        type: 'broadcast',
        event: 'crm_reply',
        payload: reply,
      });
    } catch (realtimeErr) {
      console.warn('[CRM Reply API] Realtime dispatch warning:', realtimeErr);
    }

    return NextResponse.json({
      success: true,
      reply,
      replies: global.__GLOBAL_CRM_REPLIES__,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
