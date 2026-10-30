import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import { X, Send, ShieldCheck, Flame, ArrowRight, Building2, UserCheck, KeyRound } from 'lucide-react';
import { StampOverlay } from '../common/StampOverlay';

interface InboxViewProps {
  onClose: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({ onClose }) => {
  const { currentUser, switchRole, showToast } = useEcosystem();

  const [activeTab, setActiveTab] = useState<'primary' | 'requests'>('primary');
  const [selectedThread, setSelectedThread] = useState<'coach_marcus' | 'staff_handshake' | null>('staff_handshake');
  const [messageInput, setMessageInput] = useState('');
  const [isHandshakeAccepted, setIsHandshakeAccepted] = useState(false);
  const [staffPin, setStaffPin] = useState('1234');

  const handleAcceptHandshake = () => {
    setIsHandshakeAccepted(true);
    switchRole('staff');
    showToast('🎉 B2B Handshake accepted! 4-Digit POS PIN (1234) issued. Welcome to Twins Fitness staff!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
      <div className="flex h-full max-h-[90vh] w-full max-w-2xl flex-col sm:flex-row overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        {/* Left: Threads List */}
        <div className="w-full sm:w-72 border-r border-zinc-200 flex flex-col bg-zinc-50/50">
          <div className="flex items-center justify-between p-3.5 border-b border-zinc-200">
            <h3 className="text-sm font-black text-zinc-900">Direct Messages</h3>
            <button onClick={onClose} className="sm:hidden text-zinc-500 hover:text-zinc-800">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Segmented Tabs (Section 2.9) */}
          <div className="flex border-b border-zinc-200 bg-zinc-100 p-1">
            <button
              onClick={() => setActiveTab('primary')}
              className={`flex-1 rounded-lg py-1 text-xs font-bold transition-all ${
                activeTab === 'primary' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
              }`}
            >
              Primary
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 rounded-lg py-1 text-xs font-bold transition-all ${
                activeTab === 'requests' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
              }`}
            >
              Requests (1)
            </button>
          </div>

          {/* Thread Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
            {/* Handshake Thread */}
            <div
              onClick={() => setSelectedThread('staff_handshake')}
              className={`flex items-center gap-2.5 p-3 cursor-pointer transition-colors ${
                selectedThread === 'staff_handshake' ? 'bg-amber-50/80 border-l-4 border-amber-500' : 'hover:bg-zinc-100/60'
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-zinc-900 truncate">Twins Fitness BGC</span>
                  <span className="text-[10px] text-zinc-400">09:12 AM</span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate font-semibold text-blue-700">
                  📋 Official Staff Handshake Invite
                </p>
              </div>
            </div>

            {/* Coach Marcus Thread */}
            <div
              onClick={() => setSelectedThread('coach_marcus')}
              className={`flex items-center gap-2.5 p-3 cursor-pointer transition-colors ${
                selectedThread === 'coach_marcus' ? 'bg-zinc-100 border-l-4 border-zinc-900' : 'hover:bg-zinc-100/60'
              }`}
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80"
                alt="Coach Marcus"
                className="h-9 w-9 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-zinc-900 truncate">Coach Marcus</span>
                  <span className="text-[10px] text-zinc-400">Yesterday</span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">
                  Checked your 225kg lockout video. Insane pace!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Active Chat Viewport */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b p-3 border-zinc-200">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-black text-zinc-900">
                {selectedThread === 'staff_handshake' ? 'Twins Fitness Official (B2B)' : 'Coach Marcus Pro'}
              </span>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50/40">
            {selectedThread === 'staff_handshake' ? (
              <div className="space-y-3">
                {/* B2B Staff Handshake Card (Master Flowchart Deep Dive 33) */}
                <div className="rounded-3xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
                    <Building2 className="h-5 w-5 text-blue-700" />
                    <span>Twins Fitness BGC Staff Onboarding</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Twins Fitness BGC has officially invited you to join the team as <strong>Front Desk Staff & Floor Trainer</strong>. 
                    Accepting maps your profile to the facility roster and grants cash drawer / gate scanner access.
                  </p>

                  {isHandshakeAccepted ? (
                    <div className="rounded-2xl bg-emerald-100 p-3 text-xs text-emerald-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-emerald-700" /> Role Active: Verified Staff Member
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono font-bold bg-white/70 px-2 py-1 rounded">
                        <KeyRound className="h-3.5 w-3.5 text-zinc-600" /> POS PIN: 1234 (Assigned)
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1 flex gap-2">
                      <button
                        onClick={handleAcceptHandshake}
                        className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-black text-white hover:bg-blue-800 shadow-sm transition-transform active:scale-95"
                      >
                        Review & Accept Role
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Coach message with Interactive Stamp bubble */}
                <div className="max-w-[85%] rounded-2xl bg-zinc-200 p-3 text-xs text-zinc-900">
                  Hey Darelle! Saw your 225kg PR attempt. Check this stamp breakdown:
                </div>

                <div className="max-w-[85%] rounded-2xl bg-white border border-zinc-200 p-3 shadow-xs space-y-2">
                  <StampOverlay
                    stamp={{
                      id: 'stmp_chat_1',
                      type: 'lift',
                      timestamp: 'Oct 28 • 06:45 AM',
                      title: 'VERIFIED PR',
                      primaryMetric: '225 KG x 4',
                      subMetrics: ['RPE 9.5', 'Bar Velocity: 0.32 m/s', 'Eleiko Bar'],
                      isVerified: true,
                      isPR: true,
                      facilityName: 'Twins Fitness BGC'
                    }}
                  />

                  {/* Deep Link to Raw Data (Screen 2.9) */}
                  <div className="flex items-center justify-between border-t pt-2 text-[11px] font-bold">
                    <button
                      onClick={() => showToast('Opening set-by-set raw data grid & velocity curve for Coach review.')}
                      className="text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      View Raw Data <ArrowRight className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => showToast('🔥 Sent Fire Congratulate reaction!')}
                      className="flex items-center gap-1 text-amber-600 font-black hover:scale-105 transition-transform"
                    >
                      <Flame className="h-3.5 w-3.5 fill-amber-500" /> Congratulate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Row */}
          <div className="border-t p-3 border-zinc-200 flex items-center gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              placeholder="Type message or paste workout log link..."
              className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            />
            <button
              onClick={() => {
                if (!messageInput) return;
                setMessageInput('');
                showToast('Message sent!');
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white hover:bg-zinc-800"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
