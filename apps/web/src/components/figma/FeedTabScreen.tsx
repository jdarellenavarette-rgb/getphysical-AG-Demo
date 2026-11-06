'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, CircleEllipsis } from 'lucide-react';

interface FeedTabScreenProps {
  onOpenComments: () => void;
  onShare: () => void;
  onSelectCreator?: () => void;
}

export function FeedTabScreen({ onOpenComments, onShare, onSelectCreator }: FeedTabScreenProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(148);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      {/* Fullscreen Video/Photo Background (Moe Tuscano Glute Machine Workout) */}
      <img
        src="/assets/design/feed-bg-moe.png"
        alt="Community Workout Reel"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      />

      {/* Cinematic Gradient Overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 55%, rgba(0,0,0,0.92) 100%)',
        zIndex: 10, pointerEvents: 'none'
      }} />

      {/* Right Interaction Rail (TikTok / Instagram Reels Style) */}
      <div style={{ position: 'absolute', right: '16px', bottom: '95px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 30 }}>
        {/* Like */}
        <button type="button" aria-pressed={isLiked} aria-label={`Like, ${likesCount} likes`} onClick={toggleLike} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={28} color={isLiked ? '#ec4899' : '#ffffff'} fill={isLiked ? '#ec4899' : 'none'} strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {likesCount}
          </span>
        </button>

        {/* Comment */}
        <button onClick={onOpenComments} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={28} color="#ffffff" strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Comment</span>
        </button>

        {/* Share */}
        <button onClick={onShare} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={26} color="#ffffff" strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Share</span>
        </button>

        {/* Save */}
        <button onClick={toggleSave} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={26} color={isSaved ? '#fbbf24' : '#ffffff'} fill={isSaved ? '#fbbf24' : 'none'} strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Save</span>
        </button>
      </div>

      {/* Bottom Left Creator Info (Moe Tuscano) */}
      <div style={{ position: 'absolute', left: '18px', right: '70px', bottom: '80px', zIndex: 30 }}>
        <div
          onClick={onSelectCreator}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer' }}
        >
          <img
            src="/assets/design/avatar-moe.png"
            alt="Moe Tuscano"
            style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.7)', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>Moe Tuscano</span>
              <CircleEllipsis size={15} color="rgba(255,255,255,0.8)" />
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>@mowtuscano</div>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.95)', lineHeight: 1.4, margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          Ending the day with some glute sessions.
        </p>
      </div>
    </div>
  );
}
