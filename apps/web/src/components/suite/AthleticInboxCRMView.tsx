'use client';

import React, { useState } from 'react';
import { MessageSquare, AlertCircle, UserCheck, ShieldAlert, CheckCircle, Send, Tag, Phone, Calendar, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { SuiteMode } from './HeroPromoCard';

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
    tagColor: '#EF4444',
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
    tagColor: '#38BDF8',
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
    tagColor: '#F59E0B',
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
    tagColor: '#10B981',
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
  const [tickets, setTickets] = useState<MessageTicket[]>(INITIAL_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(INITIAL_TICKETS[0]?.id ?? '');
  const [filterChannel, setFilterChannel] = useState<'ALL' | 'GATE_EXPIRATION' | 'FORM_CHECK' | 'AT_RISK' | 'GENERAL_INQUIRY'>('ALL');
  const [replyText, setReplyText] = useState('');

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) ?? tickets[0];

  const filteredTickets = tickets.filter((t) => {
    if (filterChannel === 'ALL') return true;
    return t.channel === filterChannel;
  });

  const handleSendReply = () => {
    if (!replyText.trim() || !activeTicket) return;
    const newMsg = { sender: 'business' as const, text: replyText.trim(), time: 'Just now' };
    setTickets((prev) =>
      prev.map((t) => (t.id === activeTicket.id ? { ...t, messages: [...t.messages, newMsg], lastMessage: newMsg.text, unread: false } : t))
    );
    setReplyText('');
  };

  const handleActionRenew = () => {
    if (!activeTicket) return;
    const newMsg = { sender: 'business' as const, text: 'Digital Pass Provisioned! Turnstile Gate 01 is now cleared for 30 days.', time: 'Just now' };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicket.id
          ? { ...t, messages: [...t.messages, newMsg], status: 'RESOLVED', tag: 'Resolved (Renewed)', tagColor: '#10B981' }
          : t
      )
    );
  };

  return (
    <div
      style={{
        borderRadius: '24px',
        backgroundColor: '#111319',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        height: 'calc(100vh - 140px)',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Col 1: Channel Filters & Conversation List */}
      <div
        style={{
          width: '380px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0E1016',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <MessageSquare size={18} color="#FF5364" />
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>Unified Athletic Inbox</h3>
            <span style={{ fontSize: '10px', backgroundColor: 'rgba(255, 83, 100, 0.15)', color: '#FF5364', padding: '2px 7px', borderRadius: '999px', fontWeight: 800 }}>
              Meta CRM Sync
            </span>
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
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: filterChannel === f.id ? '#FF5364' : 'rgba(255, 255, 255, 0.05)',
                  color: filterChannel === f.id ? '#FFFFFF' : '#9CA3AF',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
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
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  backgroundColor: isSelected ? 'rgba(255, 83, 100, 0.08)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #FF5364' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '15px',
                        backgroundColor: '#1E2330',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{t.athleteName}</div>
                      <div style={{ fontSize: '10px', color: '#6B7280' }}>{t.handle}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#6B7280' }}>{t.time}</span>
                </div>

                <p style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: '15px', margin: '6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.lastMessage}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: `${t.tagColor}20`, color: t.tagColor }}>
                    {t.tag}
                  </span>
                  {t.unread && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: '#FF5364' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Col 2: Active Conversation & Athlete Action Hub */}
      {activeTicket && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#111319' }}>
          {/* Thread Header */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#141720',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>{activeTicket.athleteName}</h4>
                <span style={{ fontSize: '10px', color: '#6B7280' }}>{activeTicket.athleteMeta.phone}</span>
                <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', backgroundColor: `${activeTicket.tagColor}20`, color: activeTicket.tagColor, fontWeight: 800 }}>
                  {activeTicket.tag}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                {activeTicket.athleteMeta.membership} • Last visit: {activeTicket.athleteMeta.lastVisit}
              </div>
            </div>

            {/* Quick Automation Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeTicket.channel === 'GATE_EXPIRATION' && (
                <button
                  onClick={handleActionRenew}
                  style={{
                    backgroundColor: '#10B981',
                    color: '#000000',
                    fontSize: '11px',
                    fontWeight: 900,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle size={13} strokeWidth={3} />
                  <span>1-Click Approve Pass</span>
                </button>
              )}
              {activeTicket.channel === 'FORM_CHECK' && (
                <button
                  style={{
                    backgroundColor: '#38BDF8',
                    color: '#000000',
                    fontSize: '11px',
                    fontWeight: 900,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Zap size={13} strokeWidth={3} />
                  <span>Verify 1RM Stamp</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activeTicket.messages.map((m, idx) => {
              const isBiz = m.sender === 'business';
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isBiz ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                    backgroundColor: isBiz ? '#E11D48' : '#1A1E2A',
                    color: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    border: isBiz ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isBiz ? '0 6px 16px rgba(225, 29, 72, 0.35)' : 'none',
                  }}
                >
                  <p style={{ fontSize: '13px', lineHeight: '18px', margin: 0 }}>{m.text}</p>
                  <div style={{ fontSize: '10px', color: isBiz ? '#FFA69E' : '#6B7280', marginTop: '4px', textAlign: 'right' }}>
                    {m.time}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Bar */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#141720', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
              placeholder="Write direct response or automated CRM prompt..."
              style={{
                flex: 1,
                backgroundColor: '#1E2330',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSendReply}
              style={{
                backgroundColor: '#FF5364',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
