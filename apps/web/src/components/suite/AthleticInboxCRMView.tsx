'use client';

import React, { useState, useTransition } from 'react';
import { MessageSquare, AlertCircle, UserCheck, ShieldAlert, CheckCircle, Send, Tag, Phone, Calendar, ArrowRight, Zap, RefreshCw, Megaphone, Radio } from 'lucide-react';
import { SuiteMode } from './HeroPromoCard';
import { useSuiteTheme } from './theme';
import { CreateMessageModal } from './CreateMessageModal';
import { sendCrmReply } from '../../app/actions/crm';
import { useActiveFacility } from './ActiveFacilityContext';
import { useFacilityInbox, type InboxTicket } from './useFacilityInbox';

type MessageTicket = InboxTicket;

interface AthleticInboxCRMViewProps {
  suiteMode: SuiteMode;
}

export function AthleticInboxCRMView({ suiteMode }: AthleticInboxCRMViewProps) {
  const { theme, isDark } = useSuiteTheme();
  const facility = useActiveFacility();
  const { tickets, setTickets, status: inboxStatus, errorMessage: inboxError, reload } = useFacilityInbox(facility.id);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();
  const [filterChannel, setFilterChannel] = useState<'ALL' | 'GATE_EXPIRATION' | 'FORM_CHECK' | 'AT_RISK' | 'GENERAL_INQUIRY'>('ALL');
  const [replyText, setReplyText] = useState('');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) ?? tickets[0];

  const filteredTickets = tickets.filter((t) => {
    if (filterChannel === 'ALL') return true;
    return t.channel === filterChannel;
  });

  const sendToActiveThread = (textToSend: string, clearComposer: boolean) => {
    if (!textToSend || !activeTicket) return;
    const conversationId = activeTicket.id;
    setReplyError(null);
    startSending(async () => {
      const result = await sendCrmReply({ conversationId, body: textToSend });
      if (!result.ok) {
        setReplyError(result.state === 'form_validation' ? Object.values(result.fieldErrors).join(' · ') : result.message);
        return;
      }
      if (clearComposer) setReplyText('');
      // Optimistic append; the Realtime echo is de-duplicated by message id.
      setTickets((prev) =>
        prev.map((t) =>
          t.id === conversationId
            ? {
                ...t,
                messages: t.messages.some((m) => m.id === result.data.id)
                  ? t.messages
                  : [...t.messages, { id: result.data.id, sender: 'business' as const, text: textToSend, time: 'Just now' }],
                lastMessage: textToSend,
                unread: false,
              }
            : t
        )
      );
    });
  };

  const handleSendReply = () => sendToActiveThread(replyText.trim(), true);

  const handleActionRenew = () =>
    sendToActiveThread(
      `Hi ${activeTicket?.athleteName ?? 'there'}, your pass at ${facility.name} has expired. Renew in the Sodia app under Cards → ${facility.name} to get back in.`,
      false
    );

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
                onClick={() => setFilterChannel(f.id as typeof filterChannel)}
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
        <div style={{ flex: 1, overflowY: 'auto' }} aria-busy={inboxStatus === 'loading'}>
          {inboxStatus === 'loading' &&
            [0, 1, 2, 3].map((i) => (
              <div key={i} style={{ height: '72px', margin: '10px 14px', borderRadius: '12px', backgroundColor: theme.borderColor, opacity: 0.5 }} />
            ))}
          {inboxStatus === 'empty' && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: theme.textSecondary, fontSize: '13px' }}>
              No member conversations yet. Send a broadcast to start one.
              <button onClick={() => setIsBroadcastModalOpen(true)} style={{ display: 'block', margin: '14px auto 0', padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#FF5364', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>
                New broadcast
              </button>
            </div>
          )}
          {(inboxStatus === 'error' || inboxStatus === 'permission_denied' || inboxStatus === 'session_expired') && (
            <div role="alert" style={{ padding: '32px 20px', textAlign: 'center', color: theme.textSecondary, fontSize: '13px' }}>
              {inboxError ?? 'Could not load conversations.'}
              {inboxStatus === 'session_expired' ? (
                <a href="/login" style={{ display: 'block', marginTop: '14px', color: '#FF5364', fontWeight: 700 }}>Sign in again</a>
              ) : (
                <button onClick={() => void reload()} style={{ display: 'block', margin: '14px auto 0', padding: '8px 14px', borderRadius: '8px', border: `1px solid ${theme.borderColor}`, background: 'none', color: theme.textPrimary, fontWeight: 700, cursor: 'pointer' }}>
                  Retry
                </button>
              )}
            </div>
          )}
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

          {replyError && (
            <div role="alert" style={{ padding: '8px 24px', backgroundColor: '#2A1418', color: '#FCA5A5', fontSize: '12px' }}>
              {replyError}
            </div>
          )}

          {/* Reply Bar */}
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${theme.borderColor}`, backgroundColor: theme.bgCardSecondary, display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isSending && handleSendReply()}
              placeholder="Write a reply to this member..."
              aria-label="Reply to member"
              maxLength={4000}
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
              disabled={isSending}
              style={{
                opacity: isSending ? 0.6 : 1,
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
