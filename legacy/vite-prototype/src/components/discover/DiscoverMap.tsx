import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  Search,
  MapPin,
  Flame,
  Users,
  Compass,
  List,
  Map as MapIcon,
  ShieldCheck,
  Star,
  X,
  Bookmark,
  Navigation,
  Sparkles,
  Building2,
  Calendar
} from 'lucide-react';
import { Facility } from '../../types';

export const DiscoverMap: React.FC = () => {
  const { facilities, openCheckout, acceptChallenge } = useEcosystem();

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedPinFacility, setSelectedPinFacility] = useState<Facility | null>(facilities[0]);
  const [isLocationDenied, setIsLocationDenied] = useState(false);
  const [zipFallback, setZipFallback] = useState('1634');

  const filters = ['All', 'Gyms (Reg A)', 'Courts & Clubs (Reg B)', 'Active Challenges', 'Open Now', 'Coach Pro'];

  const filteredFacilities = facilities.filter(fac => {
    if (activeFilter === 'Gyms (Reg A)' && fac.registry !== 'A') return false;
    if (activeFilter === 'Courts & Clubs (Reg B)' && fac.registry !== 'B') return false;
    if (activeFilter === 'Active Challenges' && !fac.hasActiveChallenge) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        fac.name.toLowerCase().includes(q) ||
        fac.category.toLowerCase().includes(q) ||
        fac.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="relative h-[calc(100vh-115px)] w-full overflow-hidden bg-zinc-900">
      {/* Top Search Bar & Filters */}
      <div className="absolute top-3 left-3 right-3 z-30 space-y-2 max-w-xl mx-auto">
        <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2.5 ios-card-shadow backdrop-blur-xl border border-white/60">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search gyms, courts, coaches, or challenges..."
            className="w-full text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-3 py-1.5 text-xs font-extrabold text-white shadow-xs transition-all"
          >
            {viewMode === 'map' ? <List className="h-3.5 w-3.5" /> : <MapIcon className="h-3.5 w-3.5" />}
            <span>{viewMode === 'map' ? 'List' : 'Map'}</span>
          </button>
        </div>

        {/* Filter Chips Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white/90 text-slate-700 hover:bg-white border border-white/60 backdrop-blur-md'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport: Map View or List View */}
      {viewMode === 'list' ? (
        <div className="h-full overflow-y-auto pt-24 px-4 pb-28 max-w-xl mx-auto space-y-3">
          {filteredFacilities.map(fac => (
            <div
              key={fac.id}
              onClick={() => setSelectedPinFacility(fac)}
              className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={fac.logo} alt={fac.name} className="h-11 w-11 rounded-2xl object-cover border" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-zinc-900">{fac.name}</span>
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold text-zinc-600">
                        Reg {fac.registry}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-medium">{fac.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-zinc-900">
                    {fac.registry === 'A' ? `₱${fac.dayPassPrice} Pass` : `₱${fac.courtHourlyPrice}/hr`}
                  </span>
                  <div className="text-[10px] text-zinc-400">{fac.distance}</div>
                </div>
              </div>

              {fac.hasActiveChallenge && (
                <div className="rounded-xl bg-amber-50 p-2 text-[11px] font-bold text-amber-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    {fac.challengeTitle}
                  </span>
                  <span className="text-amber-700">Accept ➔</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-2 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Capacity: {fac.liveCapacity.current}/{fac.liveCapacity.max} Active
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    openCheckout(fac, fac.registry === 'A' ? 'Day Pass' : 'Court Booking', fac.dayPassPrice);
                  }}
                  className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-white hover:bg-zinc-800"
                >
                  {fac.registry === 'A' ? 'Drop In' : 'Book Court'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Full-Screen Mapbox Canvas Simulation */
        <div className="relative h-full w-full">
          {/* Simulated Vector Map Tile Background */}
          <div className="absolute inset-0 bg-[#0f172a] overflow-hidden">
            <svg className="h-full w-full opacity-25" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#334155" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Roads / City geometry lines */}
              <path d="M0,150 Q400,200 800,100 T1600,300" fill="none" stroke="#475569" strokeWidth="8" />
              <path d="M200,0 Q300,500 500,1000" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.6" />
              <path d="M700,0 Q600,450 900,1000" fill="none" stroke="#64748b" strokeWidth="6" />
              <path d="M0,450 L1600,550" fill="none" stroke="#cbd5e1" strokeWidth="4" opacity="0.3" />
            </svg>
          </div>

          {/* Location Denied Fallback Simulation (Screen 3.6) */}
          {isLocationDenied && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
              <div className="max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center space-y-3">
                <MapPin className="mx-auto h-8 w-8 text-amber-500" />
                <h3 className="text-base font-black text-zinc-900">Location Services Needed</h3>
                <p className="text-xs text-zinc-500">
                  We need your coordinates to show nearby gym check-in capacity and verified challenges.
                </p>
                <input
                  type="text"
                  value={zipFallback}
                  onChange={e => setZipFallback(e.target.value)}
                  placeholder="Enter Zip Code or City (e.g. 1634 BGC)"
                  className="w-full rounded-xl border border-zinc-300 p-2 text-xs text-center font-bold"
                />
                <button
                  onClick={() => setIsLocationDenied(false)}
                  className="w-full rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white hover:bg-zinc-800"
                >
                  Confirm Location & Unlock Map
                </button>
              </div>
            </div>
          )}

          {/* Interactive Map Pins */}
          {/* Pin 1: Twins Fitness BGC (Active Challenge Fire Badge) */}
          <div
            onClick={() => setSelectedPinFacility(facilities[0])}
            className="absolute top-[38%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
          >
            <div className="relative flex flex-col items-center">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 p-1 text-white shadow-2xl ring-4 ring-amber-400 group-hover:scale-110 transition-transform">
                <img src={facilities[0].logo} alt="Twins" className="h-full w-full rounded-xl object-cover" />
                {/* Glowing Fire Badge */}
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg animate-bounce">
                  <Flame className="h-3.5 w-3.5 fill-white" />
                </span>
              </div>
              <div className="mt-1 rounded-full bg-zinc-900/90 px-2 py-0.5 text-[9px] font-black text-white backdrop-blur-xs whitespace-nowrap shadow-md">
                Twins Fitness • ₱250
              </div>
            </div>
          </div>

          {/* Pin 2: Metro Sports Arena (Registry B Court Pin) */}
          <div
            onClick={() => setSelectedPinFacility(facilities[1])}
            className="absolute top-[52%] left-[68%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
          >
            <div className="relative flex flex-col items-center">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 p-1 text-white shadow-2xl ring-4 ring-emerald-400 group-hover:scale-110 transition-transform">
                <img src={facilities[1].logo} alt="Metro" className="h-full w-full rounded-xl object-cover" />
              </div>
              <div className="mt-1 rounded-full bg-zinc-900/90 px-2 py-0.5 text-[9px] font-black text-white backdrop-blur-xs whitespace-nowrap shadow-md">
                Metro Arena • ₱200/hr
              </div>
            </div>
          </div>

          {/* Pin 3: Iron Vault */}
          <div
            onClick={() => setSelectedPinFacility(facilities[2])}
            className="absolute top-[62%] left-[28%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
          >
            <div className="relative flex flex-col items-center">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 p-1 text-white shadow-2xl ring-2 ring-white/60 group-hover:scale-110 transition-transform">
                <img src={facilities[2].logo} alt="Iron" className="h-full w-full rounded-xl object-cover" />
              </div>
              <div className="mt-1 rounded-full bg-zinc-900/90 px-2 py-0.5 text-[9px] font-black text-white backdrop-blur-xs whitespace-nowrap shadow-md">
                Iron Vault
              </div>
            </div>
          </div>

          {/* Pin 4: Freelance Coach 24-hr Park Session Pin (Screen 3.1) */}
          <div
            onClick={() => setSelectedPinFacility(facilities[0])}
            className="absolute top-[28%] left-[72%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
          >
            <div className="relative flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg ring-2 ring-purple-300">
                <Users className="h-4 w-4" />
              </div>
              <div className="mt-1 rounded-full bg-purple-950/90 px-2 py-0.5 text-[8px] font-bold text-purple-200">
                Coach Marcus (Park Pop-up)
              </div>
            </div>
          </div>

          {/* Center on Me & Location Fallback FABs (Bottom Left) */}
          <div className="absolute bottom-48 left-4 z-20 flex flex-col gap-2">
            <button
              onClick={() => setIsLocationDenied(!isLocationDenied)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-800 shadow-xl hover:bg-zinc-100"
              title="Toggle Location Denied Simulation"
            >
              <Compass className="h-5 w-5" />
            </button>
          </div>

          {/* Map Pin Bottom Sheet (Screen 3.2) */}
          {selectedPinFacility && (
            <div className="absolute bottom-16 left-3 right-3 z-30 max-w-lg mx-auto rounded-[28px] bg-white p-5 ios-card-floating border border-white/80 animate-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPinFacility.logo}
                    alt={selectedPinFacility.name}
                    className="h-12 w-12 rounded-2xl object-cover shadow-sm border border-slate-100"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-extrabold text-[#2563EB] tracking-tight">{selectedPinFacility.name}</h4>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                        Reg {selectedPinFacility.registry}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {selectedPinFacility.address} ({selectedPinFacility.distance})
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                      <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {selectedPinFacility.liveCapacity.current}/{selectedPinFacility.liveCapacity.max} Active
                      </span>
                      <span className="text-slate-300 font-bold">·</span>
                      <span className="text-slate-600 font-semibold">{selectedPinFacility.hours}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPinFacility(null)}
                  className="rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Social Proof (Screen 3.2: 3 friends checked in) */}
              {selectedPinFacility.friendsCheckedIn && (
                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 p-2.5 text-[11px] text-slate-700">
                  <Users className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />
                  <span>
                    <strong className="text-slate-900">3 friends checked in:</strong> {selectedPinFacility.friendsCheckedIn.join(', ')}
                  </span>
                </div>
              )}

              {/* Active Challenge CTA inside Pin Sheet */}
              {selectedPinFacility.hasActiveChallenge && (
                <div className="mt-2.5 flex items-center justify-between rounded-2xl bg-amber-50/80 p-2.5 text-xs font-bold text-amber-900 border border-amber-200/60">
                  <span className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                    {selectedPinFacility.challengeTitle}
                  </span>
                  <button
                    onClick={() => acceptChallenge('chal_deadlift_01')}
                    className="rounded-full bg-amber-500 hover:bg-amber-600 px-3 py-1 text-[10px] font-extrabold text-white transition-all shadow-xs"
                  >
                    Accept
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3.5 flex gap-2">
                <button
                  onClick={() =>
                    openCheckout(
                      selectedPinFacility,
                      selectedPinFacility.registry === 'A' ? 'Day Pass' : 'Court Booking',
                      selectedPinFacility.dayPassPrice
                    )
                  }
                  className="flex-1 rounded-2xl bg-[#2563EB] hover:bg-blue-700 py-3 text-xs font-extrabold text-white ios-card-shadow transition-all"
                >
                  {selectedPinFacility.registry === 'A'
                    ? `Drop In (₱${selectedPinFacility.dayPassPrice})`
                    : `Book Court (₱${selectedPinFacility.courtHourlyPrice}/hr)`}
                </button>

                <button
                  onClick={() =>
                    openCheckout(
                      selectedPinFacility,
                      'Monthly Pro',
                      selectedPinFacility.monthlySubPrice || 1500
                    )
                  }
                  className="rounded-2xl bg-slate-100 hover:bg-slate-200 px-4 py-3 text-xs font-bold text-slate-800 transition-colors"
                >
                  View Subs
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
