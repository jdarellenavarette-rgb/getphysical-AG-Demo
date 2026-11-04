'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, QrCode } from 'lucide-react';
import { generateDynamicPassTotp, calculateHybridServiceFee } from 'sodia-core';

interface SodiaMobileSimulatorProps { onTriggerTurnstileScan?: () => void; }

export function SodiaMobileSimulator({ onTriggerTurnstileScan }: SodiaMobileSimulatorProps) {
  const [mTab, setMTab] = useState<'sodia' | 'cards' | 'track' | 'organizer' | 'dm'>('sodia');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [totpCode, setTotpCode] = useState('482-911');
  const [ttl, setTtl] = useState(60);
  const [likedPost, setLikedPost] = useState(false);
  const [prCongratsSent, setPrCongratsSent] = useState(false);
  const [waitlistClaimed, setWaitlistClaimed] = useState(false);
  const [courtStamped, setCourtStamped] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<{ title: string; base: number } | null>(null);

  useEffect(() => {
    const updateToken = () => {
      const token = generateDynamicPassTotp('usr_athlete_01', 'pass_metro_vip_01', 'fac_metro_core', Date.now());
      setTotpCode(token.formattedCode);
      setTtl(token.remainingSeconds);
    };
    updateToken();
    const timer = setInterval(updateToken, 1000);
    return () => clearInterval(timer);
  }, []);

  const fee = checkoutItem ? calculateHybridServiceFee(checkoutItem.base, 'one_time_pass') : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '410px 1fr', gap: '24px', alignItems: 'start' }}>
      <div style={{ backgroundColor: '#09090b', border: '4px solid #27272a', borderRadius: '36px', height: '740px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', position: 'relative' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 900, fontSize: '17px', color: '#fafafa', letterSpacing: '-0.5px' }}>SODIA</span>
            <span style={{ backgroundColor: '#f59e0b20', color: '#fbbf24', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '99px' }}>5-wk streak 🔥</span>
          </div>
          <button onClick={() => setMTab(mTab === 'dm' ? 'sodia' : 'dm')} style={{ backgroundColor: mTab === 'dm' ? '#e11d48' : '#18181b', color: '#fff', padding: '6px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageCircle size={13} /> DMs (2)
          </button>
        </div>

        {/* Phone Screen Viewport */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
          {mTab === 'sodia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Stories Row */}
              <div style={{ display: 'flex', gap: '10px', paddingBottom: '8px', borderBottom: '1px solid #18181b' }}>
                {['Your Story', 'Metro Core', 'BGC Pickle', 'Coach Sarah'].map((s, i) => (
                  <div key={s} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '24px', margin: '0 auto 4px', border: i === 0 ? '2px dashed #52525b' : '2px solid #e11d48', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fafafa' }}>
                      {s.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</div>
                  </div>
                ))}
              </div>

              {/* Feed Post 1: Verified Lift PR Stamp + Actionable POS Pill */}
              <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: '14px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#fafafa' }}>Darelle Navarette <span style={{ color: '#10b981', fontSize: '10px' }}>• VERIFIED PR</span></div>
                    <div style={{ fontSize: '11px', color: '#71717a' }}>@darellenavarette • 12m ago</div>
                  </div>
                  <button
                    onClick={() => setCheckoutItem({ title: 'Metro Core All-Access Day Pass', base: 350 })}
                    style={{ backgroundColor: '#10b98120', border: '1px solid #10b98150', color: '#34d399', padding: '4px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: 800 }}
                  >
                    📍 Metro Core • Drop In ₱350
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#d4d4d8', marginBottom: '10px', lineHeight: 1.4 }}>
                  New conventional deadlift block complete. Clean lockouts at 225kg! 🔥
                </p>
                <div style={{ backgroundColor: '#18181b', borderRadius: '10px', padding: '12px', borderLeft: '3px solid #10b981', marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#10b981' }}>TRINITY LIFT STAMP • ANTI-CHEAT VERIFIED (&lt;15% Δ)</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#fafafa', marginTop: '2px' }}>225 KG × 1 REP</div>
                </div>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <button onClick={() => setLikedPost(!likedPost)} style={{ color: likedPost ? '#e11d48' : '#a1a1aa', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={14} fill={likedPost ? '#e11d48' : 'none'} /> {likedPost ? 49 : 48}
                  </button>
                  <button onClick={() => setMTab('organizer')} style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 700 }}>
                    View Reclub Open Play Meet →
                  </button>
                </div>
              </div>

              {/* Feed Post 2: Reclub-style Open Play Funnel Card */}
              <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: '14px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8' }}>ORGANIZER OPEN PLAY • DUPR 3.4–4.0</span>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b' }}>22 / 24 SLOTS</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fafafa' }}>Thursday Night BGC Dink & Drive</div>
                <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px', marginBottom: '10px' }}>
                  Nexus Club Courts A, B, C • Auto-Split Ledger
                </div>
                <button
                  onClick={() => setCheckoutItem({ title: 'Open Play Slot (Courts A/B/C)', base: 350 })}
                  style={{ width: '100%', backgroundColor: '#3b82f6', color: '#fff', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}
                >
                  Join Open Play • ₱350 (+₱15 fee)
                </button>
              </div>
            </div>
          )}

          {mTab === 'cards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div onClick={() => setIsCardFlipped(!isCardFlipped)} style={{ background: isCardFlipped ? '#18181b' : 'linear-gradient(135deg, #065f46 0%, #0f172a 100%)', border: '1px solid #10b98160', borderRadius: '18px', padding: '20px', cursor: 'pointer', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {!isCardFlipped ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399' }}>METRO CORE • VIP ALL-ACCESS</span>
                      <span style={{ fontSize: '10px', color: '#a7f3d0' }}>Tap to Flip 180° ↻</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>DARELLE NAVARETTE</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Tier 0 Liability Waiver Signed • Active</div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <QrCode size={72} color="#10b981" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>OFFLINE 60S TOTP FALLBACK TOKEN</div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#fafafa', fontFamily: 'monospace', letterSpacing: '3px', margin: '4px 0' }}>{totpCode}</div>
                    <div style={{ fontSize: '11px', color: '#34d399' }}>Rotates in {ttl}s • Tap to flip back</div>
                  </div>
                )}
              </div>
              <button onClick={onTriggerTurnstileScan} style={{ backgroundColor: '#10b981', color: '#000', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800 }}>
                ⚡ Simulate NFC / QR Tap at GymDash Turnstile Gate 01
              </button>
            </div>
          )}

          {mTab === 'track' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', marginBottom: '6px' }}>LIFT ENGINE • ACTIVE SET LOGGER</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fafafa', marginBottom: '8px' }}>Barbell Bench Press (1RM Guard: +15% Max)</div>
                {['Set 1: 100 kg × 8 ✓', 'Set 2: 105 kg × 6 ✓', 'Set 3: 110 kg × 5 (PR Stamp Ready)'].map((s) => (
                  <div key={s} style={{ fontSize: '12px', color: '#d4d4d8', padding: '6px 0', borderBottom: '1px solid #18181b' }}>{s}</div>
                ))}
              </div>
              <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>FOOD & 3.0L HYDRATION</div>
                <div style={{ fontSize: '12px', color: '#d4d4d8' }}>2,140 / 2,600 kcal • 185g Protein • 2.4L / 3.0L Water</div>
              </div>
            </div>
          )}

          {mTab === 'organizer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ backgroundColor: '#10b98115', border: '1px solid #10b98140', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#34d399' }}>RECLUB-GRADE ORGANIZER PRO</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fafafa' }}>BGC Pickleball Open Play (24/24)</div>
                <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>Auto-Split: ₱150 Venue / ₱200 Organizer (0 GCash Screenshots)</div>
              </div>

              <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: '10px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#fafafa' }}>Waitlist #1: Kevin Tan (DUPR 3.60)</div>
                  <div style={{ fontSize: '10px', color: '#71717a' }}>{waitlistClaimed ? '⚡ 15m Exclusive Claim Sent' : 'Waiting for slot drop'}</div>
                </div>
                <button onClick={() => setWaitlistClaimed(true)} style={{ backgroundColor: '#0284c7', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>
                  {waitlistClaimed ? 'Sent ✓' : 'Offer 15m Claim'}
                </button>
              </div>

              <div style={{ backgroundColor: '#121215', border: '1px solid #27272a', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>COURT A ROTATOR • ROUND 4</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fafafa', margin: '4px 0 8px' }}>Marco / Tina (11) vs Enzo / Bianca (8)</div>
                <button onClick={() => setCourtStamped(true)} style={{ width: '100%', backgroundColor: courtStamped ? '#10b981' : '#e11d48', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                  {courtStamped ? '✓ Verified Match Stamp Minted to Profiles' : 'Finalize Score & Mint Court Stamp'}
                </button>
              </div>
            </div>
          )}

          {mTab === 'dm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#fafafa' }}>Direct Messages • Coach & B2B Handshakes</div>
              <div style={{ backgroundColor: '#18181b', borderRadius: '12px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 800 }}>SHARED PR LIFT CARD</div>
                <div style={{ fontSize: '12px', color: '#fafafa', fontWeight: 700, margin: '2px 0 6px' }}>Marco hit 180kg Squat PR at Metro Core!</div>
                <button onClick={() => setPrCongratsSent(true)} style={{ backgroundColor: '#e11d48', color: '#fff', padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>
                  {prCongratsSent ? '🔥 Congratulated!' : 'Congratulate 🔥'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Universal Bottom Sheet Checkout Intercept */}
        {checkoutItem && fee && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ backgroundColor: '#18181b', borderTop: '1px solid #3f3f46', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981' }}>ACTIONABLE-OBJECT POS SHEET (NO ROUTE PUSH)</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#fafafa', marginTop: '4px' }}>{checkoutItem.title}</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', margin: '8px 0' }}>
                Base: ₱{fee.baseAmountPhp} + Hybrid Service Fee: ₱{fee.serviceFeePhp} = <strong style={{ color: '#fff' }}>₱{fee.totalChargePhp}</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCheckoutItem(null)} style={{ flex: 1, backgroundColor: '#27272a', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>Cancel</button>
                <button onClick={() => { setCheckoutItem(null); setMTab('cards'); }} style={{ flex: 2, backgroundColor: '#10b981', color: '#000', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>Pay & Mint VIP Pass</button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom 5-Tab Bar */}
        <div style={{ height: '56px', backgroundColor: '#09090b', borderTop: '1px solid #18181b', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'center', padding: '0 8px' }}>
          <button onClick={() => setMTab('sodia')} style={{ color: mTab === 'sodia' ? '#e11d48' : '#71717a', fontSize: '10px', fontWeight: 800 }}>Sodia Feed</button>
          <button onClick={() => setMTab('cards')} style={{ color: mTab === 'cards' ? '#10b981' : '#71717a', fontSize: '10px', fontWeight: 800 }}>VIP Cards</button>
          <button onClick={() => setMTab('track')} style={{ color: mTab === 'track' ? '#38bdf8' : '#71717a', fontSize: '10px', fontWeight: 800 }}>Track</button>
          <button onClick={() => setMTab('organizer')} style={{ color: mTab === 'organizer' ? '#f59e0b' : '#71717a', fontSize: '10px', fontWeight: 800 }}>Organizer Pro</button>
        </div>
      </div>

      {/* RIGHT: LIVE SYNCHRONIZATION TELEMETRY & ARCHITECTURE OVERVIEW */}
      <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f9fafb' }}>B2C Sodia ↔ B2B GymDash/Clubdash Handshake</h2>
        <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.5 }}>
          Use the interactive mobile simulator on the left to test the consumer &amp; Reclub-style Organizer flows, or switch tabs in the top bar to operate the desktop facility command centers.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981' }}>1. ACTIONABLE-OBJECT PILLS</div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>Tapping a facility or Open Play pill opens an instant checkout bottom sheet with the Hybrid Fee (₱15 fixed / 5% recurring).</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>2. RECLUB ORGANIZER PRO</div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>Eliminates manual GCash receipt screenshots via automated split ledgers, 15m waitlist claims, and live court rotators.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
