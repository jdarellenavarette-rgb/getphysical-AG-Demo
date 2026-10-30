import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import { X, Image, MapPin, Dumbbell, Activity, UtensilsCrossed, CheckCircle2 } from 'lucide-react';
import { VerifiedStamp } from '../../types';

interface CreatePostModalProps {
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const { currentUser, postAsRole, setPostAsRole, facilities, createPost } = useEcosystem();

  const [caption, setCaption] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilities[0].id);
  const [attachedStampType, setAttachedStampType] = useState<'lift' | 'move' | 'food' | null>('lift');

  const selectedFacility = facilities.find(f => f.id === selectedFacilityId) || facilities[0];

  const handlePublish = () => {
    let stamp: VerifiedStamp | undefined;
    if (attachedStampType === 'lift') {
      stamp = {
        id: 'stmp_user_' + Date.now(),
        type: 'lift',
        timestamp: 'Just now',
        title: 'VERIFIED PR LIFT',
        primaryMetric: '225 KG x 4',
        subMetrics: ['RPE 9.5', selectedFacility.name, 'Calibrated Steel Plates'],
        isVerified: true,
        isPR: true,
        facilityName: selectedFacility.name
      };
    } else if (attachedStampType === 'move') {
      stamp = {
        id: 'stmp_user_' + Date.now(),
        type: 'move',
        timestamp: 'Just now',
        title: 'VERIFIED GPS RUN',
        primaryMetric: '5.20 KM • 26:15 min',
        subMetrics: ['Pace: 5:03 /km', 'Heart Rate: Avg 152 BPM', 'Manila Trail Route'],
        isVerified: true
      };
    } else if (attachedStampType === 'food') {
      stamp = {
        id: 'stmp_user_' + Date.now(),
        type: 'food',
        timestamp: 'Just now',
        title: 'CLOSED DAILY MACROS',
        primaryMetric: '2,350 KCAL / 2,400',
        subMetrics: ['178g Protein (100%)', '240g Carbs', '65g Fats'],
        isVerified: true
      };
    }

    const facilityTag = {
      id: selectedFacility.id,
      name: selectedFacility.name,
      registry: selectedFacility.registry,
      actionCTA: selectedFacility.registry === 'A' ? `Drop In (₱${selectedFacility.dayPassPrice})` : `Book Court (₱${selectedFacility.courtHourlyPrice}/hr)`,
      price: selectedFacility.dayPassPrice
    };

    createPost(
      caption || 'Crushed today’s session! Consistency pays off.',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      facilityTag,
      stamp
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-zinc-100">
          <div>
            <h3 className="text-base font-black text-zinc-900">Create Sodia Post</h3>
            <p className="text-[11px] text-zinc-400">Post updates, verified stamps & facility tags</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Post As Selector (Screen 2.3 & Deep Dive 29) */}
        <div>
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Identity / Post As:
          </label>
          <div className="mt-1 flex gap-2">
            {(['individual', 'facility', 'coach'] as const).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setPostAsRole(role)}
                className={`flex-1 rounded-xl py-1.5 text-xs font-bold capitalize transition-all ${
                  postAsRole === role
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {role === 'individual' ? `@${currentUser.username}` : role === 'facility' ? 'Twins Fitness' : 'Coach Pro'}
              </button>
            ))}
          </div>
        </div>

        {/* Caption with 280-char counter */}
        <div>
          <textarea
            rows={3}
            maxLength={280}
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Share today's PR, workout log, or hype up the community..."
            className="w-full rounded-2xl border border-zinc-200 p-3 text-xs focus:border-zinc-950 focus:outline-hidden"
          />
          <div className="text-right text-[10px] text-zinc-400">
            {caption.length} / 280 characters
          </div>
        </div>

        {/* Facility Tag Selector (Auto-generates POS Pill) */}
        <div>
          <label className="text-[11px] font-bold text-zinc-500 uppercase flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Tag Facility (Generates Direct POS Pill)
          </label>
          <select
            value={selectedFacilityId}
            onChange={e => setSelectedFacilityId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 p-2 text-xs font-semibold text-zinc-800 focus:outline-hidden"
          >
            {facilities.map(fac => (
              <option key={fac.id} value={fac.id}>
                {fac.name} (Registry {fac.registry} - {fac.registry === 'A' ? '₱' + fac.dayPassPrice + ' Day Pass' : '₱' + fac.courtHourlyPrice + '/hr Court'})
              </option>
            ))}
          </select>
        </div>

        {/* Attach Tamper-proof Stamp Widget */}
        <div>
          <label className="text-[11px] font-bold text-zinc-500 uppercase">
            Attach Verified Data Stamp
          </label>
          <div className="mt-1 grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setAttachedStampType(attachedStampType === 'lift' ? null : 'lift')}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-bold border transition-all ${
                attachedStampType === 'lift'
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Dumbbell className="h-4 w-4" />
              <span>Lift Stamp</span>
            </button>
            <button
              type="button"
              onClick={() => setAttachedStampType(attachedStampType === 'move' ? null : 'move')}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-bold border transition-all ${
                attachedStampType === 'move'
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Move GPS</span>
            </button>
            <button
              type="button"
              onClick={() => setAttachedStampType(attachedStampType === 'food' ? null : 'food')}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-bold border transition-all ${
                attachedStampType === 'food'
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span>Food Stamp</span>
            </button>
            <button
              type="button"
              onClick={() => setAttachedStampType(null)}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-bold border transition-all ${
                attachedStampType === null
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <span>None</span>
            </button>
          </div>
        </div>

        {/* Publish CTA */}
        <button
          onClick={handlePublish}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-3 text-xs font-black text-white hover:bg-zinc-800 transition-all shadow-md active:scale-[0.99]"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Post to Sodia Feed</span>
        </button>
      </div>
    </div>
  );
};
