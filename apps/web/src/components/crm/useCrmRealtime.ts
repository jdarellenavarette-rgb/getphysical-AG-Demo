'use client';

import { useEffect, useRef, useState } from 'react';
import { createCorrelationCode } from 'sodia-core/states';
import type { CrmBroadcast } from 'sodia-core';
import { getBrowserSupabase } from '../../lib/supabase-browser';
import { LOCAL_BROADCAST_EVENT } from '../suite/broadcast/config';

export const CRM_CHANNEL = 'sodia_crm_broadcasts';

export interface IncomingReply {
  id?: string;
  text: string;
  senderName?: string;
  senderHandle?: string;
  time?: string;
}

export type RealtimeStatus = 'connecting' | 'live' | 'error';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function parseReply(v: unknown): IncomingReply | null {
  if (!isRecord(v) || typeof v.text !== 'string' || v.text.trim() === '') return null;
  const str = (k: string) => (typeof v[k] === 'string' ? (v[k] as string) : undefined);
  return { id: str('id'), text: v.text, senderName: str('senderName'), senderHandle: str('senderHandle'), time: str('time') };
}

function parseBroadcast(v: unknown): CrmBroadcast | null {
  if (!isRecord(v) || typeof v.title !== 'string' || typeof v.body !== 'string' || typeof v.id !== 'string') return null;
  // Shape verified above for the fields the inbox reads; remaining fields are optional metadata.
  return v as unknown as CrmBroadcast;
}

interface RealtimeHandlers {
  onReply: (reply: IncomingReply) => void;
  onBroadcast: (broadcast: CrmBroadcast) => void;
}

/**
 * Subscribes to the shared CRM realtime channel. The subscription is torn down
 * with supabase.removeChannel() on unmount or retry (no leaked sockets).
 */
export function useCrmRealtime(handlers: RealtimeHandlers) {
  const [status, setStatus] = useState<RealtimeStatus>('connecting');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const onLocal = (e: Event) => {
      if (!(e instanceof CustomEvent)) return;
      const bc = parseBroadcast(e.detail);
      if (bc) handlersRef.current.onBroadcast(bc);
    };
    window.addEventListener(LOCAL_BROADCAST_EVENT, onLocal);

    const fail = () => {
      setStatus('error');
      setErrorCode(createCorrelationCode('GP-503'));
    };

    let release: (() => void) | null = null;
    try {
      const client = getBrowserSupabase();
      const channel = client.channel(CRM_CHANNEL);
      channel.on('broadcast', { event: 'crm_reply' }, (msg: { payload?: unknown }) => {
        const reply = parseReply(msg.payload);
        if (reply) handlersRef.current.onReply(reply);
      });
      channel.on('broadcast', { event: 'crm_broadcast' }, (msg: { payload?: unknown }) => {
        const bc = parseBroadcast(msg.payload);
        if (bc) handlersRef.current.onBroadcast(bc);
      });
      channel.subscribe((state: string) => {
        if (state === 'SUBSCRIBED') {
          setStatus('live');
          setErrorCode(null);
        } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') {
          fail();
        }
      });
      release = () => {
        void client.removeChannel(channel);
      };
    } catch {
      fail();
    }

    return () => {
      window.removeEventListener(LOCAL_BROADCAST_EVENT, onLocal);
      release?.();
    };
  }, [attempt]);

  return {
    status,
    errorCode,
    retry: () => {
      setStatus('connecting');
      setAttempt((a) => a + 1);
    },
  };
}
