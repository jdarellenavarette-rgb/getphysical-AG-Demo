'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles, Bell, MessageSquare, Tag, Users, CheckCircle, Trophy, UserCheck } from 'lucide-react';
import { SuiteMode } from './HeroPromoCard';

interface CreateMessageModalProps {
  visible: boolean;
  onClose: () => void;
  suiteMode: SuiteMode;
}

export function CreateMessageModal({ visible, onClose, suiteMode }: CreateMessageModalProps) {
  const [audience, setAudience] = useState<'ALL' | 'SEGMENT_1' | 'SEGMENT_2' | 'SEGMENT_3'>('ALL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!visible) return null;

  const getModalConfig = () => {
    switch (suiteMode) {
      case 'CLUBDASH':
        return {
          title: 'Facility & Affiliated Club Broadcast',
          sub: 'Broadcast court schedule changes and affiliated club notices',
          segments: [
            { id: 'ALL', label: 'All Players (640)' },
            { id: 'SEGMENT_1', label: 'Affiliated Clubs (18)' },
            { id: 'SEGMENT_2', label: 'Peak Court Bookers' },
            { id: 'SEGMENT_3', label: 'Tournament Entrants' },
          ],
          placeholderTitle: 'e.g. Court 3 & 4 Resurfacing Scheduled for Tomorrow 06:00-10:00',
          placeholderBody: 'Notice to all affiliated leagues: Alternate slots reserved in Court Alpha.',
          promoLabel: 'Attach Court Booking Credit (Optional)',
        };
      case 'COACHDASH':
        return {
          title: 'Coach Client CRM & Program Nudge',
          sub: 'Send macrocycle updates, recovery reminders, and client nudges',
          segments: [
            { id: 'ALL', label: 'All Clients (32)' },
            { id: 'SEGMENT_1', label: 'Hypertrophy Track' },
            { id: 'SEGMENT_2', label: 'Hyrox Endurance' },
            { id: 'SEGMENT_3', label: 'At-Risk / Missing Logs (4)' },
          ],
          placeholderTitle: 'e.g. Week 4 Deload & 1RM Progression Check',
          placeholderBody: 'Ensure your post-workout heart rates and video form checks are logged today.',
          promoLabel: 'Attach Session Pack Bonus (Optional)',
        };
      case 'ORGANIZERDASH':
        return {
          title: 'Tournament Participant Broadcast',
          sub: 'Dispatch bracket updates, check-in calls, and rule packs',
          segments: [
            { id: 'ALL', label: 'All Participants (420)' },
            { id: 'SEGMENT_1', label: 'Men / Women Open (128)' },
            { id: 'SEGMENT_2', label: 'Mixed Doubles (96)' },
            { id: 'SEGMENT_3', label: 'Unverified Waivers (8)' },
          ],
          placeholderTitle: 'e.g. Official Bracket Draw Released & Court Allocation Finalized',
          placeholderBody: 'All team captains must check in at Gate B 30 minutes prior to first whistle.',
          promoLabel: 'Attach Spectator Pass Code (Optional)',
        };
      case 'GYMDASH':
      default:
        return {
          title: 'Manage Messaging & Promos',
          sub: 'Send newsletters, promos, and reminders within your gym',
          segments: [
            { id: 'ALL', label: 'All Active (883)' },
            { id: 'SEGMENT_1', label: 'At-Risk (42)' },
            { id: 'SEGMENT_2', label: 'VIP Pass (210)' },
            { id: 'SEGMENT_3', label: 'Class Enrollees (540)' },
          ],
          placeholderTitle: 'e.g. Flash 48-Hour Recovery Clinic & Sauna Access',
          placeholderBody: 'Exclusive recovery masterclass with verified PR reviews this Saturday.',
          promoLabel: 'Attach Promo Voucher (Optional)',
        };
    }
  };

  const cfg = getModalConfig();

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      alert('Please provide a message headline and body.');
      return;
    }
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setTitle('');
      setBody('');
      setPromoCode('');
      onClose();
    }, 1800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#111319',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #FF6B7A, #E11D48)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={16} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#FFFFFF' }}>
                {cfg.title}
              </h3>
              <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{cfg.sub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: '#1A1D27', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {isSent ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 14px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>Broadcast Dispatched!</h4>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
              Your message was pushed to the selected audience segment with live delivery confirmation.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Target Audience */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Audience Segment
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {cfg.segments.map((aud) => (
                  <button
                    key={aud.id}
                    onClick={() => setAudience(aud.id as any)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: audience === aud.id ? '#FF5364' : '#181B24',
                      color: audience === aud.id ? '#FFFFFF' : '#9CA3AF',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                    }}
                  >
                    {aud.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Broadcast Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={cfg.placeholderTitle}
                style={{
                  width: '100%',
                  backgroundColor: '#181B24',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Body */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Message Content
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={cfg.placeholderBody}
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: '#181B24',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Optional Voucher Tag */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                {cfg.promoLabel}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GPVIP20"
                  style={{
                    flex: 1,
                    backgroundColor: '#181B24',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: '#FF5364',
                    fontWeight: 800,
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPromoCode('METROGP2026')}
                  style={{ backgroundColor: '#1F2432', color: '#D1D5DB', padding: '0 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}
                >
                  Generate Code
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSend}
              style={{
                marginTop: '10px',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF6B7A 0%, #FF3D57 50%, #E11D48 100%)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(225, 29, 72, 0.4)',
              }}
            >
              <Send size={15} />
              <span>Broadcast Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
