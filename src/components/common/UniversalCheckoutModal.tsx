import React, { useState } from 'react';
import { useEcosystem } from '../../context/EcosystemContext';
import { X, Fingerprint, Gift, ShieldCheck, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export const UniversalCheckoutModal: React.FC = () => {
  const { isCheckoutOpen, checkoutItem, closeCheckout, processCheckoutPayment } = useEcosystem();

  const [selectedType, setSelectedType] = useState<'Day Pass' | 'Monthly Pro' | 'Court Booking'>('Day Pass');
  const [isGift, setIsGift] = useState(false);
  const [recipient, setRecipient] = useState('sarah_lifts');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState('Pickleball Court A');

  if (!isCheckoutOpen || !checkoutItem) return null;

  const { facility } = checkoutItem;

  // Prices based on selection
  let basePrice = facility.dayPassPrice;
  if (selectedType === 'Monthly Pro') basePrice = facility.monthlySubPrice || 1500;
  if (selectedType === 'Court Booking') basePrice = (facility.courtHourlyPrice || 200) * 1;

  // Hybrid Fee Architecture (Appendix E)
  // Fixed ₱15 on one-time payments, flat 5% on recurring subscriptions
  const serviceFee = selectedType === 'Monthly Pro' ? Math.round(basePrice * 0.05) : 15;
  const totalAmount = basePrice + serviceFee;

  const handleConfirmPay = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      processCheckoutPayment(isGift, isGift ? recipient : undefined);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        {/* Cover & Header */}
        <div className="relative h-28 w-full bg-zinc-900">
          <img
            src={facility.coverImage}
            alt={facility.name}
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <button
            onClick={closeCheckout}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Live Capacity: {facility.liveCapacity.current}/{facility.liveCapacity.max} Active
              </div>
              <h2 className="text-lg font-black text-white">{facility.name}</h2>
              <p className="flex items-center gap-1 text-[11px] text-zinc-300">
                <MapPin className="h-3 w-3" /> {facility.address} ({facility.distance})
              </p>
            </div>
            <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              Registry {facility.registry}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Inventory Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Select Entitlement
            </label>
            <div className="mt-2 space-y-2">
              <label
                onClick={() => setSelectedType('Day Pass')}
                className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                  selectedType === 'Day Pass'
                    ? 'border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="entitlement"
                    checked={selectedType === 'Day Pass'}
                    onChange={() => setSelectedType('Day Pass')}
                    className="accent-zinc-900"
                  />
                  <div>
                    <div className="text-sm font-bold text-zinc-900">Day Pass (Full Access)</div>
                    <div className="text-[11px] text-zinc-500">All equipment, lockers, and recovery zone</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-zinc-900">₱{facility.dayPassPrice}</div>
                  <div className="text-[10px] text-zinc-400">Single entry</div>
                </div>
              </label>

              {facility.monthlySubPrice && (
                <label
                  onClick={() => setSelectedType('Monthly Pro')}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                    selectedType === 'Monthly Pro'
                      ? 'border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="entitlement"
                      checked={selectedType === 'Monthly Pro'}
                      onChange={() => setSelectedType('Monthly Pro')}
                      className="accent-zinc-900"
                    />
                    <div>
                      <div className="text-sm font-bold text-zinc-900">Monthly Pro Membership</div>
                      <div className="text-[11px] text-zinc-500">Unlimited 30-day VIP entry via dynamic QR</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-zinc-900">₱{facility.monthlySubPrice.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-400">/month (auto-renews)</div>
                  </div>
                </label>
              )}

              {facility.courtHourlyPrice && (
                <label
                  onClick={() => setSelectedType('Court Booking')}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                    selectedType === 'Court Booking'
                      ? 'border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="entitlement"
                      checked={selectedType === 'Court Booking'}
                      onChange={() => setSelectedType('Court Booking')}
                      className="accent-zinc-900"
                    />
                    <div>
                      <div className="text-sm font-bold text-zinc-900">Court Booking (1 Hour)</div>
                      <div className="text-[11px] text-zinc-500">Includes auto 15-min sport changeover buffer</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-zinc-900">₱{facility.courtHourlyPrice}</div>
                    <div className="text-[10px] text-zinc-400">per court / hr</div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Court Selection Extra if Court Booking */}
          {selectedType === 'Court Booking' && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <div className="text-xs font-bold text-zinc-700">Court Slot Selection</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {['Court A', 'Court B', 'Court C'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCourt(`Pickleball ${c}`)}
                    className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                      selectedCourt === `Pickleball ${c}`
                        ? 'bg-zinc-900 text-white'
                        : 'bg-white border border-zinc-200 text-zinc-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-zinc-500">
                🔒 Note: Booking a child pickleball court locks the parent gymnasium court for that hour.
              </p>
            </div>
          )}

          {/* Buy as Gift Toggle (Screen 8.8) */}
          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-amber-700" />
              <div>
                <div className="text-xs font-bold text-amber-900">Buy as Gift for a Friend</div>
                <div className="text-[10px] text-amber-700">Delivered instantly to recipient's Sodia wallet</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isGift}
              onChange={e => setIsGift(e.target.checked)}
              className="h-4 w-4 accent-amber-600 rounded"
            />
          </div>

          {isGift && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-600 uppercase">Friend's Sodia Username</label>
              <input
                type="text"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="e.g. sarah_lifts"
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          )}

          {/* Fee Breakdown (Hybrid Model) */}
          <div className="rounded-xl bg-zinc-100 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>{selectedType} Subtotal</span>
              <span className="font-semibold">₱{basePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span className="flex items-center gap-1">
                Platform Service Fee
                <span className="text-[9px] text-zinc-400">
                  ({selectedType === 'Monthly Pro' ? '5% Flat' : 'Fixed ₱15'})
                </span>
              </span>
              <span className="font-semibold">₱{serviceFee}</span>
            </div>
            <div className="border-t border-zinc-200 pt-1.5 flex justify-between font-black text-sm text-zinc-900">
              <span>Total Due</span>
              <span className="text-emerald-600">₱{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Split Routing Note */}
          <div className="flex items-start gap-1.5 text-[10px] text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
            <span>
              Powered by Xendit xenPlatform. GetPhysical is never the merchant of record. Funds split directly to facility ledger.
            </span>
          </div>

          {/* Action Button: Confirm & Pay with Biometrics */}
          <button
            onClick={handleConfirmPay}
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-3 text-sm font-black text-white hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg"
          >
            {isAuthenticating ? (
              <span className="flex items-center gap-2 text-emerald-400 animate-pulse">
                <Fingerprint className="h-5 w-5 animate-spin" /> Verifying Biometric FaceID...
              </span>
            ) : (
              <>
                <Fingerprint className="h-5 w-5 text-emerald-400" />
                <span>Confirm & Pay ₱{totalAmount.toLocaleString()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
