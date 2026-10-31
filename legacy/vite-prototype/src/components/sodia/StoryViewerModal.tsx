import React, { useState, useEffect } from 'react';
import { SodiaStory } from '../../types';
import { useEcosystem } from '../../context/EcosystemContext';
import { X, Send, MapPin, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { StampOverlay } from '../common/StampOverlay';

interface StoryViewerModalProps {
  story: SodiaStory;
  onClose: () => void;
  onNextStory?: () => void;
  onPrevStory?: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  onClose,
  onNextStory,
  onPrevStory
}) => {
  const { facilities, openCheckout } = useEcosystem();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          if (onNextStory) onNextStory();
          else onClose();
          return 100;
        }
        return p + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, onNextStory, onClose]);

  const handleFacilityPillClick = () => {
    setIsPaused(true);
    const targetFacility = facilities.find(f => f.id === story.locationTag?.facilityId) || facilities[0];
    openCheckout(targetFacility, targetFacility.registry === 'A' ? 'Day Pass' : 'Court Booking', targetFacility.dayPassPrice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      <div className="relative h-full max-h-[92vh] w-full max-w-md overflow-hidden rounded-none sm:rounded-3xl bg-zinc-950 flex flex-col justify-between shadow-2xl">
        {/* Story Background Image */}
        <img
          src={story.mediaUrl}
          alt={story.authorName}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />

        {/* Top Segmented Progress Bar */}
        <div className="relative z-10 px-4 pt-3 space-y-2">
          <div className="flex h-1 w-full gap-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={story.authorAvatar}
                alt={story.authorName}
                className="h-8 w-8 rounded-full border border-white object-cover"
              />
              <div>
                <div className="text-xs font-bold text-white">{story.authorName}</div>
                <div className="text-[10px] text-zinc-300">{story.expiresInHours}h left</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="text-white/80 hover:text-white"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                onClick={onClose}
                className="rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Stamp / Location Tag inside Story */}
        <div className="relative z-10 px-4 my-auto flex flex-col items-center gap-3">
          {story.stamp && <StampOverlay stamp={story.stamp} />}

          {story.locationTag && (
            <button
              onClick={handleFacilityPillClick}
              className="group flex items-center gap-2 rounded-full border border-white/60 bg-black/60 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md hover:bg-black/80 transition-transform active:scale-95"
            >
              <MapPin className="h-4 w-4 text-emerald-400 group-hover:animate-bounce" />
              <span>{story.locationTag.name}</span>
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] uppercase font-black">
                {story.locationTag.actionCTA}
              </span>
            </button>
          )}
        </div>

        {/* Story Bottom Reply */}
        <div className="relative z-10 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              placeholder={`Send message to ${story.authorName}...`}
              className="flex-1 rounded-full border border-white/30 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-zinc-400 backdrop-blur-md focus:border-white focus:outline-hidden"
            />
            <button
              onClick={() => {
                if (!messageText) return;
                setMessageText('');
                setIsPaused(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-transform active:scale-90"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
