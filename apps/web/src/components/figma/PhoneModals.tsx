'use client';

import React, { useRef, useState } from 'react';
import { useDialogA11y } from '../ui/useDialogA11y';
import { X, Send, CheckCircle2, Shield, ArrowUpRight, Receipt, User, Building2, Monitor } from 'lucide-react';

interface PhoneModalsProps {
  isCommentsOpen: boolean;
  onCloseComments: () => void;
  isFullHistoryOpen: boolean;
  onCloseFullHistory: () => void;
  isMenuOpen: boolean;
  onCloseMenu: () => void;
  onSelectRole?: (role: string) => void;
}

export function PhoneModals({
  isCommentsOpen,
  onCloseComments,
  isFullHistoryOpen,
  onCloseFullHistory,
  isMenuOpen,
  onCloseMenu,
  onSelectRole,
}: PhoneModalsProps) {
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([
    { id: '1', author: 'darellenavarette', text: 'Form looks super clean Moe! 🔥', time: '18m ago' },
    { id: '2', author: 'coach.sarah', text: 'Love the tempo on those reps!', time: '12m ago' },
  ]);

  const commentsRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useDialogA11y(isCommentsOpen, commentsRef, onCloseComments);
  useDialogA11y(isFullHistoryOpen, historyRef, onCloseFullHistory);
  useDialogA11y(isMenuOpen, menuRef, onCloseMenu);

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    setComments([...comments, { id: Date.now().toString(), author: 'you', text: commentInput, time: 'Just now' }]);
    setCommentInput('');
  };

  return (
    <>
      {/* 1. COMMENTS BOTTOM SHEET MODAL */}
      {isCommentsOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div ref={commentsRef} role="dialog" aria-modal="true" aria-labelledby="gp-phone-comments-title" tabIndex={-1} style={{ backgroundColor: '#18181b', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '16px', maxHeight: '70%', maxWidth: '440px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span id="gp-phone-comments-title" style={{ fontSize: '13px', fontWeight: 800, color: '#f4f4f5' }}>Comments ({comments.length})</span>
              <button type="button" aria-label="Close comments" onClick={onCloseComments} style={{ color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {comments.map((c) => (
                <div key={c.id} style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#ec4899', fontSize: '11px' }}>
                    {c.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div><strong style={{ color: '#fff' }}>@{c.author}</strong> <span style={{ color: '#71717a', fontSize: '11px' }}>{c.time}</span></div>
                    <p style={{ color: '#d4d4d8', margin: '2px 0 0' }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Add a comment..."
                aria-label="Add a comment"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                style={{ flex: 1, backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '99px', padding: '8px 14px', color: '#fff', fontSize: '12px' }}
              />
              <button type="button" aria-label="Post comment" onClick={handleSendComment} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ec4899', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. STATEMENT OF ACCOUNT (SOA) FULL HISTORY MODAL */}
      {isFullHistoryOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div ref={historyRef} role="dialog" aria-modal="true" aria-labelledby="gp-phone-soa-title" tabIndex={-1} style={{ backgroundColor: '#121215', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '20px', maxHeight: '82%', maxWidth: '440px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span id="gp-phone-soa-title" style={{ fontSize: '14px', fontWeight: 900, color: '#f4f4f5' }}>STATEMENT OF ACCOUNT</span>
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>IMMUTABLE POSTGRES 17 LEDGER</div>
              </div>
              <button type="button" aria-label="Close statement of account" onClick={onCloseFullHistory} style={{ color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'Turnstile Check-In • Metro Core', time: 'Today, 08:14 AM', amt: '₱0.00', status: 'GRANTED' },
                { name: 'Walk-in Day Pass • Metro Core', time: 'Yesterday, 07:30 PM', amt: '-₱265.00', status: 'PAID' },
                { name: 'Sprout Pickleball Club Pass', time: 'Yesterday, 01:32 PM', amt: 'FREE/PASS', status: 'CLAIMED' },
                { name: 'GetPhysical+ Monthly Renewal', time: 'Oct 28, 06:48 AM', amt: '-₱149.00', status: 'AUTO-DEBIT' },
              ].map((tx, idx) => (
                <div key={idx} style={{ padding: '10px', backgroundColor: '#18181b', borderRadius: '10px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#f4f4f5' }}>{tx.name}</div>
                    <div style={{ fontSize: '11px', color: '#71717a' }}>{tx.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: tx.amt.startsWith('-') ? '#f87171' : '#34d399' }}>{tx.amt}</div>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#27272a', color: '#a1a1aa' }}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onCloseFullHistory} style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#27272a', color: '#fff', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Close Ledger
            </button>
          </div>
        </div>
      )}

      {/* 3. MENU DRAWER (HAMBURGER ☰) */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 80, display: 'flex' }} onMouseDown={(e) => { if (e.target === e.currentTarget) onCloseMenu(); }}>
          <div ref={menuRef} role="dialog" aria-modal="true" aria-labelledby="gp-phone-menu-title" tabIndex={-1} style={{ width: '280px', height: '100%', backgroundColor: '#121215', borderRight: '1px solid #27272a', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span id="gp-phone-menu-title" style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>getphysical</span>
              <button type="button" aria-label="Close menu" onClick={onCloseMenu} style={{ color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '10px 0', borderBottom: '1px solid #27272a' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>Darelle Navarette</div>
              <div style={{ fontSize: '11px', color: '#e11d48' }}>@darellenavarette • IFBB CPFT</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => { onSelectRole?.('Staff'); onCloseMenu(); }} style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', backgroundColor: '#18181b', color: '#10b981', fontSize: '12px', fontWeight: 700, border: '1px solid #27272a', cursor: 'pointer' }}>
                🏢 Staff Quickdash (Mobile Scanner)
              </button>
              <button onClick={() => { onSelectRole?.('Coach'); onCloseMenu(); }} style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', backgroundColor: '#18181b', color: '#38bdf8', fontSize: '12px', fontWeight: 700, border: '1px solid #27272a', cursor: 'pointer' }}>
                🏋️ Coach Quickdash (Floor Roster)
              </button>
              <button onClick={() => { onSelectRole?.('Organizer'); onCloseMenu(); }} style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', backgroundColor: '#18181b', color: '#f59e0b', fontSize: '12px', fontWeight: 700, border: '1px solid #27272a', cursor: 'pointer' }}>
                🏆 Organizer Pro (Meet Brackets)
              </button>
              <button onClick={() => { onSelectRole?.('Desktop'); onCloseMenu(); }} style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', backgroundColor: '#1e1b4b', color: '#a5b4fc', fontSize: '12px', fontWeight: 700, border: '1px solid #4f46e5', cursor: 'pointer', marginTop: '10px' }}>
                🖥️ Open Full Desktop Business Suite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
