'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, UserCheck, ShieldAlert, CheckCircle, Send, Tag, Phone, Calendar, ArrowRight, Zap, RefreshCw, Megaphone, Radio } from 'lucide-react';
import { SuiteMode } from './HeroPromoCard';
import { useSuiteTheme } from './theme';
import { CreateMessageModal } from './CreateMessageModal';
import { getSodiaSupabaseClient, CrmBroadcast } from 'sodia-core';

interface MessageTicket {
  id: string;
  athleteName: string;
  avatar: string;
  handle: string;
  channel: 'GATE_EXPIRATION' | 'AT_RISK' | 'FORM_CHECK' | 'GENERAL_INQUIRY';
  lastMessage: string;
  time: string;
  unread: boolean;
  status: 'OPEN' | 'RESOLVED';
  tag: string;
  tagColor: string;
  athleteMeta: {
    membership: string;
    lastVisit: string;
    primary1RM?: string;
    phone: string;
  };
  messages: { sender: 'athlete' | 'business'; text: string; time: string }[];
}

const INITIAL_TICKETS: MessageTicket[] = [
  {
    id: 't_darelle',
    athleteName: 'Darelle Navarette',
    avatar: 'DN',
    handle: '@darellenavarette',
    channel: 'GENERAL_INQUIRY',
    lastMessage: 'IFBB Certified Trainer • Titanium VIP Member connected via Sodia Messaging.',
    time: 'Just now',
    unread: false,
    status: 'OPEN',
    tag: 'IFBB Certified Trainer',
    tagColor: '#E11D48',
    athleteMeta: {
      membership: 'Titanium VIP All-Access • IFBB Pro Trainer',
      lastVisit: 'Today at BGC High Street Arena',
      primary1RM: 'Deadlift 225kg PR (Verified)',
      phone: '+63 917 888 1994',
    },
    messages: [
      { sender: 'business', text: 'Welcome Darelle! Your IFBB Trainer credential and facility all-access pass are active.', time: '08:00 AM' },
    ],
  },
  {
    id: 't1',
    athleteName: 'Jake Torralba',
    avatar: 'JT',
    handle: '@jake.torralba',
    channel: 'GATE_EXPIRATION',
    lastMessage: 'Turnstile access denied: Pass expired 2 days ago. Sent 1-click renewal prompt.',
    time: '10:42 AM',
    unread: true,
    status: 'OPEN',
    tag: 'Turnstile Denial',
    tagColor: '#DC2626',
    athleteMeta: {
      membership: 'Expired VIP All-Access',
      lastVisit: 'Today at Gate 01 (Denied)',
      primary1RM: 'Bench 120kg',
      phone: '+63 917 555 0192',
    },
    messages: [
      { sender: 'business', text: 'Turnstile Alert: Your 60s dynamic pass expired on Nov 2. Would you like to renew with your saved Maya account?', time: '10:40 AM' },
      { sender: 'athlete', text: 'Hey, I am at the front desk right now, can you approve a renewal pass?', time: '10:42 AM' },
    ],
  },
  {
    id: 't2',
    athleteName: 'Marcus Cruz',
    avatar: 'MC',
    handle: '@marcus.cruz',
    channel: 'FORM_CHECK',
    lastMessage: 'Uploaded video: 180kg Squat 1RM attempt for PR review.',
    time: '09:15 AM',
    unread: true,
    status: 'OPEN',
    tag: 'Coach Review',
    tagColor: '#0284C7',
    athleteMeta: {
      membership: '12-Wk Strength Peak Client',
      lastVisit: 'Yesterday (Leg Power Cycle)',
      primary1RM: 'Squat 180kg Attempt',
      phone: '+63 920 888 3412',
    },
    messages: [
      { sender: 'athlete', text: 'Coach, just logged my 180kg squat set in the app with the video clip attached. Depth was borderline, check my hips.', time: '09:15 AM' },
    ],
  },
  {
    id: 't3',
    athleteName: 'Alyssa Ramos',
    avatar: 'AR',
    handle: '@alyssa.runs',
    channel: 'AT_RISK',
    lastMessage: 'Automated CRM trigger: Absent 14 days from regular court slots.',
    time: 'Yesterday',
    unread: false,
    status: 'OPEN',
    tag: 'At-Risk Win-Back',
    tagColor: '#D97706',
    athleteMeta: {
      membership: 'Hyrox & Padel Member',
      lastVisit: '14 days ago',
      primary1RM: '5km Pace 21:40',
      phone: '+63 918 333 9921',
    },
    messages: [
      { sender: 'business', text: 'Hey Alyssa, we missed you at the track! Here is an exclusive 30% recovery court voucher for this weekend.', time: 'Yesterday' },
      { sender: 'athlete', text: 'Thanks! Had a mild ankle sprain, resuming light drills this Saturday.', time: 'Yesterday' },
    ],
  },
  {
    id: 't4',
    athleteName: 'Metro Padel League',
    avatar: 'MP',
    handle: '@metropadel.org',
    channel: 'GENERAL_INQUIRY',
    lastMessage: 'Requested parent court lock for Saturday Tournament Quarterfinals.',
    time: 'Nov 2',
    unread: false,
    status: 'RESOLVED',
    tag: 'Organizer League',
    tagColor: '#059669',
    athleteMeta: {
      membership: 'Affiliated League Host',
      lastVisit: 'Nov 1 (Spatial Booking Confirmed)',
      phone: '+63 915 222 7701',
    },
    messages: [
      { sender: 'athlete', text: 'Can we reserve Court Alpha and Beta with 20-min buffers instead of 15-min?', time: 'Nov 2' },
      { sender: 'business', text: 'Approved! Buffers updated in Clubdash Spatial Engine.', time: 'Nov 2' },
    ],
  },
];

