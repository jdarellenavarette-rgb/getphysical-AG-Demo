'use client';

import React, { useState } from 'react';
import {
  Menu, MessageSquareMore, Bell, Settings, Wifi,
  Heart, MessageCircle, Send, Bookmark, CircleEllipsis,
  MapPin, ChartColumn, Plus, Wallet, User
} from 'lucide-react';

interface FeedPhoneProps {
  onOpenSettings?: () => void;
  onOpenComments?: () => void;
  onShare?: () => void;
}

export function FeedPhone({ onOpenSettings, onOpenComments, onShare }: FeedPhoneProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(148);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <div style={{
      width: '380px', height: '780px', backgroundColor: '#000000', borderRadius: '44px',
      border: '9px solid #1e2e3d', boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(236,72,153,0.35)',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', flexShrink: 0
    }}>
      {/* Fullscreen Video/Photo Background (Moe Tuscano Glute Machine Workout) */}
      <img
        src="/assets/design/feed-bg-moe.png"
        alt="Community Workout Reel"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      />
      {/* Cinematic Gradient Overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 22%, transparent 55%, rgba(0,0,0,0.9) 100%)',
        zIndex: 10, pointerEvents: 'none'
      }} />

      {/* iOS Top Notch & Speaker */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '150px', height: '24px', backgroundColor: '#1e2e3d', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 40 }} />

      {/* iOS Status Bar */}
      <div style={{ paddingTop: '10px', paddingLeft: '24px', paddingRight: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', fontSize: '11px', fontWeight: 600, zIndex: 30 }}>
        <span>9:41 AM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wifi size={13} />
          <span style={{ fontSize: '10px' }}>100%</span>
          <div style={{ width: '18px', height: '9px', border: '1px solid #ffffff', borderRadius: '3px', padding: '1px', display: 'flex' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '1px' }} />
          </div>
        </div>
      </div>

      {/* Transparent App Header: ☰ getphysical + Chat, Bell, Settings */}
      <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Menu size={22} color="#ffffff" style={{ cursor: 'pointer' }} />
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>getphysical</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <MessageSquareMore size={20} color="#ffffff" />
            <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
          </div>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} color="#ffffff" />
            <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
          </div>
          <Settings size={20} color="#ffffff" style={{ cursor: 'pointer' }} onClick={onOpenSettings} />
        </div>
      </div>

      {/* Right Interaction Rail (TikTok / Instagram Reels Style) */}
      <div style={{ position: 'absolute', right: '16px', bottom: '110px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 30 }}>
        {/* Like */}
        <button onClick={toggleLike} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={26} color={isLiked ? '#ec4899' : '#ffffff'} fill={isLiked ? '#ec4899' : 'none'} strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Like</span>
        </button>

        {/* Comment */}
        <button onClick={onOpenComments} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={26} color="#ffffff" strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Comment</span>
        </button>

        {/* Share */}
        <button onClick={onShare} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={24} color="#ffffff" strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Share</span>
        </button>

        {/* Save */}
        <button onClick={() => setIsSaved(!isSaved)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={24} color={isSaved ? '#fbbf24' : '#ffffff'} fill={isSaved ? '#fbbf24' : 'none'} strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Save</span>
        </button>
      </div>

      {/* Bottom Left Creator Info (Moe Tuscano) */}
      <div style={{ position: 'absolute', left: '18px', right: '70px', bottom: '85px', zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <img
            src="/assets/design/avatar-moe.png"
            alt="Moe Tuscano"
            style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.7)', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>Moe Tuscano</span>
              <CircleEllipsis size={15} color="rgba(255,255,255,0.8)" style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>@mowtuscano</div>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.95)', lineHeight: 1.4, margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          Ending the day with some glute sessions.
        </p>
      </div>

      {/* Floating Bottom Navigation Dock */}
      <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px', zIndex: 50 }}>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderRadius: '99px',
          border: '1px solid rgba(255,255,255,0.2)', padding: '8px 20px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
        }}>
          <MapPin size={20} color="#a1a1aa" style={{ cursor: 'pointer' }} />
          <ChartColumn size={20} color="#a1a1aa" style={{ cursor: 'pointer' }} />
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '-22px', border: '4px solid #000000', cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.5)'
          }}>
            <Plus size={22} color="#ffffff" strokeWidth={3} />
          </div>
          <Wallet size={20} color="#a1a1aa" style={{ cursor: 'pointer' }} />
          <User size={20} color="#a1a1aa" style={{ cursor: 'pointer' }} />
        </div>
      </div>
    </div>
  );
}
