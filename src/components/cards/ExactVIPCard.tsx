import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { VIPCardPass } from '../../types';

interface ExactVIPCardProps {
  pass?: VIPCardPass;
  isFlipped: boolean;
  onFlip: () => void;
  qrCountdown: number;
}

export const ExactVIPCard: React.FC<ExactVIPCardProps> = ({
  pass,
  isFlipped,
  onFlip,
  qrCountdown
}) => {
  return (
    <div className="relative w-full select-none cursor-pointer" onClick={onFlip}>
      {/* 1. Behind Stack: 3 Tiered Metallic Cards Peeking from the Top with 4 Vertical Division Grooves */}
      <div className="relative mx-auto w-[90%] -mb-2">
        <div className="h-3 rounded-t-2xl bg-[#4a4a50] border-t border-x border-white/20 shadow-md flex justify-between px-6 pt-0.5">
          <div className="w-[1px] h-full bg-black/40" />
          <div className="w-[1px] h-full bg-black/40" />
          <div className="w-[1px] h-full bg-black/40" />
        </div>
      </div>
      <div className="relative mx-auto w-[95%] -mb-2">
        <div className="h-3.5 rounded-t-2xl bg-[#323237] border-t border-x border-white/15 shadow-lg flex justify-between px-8 pt-0.5">
          <div className="w-[1px] h-full bg-black/40" />
          <div className="w-[1px] h-full bg-black/40" />
          <div className="w-[1px] h-full bg-black/40" />
        </div>
      </div>

      {/* 2. Front VIP Card */}
      <div
        className="relative w-full h-[230px] rounded-[24px] overflow-hidden shadow-2xl transition-all duration-500 border border-white/15 [perspective:1000px]"
        style={{
          background: 'linear-gradient(135deg, #2f2f35 0%, #1e1e24 40%, #111116 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 24px rgba(236, 72, 153, 0.15)'
        }}
      >
        {/* Brushed Titanium Specular Sheen */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 4px)'
          }}
        />

        {/* Top Hot Magenta Neon Stripe with Notch Cutouts (Exact from Figma) */}
        <div className="absolute top-0 left-0 right-0 h-[10px] bg-gradient-to-r from-[#f43f5e] via-[#ec4899] to-[#e11d48] flex items-center justify-between px-5 pointer-events-none z-10">
          <div className="h-[3px] w-6 rounded-full bg-black/60" />
          <div className="h-[3px] w-12 rounded-full bg-black/60" />
        </div>

        {/* Bottom Magenta Accent Bar (Figma match) */}
        <div className="absolute bottom-0 left-0 w-24 h-[6px] bg-gradient-to-r from-[#f43f5e] to-[#ec4899] rounded-tr-md pointer-events-none z-10" />

        {!isFlipped ? (
          /* FRONT FACE */
          <div className="relative h-full flex flex-col justify-between p-5 pt-4 text-white">
            {/* Top Row: Hologram Chip + Stencil Numerals + Right Monogram */}
            <div className="flex items-start justify-between">
              {/* Left Cluster: Chip + Glyphs */}
              <div className="flex items-center gap-3">
                {/* Iridescent Rainbow Security Chip */}
                <div className="relative flex h-10 w-12 items-center justify-center rounded-lg bg-gradient-to-tr from-[#fcd34d] via-[#f43f5e] to-[#38bdf8] p-[1.5px] shadow-lg border border-white/40 overflow-hidden">
                  <div className="h-full w-full rounded-[6px] bg-gradient-to-br from-yellow-200/80 via-pink-300/70 to-blue-300/80 p-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-2.5 h-2 border-r border-b border-black/40" />
                      <div className="w-2.5 h-2 border-l border-b border-black/40" />
                    </div>
                    <div className="mx-auto w-3 h-2 border border-black/50 rounded-xs bg-amber-100/50" />
                    <div className="flex justify-between">
                      <div className="w-2.5 h-2 border-r border-t border-black/40" />
                      <div className="w-2.5 h-2 border-l border-t border-black/40" />
                    </div>
                  </div>
                </div>

                {/* Stencil Elements: Hourglass Glyph + 01 + 2026 Stencil (Hot Pink) */}
                <div className="flex items-center gap-2 pl-0.5">
                  {/* Pink Hourglass/Diamond Glyph */}
                  <div className="flex h-5 w-5 items-center justify-center text-[#ec4899]">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M6 3h12l-6 9 6 9H6l6-9-6-9z" />
                    </svg>
                  </div>

                  {/* Stencil 01 Box */}
                  <div className="flex items-center justify-center rounded-[4px] border-[1.5px] border-[#ec4899] px-1 py-0.5">
                    <span className="font-mono text-[11px] font-black tracking-tight text-[#ec4899] leading-none">
                      01
                    </span>
                  </div>

                  {/* Stencil 2026 2x2 Block */}
                  <div className="flex flex-col font-mono text-[9px] font-black text-[#ec4899] leading-[1.05] tracking-widest pl-0.5">
                    <div className="flex gap-1">
                      <span>2</span>
                      <span>0</span>
                    </div>
                    <div className="flex gap-1">
                      <span>2</span>
                      <span>6</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Cluster: Vertical GetPhysical Branding & Orange GP Logo */}
              <div className="flex items-center gap-2.5">
                {/* Vertical Text */}
                <div className="flex flex-col justify-center items-end text-right leading-none select-none">
                  <div className="text-[12px] font-black tracking-tight text-white uppercase">
                    GetPhysical
                  </div>
                  <div className="text-[7.5px] font-bold tracking-wider text-[#fb923c] uppercase mt-0.5">
                    Fitness Ecosystem™
                  </div>
                </div>

                {/* Orange Stylized GP Monogram Badge */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b00] via-[#f97316] to-[#ea580c] shadow-lg shadow-orange-500/30 border border-white/20">
                  <svg viewBox="0 0 40 40" className="w-9 h-9 fill-white">
                    {/* Stylized Modern Athletic Interlocked GP */}
                    <path
                      d="M8 12c0-3.3 2.7-6 6-6h8v4h-8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h8v-8h-5v-4h9v16h-12c-3.3 0-6-2.7-6-6V12z"
                    />
                    <path
                      d="M26 6h6c3.3 0 6 2.7 6 6s-2.7 6-6 6h-6V6zm4 8h2c1.1 0 2-.9 2-2s-.9-2-2-2h-2v4z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Center / Lower-Left: Massive Stylized "VIP" Typography */}
            <div className="my-auto pt-2">
              <svg viewBox="0 0 260 80" className="w-56 h-18 select-none">
                <defs>
                  <linearGradient id="vipGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                  <filter id="vipGlow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#ec4899" floodOpacity="0.4" />
                  </filter>
                </defs>
                {/* Custom Italic Stylized Futuristic VIP Lettering */}
                <g filter="url(#vipGlow)" fill="url(#vipGradient)">
                  {/* V */}
                  <polygon points="10,10 32,10 52,65 72,10 94,10 65,75 38,75" />
                  {/* I */}
                  <polygon points="102,10 124,10 108,75 86,75" />
                  {/* P */}
                  <path d="M128,10 L195,10 C215,10 228,20 224,38 C220,54 205,62 185,62 L150,62 L142,75 L120,75 Z M158,26 L148,46 L182,46 C194,46 200,41 202,34 C204,28 200,26 190,26 Z" />
                </g>
              </svg>
            </div>

            {/* Bottom Meta Line */}
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono tracking-wider pt-1">
              <span>{pass ? pass.memberId : 'GP-VIP-2026-01'}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OPTICAL GATE READY · TAP TO FLIP
              </span>
            </div>
          </div>
        ) : (
          /* BACK FACE: 60s Dynamic Hash QR & Turnstile Code */
          <div className="relative h-full flex flex-col justify-between p-4 bg-zinc-950 text-white text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-mono tracking-wider text-emerald-400 flex items-center gap-1 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> GATE SCANNER
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono font-black text-amber-400">
                <Clock className="h-3 w-3 animate-spin" /> {qrCountdown}s TICK
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 py-1">
              {/* QR Code Canvas */}
              <div className="rounded-2xl bg-white p-2.5 shadow-xl">
                <div className="flex h-20 w-20 flex-col justify-between p-0.5">
                  <div className="flex justify-between">
                    <div className="h-5 w-5 border-[3px] border-black p-0.5"><div className="h-full w-full bg-black" /></div>
                    <div className="h-5 w-5 border-[3px] border-black p-0.5"><div className="h-full w-full bg-black" /></div>
                  </div>
                  <div className="text-[7.5px] font-mono font-black text-black text-center">
                    {pass ? pass.dynamicHash.substring(0, 10) : 'GP-AUTH'}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="h-5 w-5 border-[3px] border-black p-0.5"><div className="h-full w-full bg-black" /></div>
                    <div className="h-2.5 w-2.5 bg-black" />
                  </div>
                </div>
              </div>

              <div className="text-left space-y-1">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Turnstile Code</div>
                <div className="text-lg font-mono font-black text-amber-300">
                  {pass ? pass.offlineTotp : '482-911'}
                </div>
                <div className="text-[9px] text-zinc-400 max-w-[130px] leading-tight">
                  Auto-brightness enabled for turnstile optics
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-400 pt-1 border-t border-white/10">
              Tap card to flip back to VIP front
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
