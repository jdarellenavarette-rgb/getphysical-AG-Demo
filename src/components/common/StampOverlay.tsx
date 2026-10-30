import React, { useState } from 'react';
import { VerifiedStamp } from '../../types';
import { ShieldCheck, Flame, Trophy, CheckCircle2 } from 'lucide-react';

interface StampOverlayProps {
  stamp: VerifiedStamp;
  isDraggable?: boolean;
}

export const StampOverlay: React.FC<StampOverlayProps> = ({ stamp }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={`inline-block cursor-pointer select-none rounded-xl border-2 p-3.5 shadow-2xl backdrop-blur-md transition-all duration-200 ${
        isDarkMode
          ? 'border-white/80 bg-black/85 text-white'
          : 'border-white/90 bg-white/90 text-zinc-950'
      }`}
      title="Click to invert light/dark mode"
    >
      <div className="flex items-center justify-between gap-3 border-b pb-2 border-current/20">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
          <span className="text-[11px] font-black uppercase tracking-wider">
            {stamp.title}
          </span>
        </div>
        {stamp.isPR && (
          <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
            <Flame className="h-3 w-3 fill-amber-500" /> NEW PR
          </span>
        )}
      </div>

      <div className="mt-2">
        <div className="text-lg font-black tracking-tight">{stamp.primaryMetric}</div>
        <div className="mt-1 space-y-0.5 text-[11px] font-medium opacity-80">
          {stamp.subMetrics.map((sub, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-current opacity-60" />
              <span>{sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t pt-1.5 text-[10px] opacity-60 border-current/15">
        <span>{stamp.timestamp}</span>
        <span className="flex items-center gap-1 font-semibold text-emerald-600">
          <CheckCircle2 className="h-3 w-3" /> System Verified
        </span>
      </div>
    </div>
  );
};
