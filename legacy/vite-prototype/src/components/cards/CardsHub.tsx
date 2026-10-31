import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  MapPin,
  Coins,
  Ticket,
  Plus,
  Send,
  X,
  ChevronRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { ExactVIPCard } from './ExactVIPCard';
import { LedgerTransaction } from '../../types';

export const CardsHub: React.FC = () => {
  const {
    currentUser,
    passes,
    activePassIndex,
    isQRFlapped,
    setIsQRFlapped,
    qrCountdown,
    ledger,
    voidOrRefundTransaction,
    sendPassToFriend,
    openCheckout,
    facilities,
    showToast
  } = useEcosystem();

  const [selectedLedgerTx, setSelectedLedgerTx] = useState<LedgerTransaction | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [friendUsername, setFriendUsername] = useState('sarah_lifts');
  const [isFullHistoryOpen, setIsFullHistoryOpen] = useState(false);
  const [managerPinInput, setManagerPinInput] = useState('');
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const activePass = passes[activePassIndex] || passes[0];

  const handleFlipCard = () => {
    setIsQRFlapped(!isQRFlapped);
    if (!isQRFlapped) {
      showToast('☀️ Screen brightness auto-maximized for optical turnstile scan.');
    }
  };

  const handleSendPass = () => {
    if (!activePass) return;
    sendPassToFriend(activePass.id, friendUsername);
    setIsSendModalOpen(false);
  };

  const handleExecuteRefund = () => {
    if (!selectedLedgerTx) return;
    const success = voidOrRefundTransaction(selectedLedgerTx.id, managerPinInput);
    if (success) {
      setIsRefundModalOpen(false);
      setSelectedLedgerTx(null);
      setManagerPinInput('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-28 select-none">
      <div className="max-w-md mx-auto px-4 pt-3 space-y-4">
        {/* User Profile Header (Exact match: Avatar + Adam Arête) */}
        <div className="flex items-center gap-3.5 px-1 pt-1">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-white/50 shadow-xl"
          />
          <h1 className="text-2xl sm:text-[26px] font-black text-white tracking-tight">
            {currentUser.name}
          </h1>
        </div>

        {/* The Exact Membership Card Component */}
        <div className="pt-1">
          <ExactVIPCard
            pass={activePass}
            isFlipped={isQRFlapped}
            onFlip={handleFlipCard}
            qrCountdown={qrCountdown}
          />
        </div>

        {/* Quick Venue Actions (Add Pass / Send to Friend) */}
        <div className="flex items-center justify-between gap-3 px-1">
          <button
            onClick={() => openCheckout(facilities[0], 'Day Pass', facilities[0].dayPassPrice)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 py-2.5 text-xs font-bold text-white transition-all active:scale-95 shadow-sm"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            <span>Add Venue Pass</span>
          </button>
          <button
            onClick={() => setIsSendModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 py-2.5 text-xs font-bold text-white transition-all active:scale-95 shadow-sm"
          >
            <Send className="h-3.5 w-3.5 text-[#ec4899]" />
            <span>Send / Gift</span>
          </button>
        </div>
      </div>

      {/* Pure White Curved Sheet ("Transaction History" - Exact Match to Screenshot) */}
      <div className="mt-5 rounded-t-[38px] bg-white text-black px-5 pt-7 pb-24 shadow-2xl">
        <div className="max-w-md mx-auto">
          {/* Section Title: Transaction History */}
          <h2 className="text-xl sm:text-[22px] font-black text-black text-center mb-5 tracking-tight">
            Transaction History
          </h2>

          {/* Transaction Cards List */}
          <div className="space-y-3">

            {/* Card 1: Sprout Pickleball Club */}
            <div
              onClick={() => setSelectedLedgerTx(ledger[0])}
              className="group flex items-center justify-between rounded-2xl border border-zinc-150 bg-white p-3.5 shadow-xs hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Orange Circle with Map Pin */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-400/60 bg-orange-50 text-[#f97316]">
                  <MapPin className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-black leading-snug">
                    Sprout Pickleball Club
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Check-in: Today, 01:32PM
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black text-black">
                  FREE/PASS
                </div>
                <div className="text-xs text-zinc-400 font-medium">
                  PHP 999
                </div>
              </div>
            </div>

            {/* Card 2: AMP FITNESS SJDM */}
            <div
              onClick={() => setSelectedLedgerTx(ledger[1] || ledger[0])}
              className="group flex items-center justify-between rounded-2xl border border-zinc-150 bg-white p-3.5 shadow-xs hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Orange Circle with Cylinder/Coins */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-400/60 bg-orange-50 text-[#f97316]">
                  <Coins className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-black leading-snug">
                    AMP FITNESS SJDM
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Membership: Yesterday, 11:01AM
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black text-black">
                  MONTHLY
                </div>
                <div className="text-xs text-zinc-400 font-medium">
                  PHP 799
                </div>
              </div>
            </div>

            {/* Card 3: GetPhysical+ */}
            <div
              onClick={() => setSelectedLedgerTx(ledger[2] || ledger[0])}
              className="group flex items-center justify-between rounded-2xl border border-zinc-150 bg-white p-3.5 shadow-xs hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Purple Circle with Pass/Ticket */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-purple-400/60 bg-purple-50 text-[#9333ea]">
                  <Ticket className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-black leading-snug">
                    GetPhysical+
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Subscription: Yesterday, 06:48AM
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black text-black">
                  MONTHLY
                </div>
                <div className="text-xs text-zinc-400 font-medium">
                  PHP 149
                </div>
              </div>
            </div>
          </div>

          {/* Gradient Button: VIEW FULL HISTORY (Exact Coral to Magenta Gradient) */}
          <div className="pt-6">
            <button
              onClick={() => setIsFullHistoryOpen(true)}
              className="w-full sm:w-auto mx-auto flex items-center justify-center rounded-full bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#d946ef] px-8 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-pink-500/25 hover:opacity-95 active:scale-95 transition-all"
            >
              VIEW FULL HISTORY
            </button>
          </div>
        </div>
      </div>

      {/* Full Statement of Account (SOA) Modal */}
      {isFullHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-t-[36px] sm:rounded-[32px] bg-white text-black p-6 shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-black">
                  Fitness SOA Ledger
                </h3>
                <p className="text-xs text-zinc-500">Immutable transaction audit trail</p>
              </div>
              <button
                onClick={() => setIsFullHistoryOpen(false)}
                className="rounded-full p-2 text-zinc-400 hover:text-black hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Ledger Rows */}
            <div className="divide-y divide-zinc-100 overflow-y-auto py-3 space-y-1">
              {ledger.map(tx => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedLedgerTx(tx)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-extrabold text-black">{tx.facilityName}</div>
                    <div className="text-[11px] text-zinc-500">{tx.action}</div>
                    <div className="text-[10px] text-zinc-400">{tx.timestamp} · {tx.paymentMethod}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-black ${tx.amount < 0 ? 'text-rose-600' : 'text-black'}`}>
                      {tx.amount === 0 ? 'FREE/PASS' : `PHP ${tx.amount}`}
                    </div>
                    <div className="text-[9px] font-mono text-zinc-400">{tx.referenceNo}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsFullHistoryOpen(false)}
              className="mt-3 w-full rounded-2xl bg-zinc-950 py-3 text-xs font-extrabold text-white hover:bg-zinc-800"
            >
              Close Ledger
            </button>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedLedgerTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[32px] bg-white text-black p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Transaction Audit</span>
                <h3 className="text-base font-black text-black">{selectedLedgerTx.facilityName}</h3>
              </div>
              <button
                onClick={() => setSelectedLedgerTx(null)}
                className="rounded-full p-1 text-zinc-400 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Action</span>
                <span className="font-extrabold text-black">{selectedLedgerTx.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Time</span>
                <span className="font-bold text-black">{selectedLedgerTx.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Method</span>
                <span className="font-bold text-black">{selectedLedgerTx.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Reference No</span>
                <span className="font-mono font-bold text-black">{selectedLedgerTx.referenceNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Total Tendered</span>
                <span className="font-black text-black text-sm">
                  {selectedLedgerTx.amount === 0 ? 'FREE / PASS' : `PHP ${selectedLedgerTx.amount}`}
                </span>
              </div>
            </div>

            {/* Manager Refund Override Trigger */}
            <div className="pt-2">
              <button
                onClick={() => setIsRefundModalOpen(true)}
                className="w-full rounded-2xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                Manager Reversal / Refund (PIN 1234)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Refund PIN Prompt Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-[32px] bg-white text-black p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-black text-black">Manager Security Override</h4>
            <p className="text-xs text-zinc-500">
              Enter 4-digit Manager PIN (1234) to append an immutable reversal entry:
            </p>
            <input
              type="password"
              maxLength={4}
              value={managerPinInput}
              onChange={e => setManagerPinInput(e.target.value)}
              placeholder="••••"
              className="w-full rounded-2xl border border-zinc-300 p-3 text-center text-lg font-mono font-black tracking-widest focus:outline-hidden focus:ring-2 focus:ring-pink-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setIsRefundModalOpen(false); setManagerPinInput(''); }}
                className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-xs font-bold text-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRefund}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-extrabold text-white hover:bg-rose-700"
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Pass Modal */}
      {isSendModalOpen && activePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[32px] bg-white text-black p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-black">Gift Pass to Friend</h3>
            <p className="text-xs text-zinc-500">
              Transferring <strong>{activePass.passType} ({activePass.facilityName})</strong> will reassign ownership and update the ledger.
            </p>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Recipient Username</label>
              <input
                type="text"
                value={friendUsername}
                onChange={e => setFriendUsername(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-zinc-300 p-3 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsSendModalOpen(false)}
                className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-xs font-bold text-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendPass}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ec4899] py-2.5 text-xs font-black text-white hover:opacity-95"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
