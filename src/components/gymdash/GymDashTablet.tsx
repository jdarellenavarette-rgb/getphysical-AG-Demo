import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import {
  Camera,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  CreditCard,
  Banknote,
  RotateCcw,
  Sparkles,
  QrCode,
  Users,
  LogOut,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export const GymDashTablet: React.FC = () => {
  const {
    setPortal,
    isStaffClockedIn,
    clockInStaffWithSelfie,
    isRegisterFloatUnlocked,
    registerFloatAmount,
    unlockRegisterWithFloat,
    liveInsideCount,
    scannedHistory,
    simulateGateScan,
    overrideDeniedScan,
    posCart,
    addToPosCart,
    removeFromPosCart,
    clearPosCart,
    tenderPosCart,
    showToast
  } = useEcosystem();

  // Float gate PIN states
  const [pinInput, setPinInput] = useState('');
  const [openingFloatInput, setOpeningFloatInput] = useState(2000);
  const [posTab, setPosTab] = useState<'access' | 'store'>('access');
  const [buyerType, setBuyerType] = useState('Walk-in');
  const [activeOverrideScanId, setActiveOverrideScanId] = useState<string | null>(null);
  const [overridePin, setOverridePin] = useState('');
  const [isBlindCountOpen, setIsBlindCountOpen] = useState(false);
  const [blindCashCount, setBlindCashCount] = useState(2450);
  const [lastReceiptClaimQR, setLastReceiptClaimQR] = useState<string | null>(null);

  // Access & Store SKUs
  const accessSKUs = [
    { id: 'sku_day_pass', name: 'Day Pass (Full Access)', price: 250, type: 'access' as const },
    { id: 'sku_monthly_pro', name: 'Monthly Pro (Recurring)', price: 1500, type: 'access' as const },
    { id: 'sku_student_pass', name: 'Student Summer Promo', price: 1200, type: 'access' as const }
  ];

  const storeSKUs = [
    { id: 'sku_preworkout', name: 'C4 Pre-Workout Drink', price: 120, type: 'store' as const },
    { id: 'sku_water', name: 'Electrolyte Water (750ml)', price: 60, type: 'store' as const },
    { id: 'sku_protein_bar', name: 'Quest Protein Bar', price: 140, type: 'store' as const },
    { id: 'sku_towel', name: 'Twins Gym Towel', price: 200, type: 'store' as const }
  ];

  const cartTotal = posCart.reduce((sum, item) => sum + item.price, 0);
  const hasAccessSKU = posCart.some(i => i.type === 'access');
  const hasStoreSKU = posCart.some(i => i.type === 'store');
  const isMixedCart = hasAccessSKU && hasStoreSKU;

  const handleTender = (method: 'cash' | 'external_terminal' | 'app') => {
    const res = tenderPosCart(method, buyerType);
    if (res.success && res.claimQr) {
      setLastReceiptClaimQR(res.claimQr);
    }
  };

  const handleExecuteBlindCount = () => {
    const expected = registerFloatAmount + 450; // Opening float + cash sales
    const diff = blindCashCount - expected;
    if (diff !== 0) {
      showToast(`⚠️ Blind Count Discrepancy: ${diff > 0 ? '+' : ''}₱${diff}. Shift closed with flag for Manager Review.`);
    } else {
      showToast('✅ Blind Count Matches Expected Ledger! Shift ended cleanly.');
    }
    setIsBlindCountOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans select-none">
      {/* Top Command Bar (Section 3 & 4 Layout Rules) */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPortal('sodia')}
            className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Consumer Sodia
          </button>
          <div className="h-4 w-px bg-zinc-700" />
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">ONLINE</span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-bold text-white">Twins Fitness BGC (Fast Lobby Tablet)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-zinc-800 px-3 py-1 text-xs">
            <span className="text-zinc-400">Staff: </span>
            <span className="font-bold text-white">Darelle</span>
            <span className="text-zinc-500 font-mono ml-2">Shift: 02:14:00</span>
          </div>

          <div className="rounded-xl bg-emerald-950/70 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-black text-emerald-300">
            Inside Now: {liveInsideCount} / 100
          </div>

          <button
            onClick={() => setIsBlindCountOpen(true)}
            className="rounded-xl bg-rose-600 px-3 py-1 text-xs font-black text-white hover:bg-rose-700 flex items-center gap-1"
          >
            <LogOut className="h-3.5 w-3.5" /> End Shift (Blind Count)
          </button>
        </div>
      </header>

      {/* Main Tablet Split Workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* LEFT PANEL (The Gate & Live Scanner) - 6 Cols */}
        <div className="md:col-span-6 border-r border-zinc-800 p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-emerald-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Turnstile Optical Scanner & Live Feed
                </h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">WebSocket Subscribed</span>
            </div>

            {/* Simulated Live Scanner Optical Viewfinder */}
            <div className="mt-3 relative aspect-16/9 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-8 border-2 border-dashed border-emerald-500/40 rounded-2xl animate-pulse pointer-events-none" />
              <div className="text-center space-y-1">
                <QrCode className="mx-auto h-12 w-12 text-zinc-600" />
                <div className="text-xs font-bold text-zinc-400">Ready for 60s Dynamic Pass QR</div>
                <div className="text-[10px] text-zinc-500">Auto-validates against local encrypted cache</div>
              </div>

              {/* Simulation Scan Buttons for Tablet Operator */}
              <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 z-10">
                <button
                  onClick={() => simulateGateScan('valid')}
                  className="flex-1 rounded-xl bg-emerald-600/90 py-1.5 text-[10px] font-black hover:bg-emerald-600 shadow-sm"
                >
                  Scan Valid Pass (+1)
                </button>
                <button
                  onClick={() => simulateGateScan('expired')}
                  className="flex-1 rounded-xl bg-rose-600/90 py-1.5 text-[10px] font-black hover:bg-rose-600 shadow-sm"
                >
                  Scan Expired (Deny)
                </button>
                <button
                  onClick={() => simulateGateScan('coach_client')}
                  className="flex-1 rounded-xl bg-blue-600/90 py-1.5 text-[10px] font-black hover:bg-blue-600 shadow-sm"
                >
                  Scan Coach Client
                </button>
              </div>
            </div>

            {/* Live Attendance Scans Feed */}
            <div className="mt-4 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Recent Gate Scans
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {scannedHistory.map(scan => (
                  <div
                    key={scan.id}
                    className={`flex items-center justify-between rounded-2xl p-2.5 text-xs transition-colors ${
                      scan.status === 'cleared'
                        ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-200'
                        : scan.status === 'coach_dual_auth'
                        ? 'bg-blue-950/40 border border-blue-800/40 text-blue-200'
                        : 'bg-rose-950/40 border border-rose-800/40 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={scan.avatar} alt={scan.name} className="h-7 w-7 rounded-full object-cover" />
                      <div>
                        <div className="font-black">{scan.name}</div>
                        <div className="text-[10px] opacity-75">{scan.reason || 'Turnstile Cleared'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] opacity-60">{scan.timestamp}</span>
                      {scan.status === 'denied' && (
                        <button
                          onClick={() => setActiveOverrideScanId(scan.id)}
                          className="rounded-lg bg-rose-700 px-2 py-1 text-[10px] font-black text-white hover:bg-rose-600"
                        >
                          Override PIN
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Localized Shift KPIs to Gamify Desk Staff */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-3 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-bold">Shift KPIs:</span>
            <span className="text-emerald-400 font-black">4 Signups</span>
            <span className="text-blue-400 font-black">2 Renewals</span>
            <span className="text-amber-400 font-black">1 Expiring Today</span>
          </div>
        </div>

        {/* RIGHT PANEL (The Till & Bifurcated POS) - 6 Cols */}
        <div className="md:col-span-6 p-4 flex flex-col justify-between space-y-4 bg-zinc-900/40">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Front-Desk POS Cash Till
              </h2>
              {/* Bifurcated Tabs: Access vs Store */}
              <div className="flex rounded-xl bg-zinc-800 p-1 text-xs">
                <button
                  onClick={() => setPosTab('access')}
                  className={`rounded-lg px-3 py-1 font-bold transition-all ${
                    posTab === 'access' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-400'
                  }`}
                >
                  Access Passes
                </button>
                <button
                  onClick={() => setPosTab('store')}
                  className={`rounded-lg px-3 py-1 font-bold transition-all ${
                    posTab === 'store' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-400'
                  }`}
                >
                  Store / F&B
                </button>
              </div>
            </div>

            {/* "Who is buying?" Data Gate (Screen 5 Flow B) */}
            <div className="mt-3 flex items-center gap-1.5 rounded-2xl bg-zinc-800/80 p-2 text-xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase mr-1">Buyer:</span>
              {['Walk-in', 'App User', 'New Offline', 'Existing'].map(t => (
                <button
                  key={t}
                  onClick={() => setBuyerType(t)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    buyerType === t ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* SKU Catalog Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(posTab === 'access' ? accessSKUs : storeSKUs).map(sku => (
                <button
                  key={sku.id}
                  onClick={() => addToPosCart(sku)}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-left hover:border-zinc-600 hover:bg-zinc-850 transition-all active:scale-98"
                >
                  <div className="text-xs font-black text-white">{sku.name}</div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold">{sku.type}</span>
                    <span className="font-black text-emerald-400">₱{sku.price}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Active Cart Summary */}
            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>Current Till Cart ({posCart.length} Items)</span>
                <button onClick={clearPosCart} className="text-rose-400 hover:underline text-[10px]">
                  Clear Cart
                </button>
              </div>

              {posCart.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-600">Cart is empty. Tap SKUs to add.</div>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto divide-y divide-zinc-800">
                  {posCart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 text-xs">
                      <span className="text-zinc-300 font-semibold">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">₱{item.price}</span>
                        <button
                          onClick={() => removeFromPosCart(item.id)}
                          className="text-zinc-500 hover:text-rose-400"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-zinc-800 pt-2 flex items-center justify-between font-black text-sm">
                <span>Total Due</span>
                <span className="text-emerald-400 font-mono text-base">₱{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Mixed Cart Warning if applicable (Master Flowchart 30) */}
            {isMixedCart && (
              <div className="mt-2 rounded-xl bg-amber-950/70 border border-amber-800 p-2.5 text-[11px] text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  Mixed Cart Conflict: Access + Store items. "Pay via App" disabled to protect ledger routing.
                </span>
              </div>
            )}
          </div>

          {/* Tendering Buttons */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTender('cash')}
                disabled={posCart.length === 0}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-30 shadow-md"
              >
                <Banknote className="h-4 w-4" /> Cash Till
              </button>

              <button
                onClick={() => handleTender('external_terminal')}
                disabled={posCart.length === 0}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-zinc-800 py-3 text-xs font-black text-white hover:bg-zinc-700 disabled:opacity-30 shadow-md"
              >
                <CreditCard className="h-4 w-4" /> Card Terminal
              </button>

              <button
                onClick={() => handleTender('app')}
                disabled={posCart.length === 0 || isMixedCart}
                className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-black shadow-md transition-all ${
                  isMixedCart
                    ? 'bg-zinc-800/40 text-zinc-600 cursor-not-allowed'
                    : 'bg-zinc-950 text-white hover:bg-black border border-zinc-700'
                }`}
                title={isMixedCart ? 'Disabled for mixed carts' : 'Pay via Sodia'}
              >
                <QrCode className="h-4 w-4 text-amber-400" /> Pay via App
              </button>
            </div>

            {lastReceiptClaimQR && (
              <div className="rounded-xl bg-zinc-800 p-3 text-center space-y-1 animate-in fade-in">
                <div className="text-xs font-bold text-amber-400">Offline Receipt Claim QR Printed!</div>
                <div className="font-mono text-xs font-black text-white">{lastReceiptClaimQR}</div>
                <div className="text-[10px] text-zinc-400">
                  Walk-in guest can scan via Sodia to digitize profile via phone OTP.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manager Override PIN Modal */}
      {activeOverrideScanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-xs rounded-3xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-black text-white">Manager Turnstile Override</h4>
            <p className="text-xs text-zinc-400">Staff cannot wave through silently. Enter Manager PIN (1234):</p>
            <input
              type="password"
              value={overridePin}
              onChange={e => setOverridePin(e.target.value)}
              placeholder="PIN"
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 p-2 text-center text-sm font-mono tracking-widest text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setActiveOverrideScanId(null)}
                className="flex-1 rounded-xl bg-zinc-800 py-2 text-xs font-bold text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const ok = overrideDeniedScan(activeOverrideScanId, overridePin);
                  if (ok) {
                    setActiveOverrideScanId(null);
                    setOverridePin('');
                  }
                }}
                className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Approve & Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blind Count Shift Close Modal (Section 5 Flow C) */}
      {isBlindCountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white">Shift End • Physical Blind Cash Count</h3>
            <p className="text-xs text-zinc-400">
              System hides mathematical totals to enforce strict accountability. Count the physical cash drawer and enter amount:
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-400">₱</span>
              <input
                type="number"
                value={blindCashCount}
                onChange={e => setBlindCashCount(Number(e.target.value))}
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-3 text-center text-lg font-mono font-black text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsBlindCountOpen(false)}
                className="flex-1 rounded-xl bg-zinc-800 py-2.5 text-xs font-bold text-zinc-300"
              >
                Back to Shift
              </button>
              <button
                onClick={handleExecuteBlindCount}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500"
              >
                Submit Blind Count
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
