'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles, Bell, MessageSquare, Tag, Users, CheckCircle } from 'lucide-react';

interface CreateMessageModalProps {
  visible: boolean;
  onClose: () => void;
  suiteMode: 'GYMDASH' | 'CLUBDASH';
}

export function CreateMessageModal({ visible, onClose, suiteMode }: CreateMessageModalProps) {
  const [audience, setAudience] = useState<'ALL' | 'AT_RISK' | 'VIP' | 'PROGRAMS'>('ALL');
  const [channel, setChannel] = useState<'PUSH' | 'SMS' | 'FEED'>('PUSH');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!visible) return null;

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
                {suiteMode === 'GYMDASH' ? 'Manage Messaging & Promos' : 'Broadcast Club Announcement'}
              </h3>
              <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Deliver directly to members&apos; phones and watches</p>
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
              Your message was sent to {audience === 'ALL' ? '883 active members' : 'selected member segment'}.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Target Audience */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Target Audience
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'ALL', label: 'All Active (883)' },
                  { id: 'AT_RISK', label: 'At-Risk (42)' },
                  { id: 'VIP', label: 'VIP Pass (210)' },
                  { id: 'PROGRAMS', label: 'Classes (540)' },
                ].map((aud) => (
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
                Headline / Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash 48-Hour Recovery Clinic & Sauna Access"
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
                placeholder="Write your announcement or workout reminder here..."
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

            {/* Optional Promo Tag */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Attach Promo Voucher (Optional)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VIPPASS20"
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
                  onClick={() => setPromoCode('METROVIP50')}
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
              <span>Send Broadcast to {audience === 'ALL' ? '883 Members' : 'Segment'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
