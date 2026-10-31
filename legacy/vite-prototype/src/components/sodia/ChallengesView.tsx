import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import { Trophy, Flame, ShieldCheck, Clock, AlertTriangle, ArrowRight, Video, CheckCircle2 } from 'lucide-react';
import { PRChallenge } from '../../types';

interface ChallengesViewProps {
  onBack?: () => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = () => {
  const { challenges, acceptChallenge, submitChallengeEntry, currentUser } = useEcosystem();

  const [selectedChallenge, setSelectedChallenge] = useState<PRChallenge>(challenges[0]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [entryValue, setEntryValue] = useState<number>(230);
  const [submitResult, setSubmitResult] = useState<{ underReview?: boolean; message: string } | null>(null);

  const handleSubmit = () => {
    const res = submitChallengeEntry(selectedChallenge.id, entryValue);
    setSubmitResult({ underReview: res.underReview, message: res.message });
    setTimeout(() => {
      setIsSubmitModalOpen(false);
      setSubmitResult(null);
    }, 2500);
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 border-zinc-200">
        <div>
          <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" /> Verified PR Challenges
          </h2>
          <p className="text-xs text-zinc-500">Tamper-proof leaderboard with anti-cheat validation</p>
        </div>
      </div>

      {/* Challenge Cards Carousel / List */}
      <div className="space-y-4">
        {challenges.map(chal => {
          const isSelected = selectedChallenge.id === chal.id;
          return (
            <div
              key={chal.id}
              onClick={() => setSelectedChallenge(chal)}
              className={`rounded-3xl border p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-zinc-900 bg-white ring-2 ring-zinc-900 shadow-md'
                  : 'border-zinc-200 bg-zinc-50/70 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    {chal.type.toUpperCase()} CHALLENGE • {chal.endsIn}
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 mt-1">{chal.title}</h3>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                    <span>Target Metric: <strong>{chal.metric}</strong></span>
                    {chal.facilityName && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-700">
                        📍 {chal.facilityName}
                      </span>
                    )}
                  </div>
                </div>

                {chal.isAccepted ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Accepted
                  </span>
                ) : (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      acceptChallenge(chal.id);
                    }}
                    className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 px-3 py-1.5 text-xs font-black text-white shadow-xs hover:opacity-90 active:scale-95"
                  >
                    <Flame className="h-3.5 w-3.5 fill-white" /> Accept Challenge
                  </button>
                )}
              </div>

              {/* My Entry Status if exists */}
              {chal.myEntry && (
                <div className={`mt-3 rounded-2xl p-2.5 text-xs flex items-center justify-between ${
                  chal.myEntry.isUnderReview ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Your Attempt:</span>
                    <span className="font-black text-sm">{chal.myEntry.score}</span>
                    {chal.myEntry.isUnderReview && (
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-900 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Under Review (&gt;15% Jump)
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[11px]">Rank #{chal.myEntry.rank}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Challenge Live Leaderboard */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between border-b pb-3 border-zinc-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Live Verified Leaderboard
            </div>
            <h4 className="text-sm font-black text-zinc-900">{selectedChallenge.title}</h4>
          </div>

          {selectedChallenge.isAccepted && (
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="rounded-xl bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800"
            >
              Log Attempt
            </button>
          )}
        </div>

        {/* Leaderboard Rows */}
        <div className="mt-3 divide-y divide-zinc-100">
          {selectedChallenge.leaderboard.map(item => {
            const isMe = item.username === currentUser.username;
            return (
              <div
                key={item.username}
                className={`flex items-center justify-between py-2.5 px-2 rounded-xl transition-colors ${
                  isMe ? 'bg-amber-50/80 font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center font-black text-xs text-zinc-500">
                    {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                  </div>
                  <img src={item.avatar} alt={item.username} className="h-7 w-7 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-1 text-xs font-bold text-zinc-900">
                      <span>@{item.username}</span>
                      {isMe && <span className="text-[10px] text-amber-700">(You)</span>}
                    </div>
                    {item.isUnderReview ? (
                      <span className="text-[9px] font-semibold text-amber-700 flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" /> Pending Video Review
                      </span>
                    ) : (
                      <span className="text-[9px] text-emerald-600 flex items-center gap-0.5 font-semibold">
                        <ShieldCheck className="h-2.5 w-2.5" /> GPS / Turnstile Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-zinc-900">{item.score}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Entry Modal with Anti-Cheat Test */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-zinc-900">Log Challenge Attempt</h3>
            <p className="text-xs text-zinc-500">
              Only verified tracker logs from {selectedChallenge.facilityName || 'GPS sessions'} are permitted.
            </p>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <label className="text-[11px] font-bold text-zinc-500 uppercase">
                Input Result ({selectedChallenge.metric})
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  value={entryValue}
                  onChange={e => setEntryValue(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-black text-zinc-900"
                />
                <span className="text-xs font-bold text-zinc-500">KG</span>
              </div>
              <p className="mt-2 text-[10px] text-zinc-400">
                🛡️ Anti-Cheat Rule: Your baseline is 225 KG. Submitting &gt;258 KG (&gt;15% jump) will auto-flag as [Under Review] requiring video admin verification.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-2.5 text-xs text-zinc-600">
              <Video className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Lift proof video attached from camera roll (4K compressed to 720p).</span>
            </div>

            {submitResult && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                submitResult.underReview ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {submitResult.message}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-xs font-bold text-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white hover:bg-zinc-800"
              >
                Submit Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
