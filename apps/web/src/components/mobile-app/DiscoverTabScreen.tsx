'use client';

import React, { useState } from 'react';
import { MapPin, Users, Filter, Sparkles, Navigation, CheckCircle } from 'lucide-react';
import { calculateHybridServiceFee } from 'sodia-core';

interface FacilityItem {
  id: string;
  name: string;
  category: 'Gym' | 'Pickleball' | 'Padel' | 'Combat';
  address: string;
  occupancy: number;
  capacity: number;
  dropInPrice: number;
  distance: string;
}

const VENUES: FacilityItem[] = [
  { id: '1', name: 'Metro Sports Complex (Arena 01)', category: 'Gym', address: 'BGC, Taguig City', occupancy: 42, capacity: 100, dropInPrice: 350, distance: '0.8 km' },
  { id: '2', name: 'Sprout Pickleball Club', category: 'Pickleball', address: 'Brgy. San Antonio, Pasig', occupancy: 18, capacity: 24, dropInPrice: 250, distance: '1.4 km' },
  { id: '3', name: 'AMP Fitness SJDM', category: 'Gym', address: 'City of San Jose del Monte', occupancy: 31, capacity: 60, dropInPrice: 200, distance: '2.1 km' },
  { id: '4', name: 'Padel Club Manila', category: 'Padel', address: 'Circuit Makati', occupancy: 8, capacity: 16, dropInPrice: 400, distance: '3.5 km' },
];

export function DiscoverTabScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const filtered = selectedCategory === 'All' ? VENUES : VENUES.filter(v => v.category === selectedCategory);

  const fee = selectedFacility ? calculateHybridServiceFee(selectedFacility.dropInPrice, 'one_time_pass') : null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#09090b', color: '#fff', overflowY: 'auto', padding: '16px 16px 90px' }}>
      {/* Search & Location Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '10px 14px', marginBottom: '14px' }}>
        <MapPin size={18} color="#ec4899" />
        <span style={{ fontSize: '13px', color: '#f4f4f5', fontWeight: 600 }}>Nearby • Metro Manila (10 km radius)</span>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
        {['All', 'Gym', 'Pickleball', 'Padel'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
              backgroundColor: selectedCategory === cat ? '#ec4899' : '#18181b',
              color: selectedCategory === cat ? '#fff' : '#a1a1aa',
              border: `1px solid ${selectedCategory === cat ? '#ec4899' : '#27272a'}`, cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Facilities List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((venue) => {
          const capPercent = Math.round((venue.occupancy / venue.capacity) * 100);
          return (
            <div
              key={venue.id}
              style={{
                backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '14px',
                display: 'flex', flexDirection: 'column', gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#f4f4f5' }}>{venue.name}</div>
                  <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>{venue.address} • {venue.distance}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#ec489920', color: '#ec4899' }}>
                  {venue.category}
                </span>
              </div>

              {/* Live Occupancy Gauge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#a1a1aa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Users size={13} color="#10b981" />
                  <span>Live Inside: <strong style={{ color: '#fff' }}>{venue.occupancy}/{venue.capacity}</strong></span>
                </div>
                <span style={{ color: capPercent > 80 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                  {capPercent}% Capacity
                </span>
              </div>

              {/* Action Drop-in Button */}
              <button
                onClick={() => { setSelectedFacility(venue); setCheckoutDone(false); }}
                style={{
                  backgroundColor: '#ffffff', color: '#000000', padding: '9px 14px', borderRadius: '10px',
                  fontSize: '12px', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <span>Instant Drop-In Pass</span>
                <span>₱{venue.dropInPrice}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Universal Checkout Bottom Sheet */}
      {selectedFacility && fee && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ backgroundColor: '#141417', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', borderTop: '1px solid #27272a', maxWidth: '440px', width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#f4f4f5' }}>Universal Checkout</span>
              <button onClick={() => setSelectedFacility(null)} style={{ color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            {!checkoutDone ? (
              <>
                <div style={{ backgroundColor: '#1e1e24', padding: '12px', borderRadius: '12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{selectedFacility.name}</div>
                  <div style={{ fontSize: '11px', color: '#a1a1aa' }}>Single Entry Turnstile Day Pass</div>
                  <div style={{ marginTop: '10px', borderTop: '1px solid #2a2a32', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                      <span>Facility Pass Fee:</span>
                      <span>₱{selectedFacility.dropInPrice}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ec4899', fontWeight: 700 }}>
                      <span>GetPhysical Hybrid Fee:</span>
                      <span>₱{fee.serviceFeePhp} (Fixed)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 900, fontSize: '14px', paddingTop: '6px' }}>
                      <span>Total Billed:</span>
                      <span>₱{fee.totalChargePhp}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutDone(true)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)', color: '#fff', fontWeight: 900, fontSize: '13px', border: 'none', cursor: 'pointer' }}
                >
                  Confirm & Provision Dynamic Turnstile Pass
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>Pass Ready!</div>
                <div style={{ fontSize: '12px', color: '#a1a1aa', margin: '4px 0 16px' }}>
                  Pass provisioned in your VIP Wallet. Tap the VIP card to scan turnstile.
                </div>
                <button
                  onClick={() => setSelectedFacility(null)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#27272a', color: '#fff', fontWeight: 700, fontSize: '12px', border: 'none', cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