interface AthleticInboxCRMViewProps {
  suiteMode: SuiteMode;
}

export function AthleticInboxCRMView({ suiteMode }: AthleticInboxCRMViewProps) {
  const { theme, isDark } = useSuiteTheme();
  const [tickets, setTickets] = useState<MessageTicket[]>(INITIAL_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(INITIAL_TICKETS[0]?.id ?? '');
  const [filterChannel, setFilterChannel] = useState<'ALL' | 'GATE_EXPIRATION' | 'FORM_CHECK' | 'AT_RISK' | 'GENERAL_INQUIRY'>('ALL');
  const [replyText, setReplyText] = useState('');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  useEffect(() => {
    try {
      const client = getSodiaSupabaseClient();
      const channel = client.channel('sodia_crm_broadcasts');

      // 1. Listen for athlete replies from mobile
      channel.on('broadcast', { event: 'crm_reply' }, ({ payload }: { payload: any }) => {
        if (!payload) return;
        const athleteMsg = {
          sender: 'athlete' as const,
          text: payload.text,
          time: payload.time || 'Just now',
        };

        setTickets((prev) =>
          prev.map((t) =>
            t.id === 't_darelle' || t.athleteName === payload.senderName || t.handle === payload.senderHandle
              ? {
                  ...t,
                  messages: [...t.messages, athleteMsg],
                  lastMessage: payload.text,
                  unread: true,
                  time: 'Just now',
                }
              : t
          )
        );
      });

      // 2. Listen for broadcasts dispatched
      channel.on('broadcast', { event: 'crm_broadcast' }, ({ payload }: { payload: CrmBroadcast }) => {
        if (!payload) return;
        const bcMsg = {
          sender: 'business' as const,
          text: `📢 [BROADCAST: ${payload.title}]: ${payload.body}${payload.promoCode ? ` (Promo: ${payload.promoCode})` : ''}`,
          time: 'Just now',
        };

        setTickets((prev) =>
          prev.map((t) =>
            t.id === 't_darelle'
              ? {
                  ...t,
                  messages: [...t.messages, bcMsg],
                  lastMessage: `📢 ${payload.title}`,
                  time: 'Just now',
                }
              : t
          )
        );
      });

      channel.subscribe();

      // 3. Local window event listener for immediate UI update
      const handleLocalBroadcast = (e: any) => {
        const payload = e.detail;
        if (!payload) return;
        const bcMsg = {
          sender: 'business' as const,
          text: `📢 [BROADCAST: ${payload.title}]: ${payload.body}${payload.promoCode ? ` (Promo: ${payload.promoCode})` : ''}`,
          time: 'Just now',
        };
        setTickets((prev) =>
          prev.map((t) =>
            t.id === 't_darelle'
              ? {
                  ...t,
                  messages: [...t.messages, bcMsg],
                  lastMessage: `📢 ${payload.title}`,
                  time: 'Just now',
                }
              : t
          )
        );
      };

      window.addEventListener('sodia_crm_broadcast_sent', handleLocalBroadcast);
      return () => {
        window.removeEventListener('sodia_crm_broadcast_sent', handleLocalBroadcast);
      };
    } catch (err) {
      console.warn('[CRM View Supabase listener err]', err);
    }
  }, []);

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) ?? tickets[0];

  const filteredTickets = tickets.filter((t) => {
    if (filterChannel === 'ALL') return true;
    return t.channel === filterChannel;
  });

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    const textToSend = replyText.trim();
    const newMsg = { sender: 'business' as const, text: textToSend, time: 'Just now' };
    setTickets((prev) =>
      prev.map((t) => (t.id === activeTicket.id ? { ...t, messages: [...t.messages, newMsg], lastMessage: newMsg.text, unread: false } : t))
    );
    setReplyText('');

    // If activeTicket is Darelle Navarette, dispatch real-time to mobile!
    if (activeTicket.id === 't_darelle' || activeTicket.athleteName.includes('Darelle')) {
      try {
        const client = getSodiaSupabaseClient();
        const channel = client.channel('sodia_crm_broadcasts');
        await channel.send({
          type: 'broadcast',
          event: 'crm_direct',
          payload: {
            threadId: 'thread_metro_core',
            senderName: 'Metro Core Arena (GymDash)',
            targetAthleteId: 'usr_athlete_01',
            text: textToSend,
          },
        });

        // Also post to API route
        await fetch('/api/crm/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: 'thread_metro_core',
            senderId: 'business',
            senderName: 'Metro Core Arena (GymDash)',
            text: textToSend,
          }),
        }).catch(() => {});
      } catch (err) {
        console.warn('[CRM Direct send err]', err);
      }
    }
  };

  const handleActionRenew = () => {
    if (!activeTicket) return;
    const newMsg = { sender: 'business' as const, text: 'Digital Pass Provisioned! Turnstile Gate 01 is now cleared for 30 days.', time: 'Just now' };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicket.id
          ? { ...t, messages: [...t.messages, newMsg], status: 'RESOLVED', tag: 'Resolved (Renewed)', tagColor: '#059669' }
          : t
      )
    );
  };

  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderColor}`,
        height: 'calc(100vh - 140px)',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: theme.shadowCard,
      }}
    >
      {/* Col 1: Channel Filters & Conversation List */}
      <div
        style={{
          width: '380px',
          borderRight: `1px solid ${theme.borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.bgCardSecondary,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: `1px solid ${theme.borderColor}`, backgroundColor: theme.bgCard }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="#E11D48" />
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.3px' }}>
                Unified Athletic Inbox
              </h3>
            </div>
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              style={{
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.35)',
              }}
            >
              <Megaphone size={12} />
              <span>Broadcast to All</span>
            </button>
          </div>

          {/* Channels Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'GATE_EXPIRATION', label: 'Turnstile' },
              { id: 'FORM_CHECK', label: 'Coach Reviews' },
              { id: 'AT_RISK', label: 'At-Risk CRM' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterChannel(f.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: filterChannel === f.id ? '#E11D48' : theme.bgCardTertiary,
                  color: filterChannel === f.id ? '#FFFFFF' : theme.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredTickets.map((t) => {
            const isSelected = t.id === activeTicket?.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                style={{
                  padding: '14px 18px',
                  borderBottom: `1px solid ${theme.borderLight}`,
                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  borderLeft: isSelected ? '3px solid #E11D48' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '16px',
                        backgroundColor: '#E2E8F0',
                        color: theme.textPrimary,
                        fontSize: '11px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {t.id === 't_darelle' ? (
                        <img src="/profiles/darelle/avatar.png" alt="Darelle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        t.avatar
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: theme.textPrimary }}>{t.athleteName}</div>
                      <div style={{ fontSize: '10px', color: theme.textMuted, fontWeight: 600 }}>{t.handle}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: theme.textMuted, fontWeight: 600 }}>{t.time}</span>
                </div>

                <p style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: '16px', margin: '6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  {t.lastMessage}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', backgroundColor: `${t.tagColor}15`, color: t.tagColor }}>
                    {t.tag}
                  </span>
                  {t.unread && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: '#E11D48' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Col 2: Active Conversation & Athlete Action Hub */}
      {activeTicket && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.bgCard }}>
          {/* Thread Header */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: `1px solid ${theme.borderColor}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.bgCardSecondary,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {activeTicket.id === 't_darelle' && (
                <img
                  src="/profiles/darelle/avatar.png"
                  alt="Darelle Navarette"
                  style={{ width: '38px', height: '38px', borderRadius: '19px', objectFit: 'cover', border: '2px solid #E11D48' }}
                />
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 900, color: theme.textPrimary }}>{activeTicket.athleteName}</h4>
                  <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: 600 }}>{activeTicket.athleteMeta.phone}</span>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: `${activeTicket.tagColor}15`, color: activeTicket.tagColor, fontWeight: 800 }}>
                    {activeTicket.tag}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '2px', fontWeight: 600 }}>
                  {activeTicket.athleteMeta.membership} • Last visit: {activeTicket.athleteMeta.lastVisit}
                </div>
              </div>
            </div>

            {/* Quick Automation Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeTicket.channel === 'GATE_EXPIRATION' && (
                <button
                  onClick={handleActionRenew}
                  style={{
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '7px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <CheckCircle size={14} strokeWidth={2.5} />
                  <span>1-Click Approve Pass</span>
                </button>
              )}
              {activeTicket.channel === 'FORM_CHECK' && (
                <button
                  style={{
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '7px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
                  }}
                >
                  <Zap size={14} strokeWidth={2.5} />
                  <span>Verify 1RM Stamp</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: theme.bgCard }}>
            {activeTicket.messages.map((m, idx) => {
              const isBiz = m.sender === 'business';
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isBiz ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                    backgroundColor: isBiz ? '#E11D48' : theme.bgCardSecondary,
                    color: isBiz ? '#FFFFFF' : theme.textPrimary,
                    borderRadius: '16px',
                    padding: '12px 16px',
                    border: isBiz ? 'none' : `1px solid ${theme.borderColor}`,
                    boxShadow: isBiz ? '0 6px 16px rgba(225, 29, 72, 0.25)' : 'none',
                  }}
                >
                  <p style={{ fontSize: '13px', lineHeight: '18px', margin: 0, fontWeight: isBiz ? 600 : 500 }}>{m.text}</p>
                  <div style={{ fontSize: '10px', color: isBiz ? 'rgba(255, 255, 255, 0.8)' : theme.textMuted, marginTop: '4px', textAlign: 'right', fontWeight: 600 }}>
                    {m.time}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Bar */}
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${theme.borderColor}`, backgroundColor: theme.bgCardSecondary, display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
              placeholder="Write direct response or automated CRM prompt..."
              style={{
                flex: 1,
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderColor}`,
                borderRadius: '12px',
                padding: '10px 14px',
                color: theme.textPrimary,
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSendReply}
              style={{
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '0 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
              }}
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      <CreateMessageModal
        visible={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        suiteMode={suiteMode}
      />
    </div>
  );
}
