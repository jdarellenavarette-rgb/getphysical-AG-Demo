import { NextResponse } from 'next/server';
import type { CrmChatMessage } from 'sodia-core';
import { dispatchRealtime, listReplies, storeReply } from '../../../../lib/crm-server';

/** REST surface kept for the Sodia mobile app's athlete replies (HTTP fallback path). */
export async function GET() {
  return NextResponse.json({ success: true, replies: listReplies() });
}

export async function POST(req: Request) {
  try {
    const data: Partial<CrmChatMessage> = await req.json();
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
    const replies = storeReply(reply);
    await dispatchRealtime('crm_reply', { ...reply });
    return NextResponse.json({ success: true, reply, replies });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
