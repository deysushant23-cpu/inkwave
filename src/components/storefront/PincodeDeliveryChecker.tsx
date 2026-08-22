'use client';

import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle2, AlertCircle, Loader2, Sparkles, Navigation, Banknote, ShieldCheck } from 'lucide-react';
import { checkPincodeDeliveryAction } from '@/app/actions/pincode';
import { PincodeInfo } from '@/lib/pincodeService';
import { toast } from 'sonner';

export default function PincodeDeliveryChecker() {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [pincodeInfo, setPincodeInfo] = useState<PincodeInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load cached pincode from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('inkwave_delivery_pincode');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.pincode) {
          setPincode(parsed.pincode);
          setPincodeInfo(parsed);
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  const handleCheck = async (pinToCheck?: string) => {
    const pin = (pinToCheck || pincode).replace(/\D/g, '').trim();

    if (pin.length !== 6) {
      setErrorMessage('Please enter a 6-digit Indian PIN Code.');
      toast.error('Please enter a 6-digit Indian PIN Code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await checkPincodeDeliveryAction(pin);

    if (res.valid) {
      setPincodeInfo(res);
      setErrorMessage(null);
      try {
        localStorage.setItem('inkwave_delivery_pincode', JSON.stringify(res));
      } catch {}
      toast.success(`Delivering to ${res.city || res.district || res.pincode}`);
    } else {
      setPincodeInfo(null);
      setErrorMessage(res.message || 'Invalid PIN code. Please try another.');
      toast.error(res.message || 'Invalid PIN code.');
    }

    setLoading(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          const foundPostcode = data?.address?.postcode?.replace(/\D/g, '');

          if (foundPostcode && foundPostcode.length === 6) {
            setPincode(foundPostcode);
            await handleCheck(foundPostcode);
          } else {
            toast.error('Could not detect 6-digit PIN code from GPS. Please enter manually.');
          }
        } catch {
          toast.error('Failed to locate PIN code. Please enter manually.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast.error('Location permission denied. Please enter your PIN code.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-4 sm:p-5 mb-6 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text)]">
            Delivery & Pincode Checker
          </span>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--accent)] hover:underline cursor-pointer disabled:opacity-50"
        >
          <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
        </button>
      </div>

      {/* Input Box or Active State */}
      {!pincodeInfo ? (
        <div>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleCheck(); }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPincode(val);
                  if (val.length === 6) {
                    handleCheck(val);
                  }
                }}
                placeholder="Enter 6-digit PIN Code"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] transition-all uppercase tracking-wider"
              />
            </div>

            <button
              type="submit"
              disabled={loading || pincode.length !== 6}
              className="px-5 py-2.5 rounded-xl bg-[var(--text)] text-[var(--bg)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--accent)] hover:text-black transition-all disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check'}
            </button>
          </form>

          {errorMessage && (
            <p className="mt-2 text-[11px] text-rose-400 font-mono flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" /> {errorMessage}
            </p>
          )}

          <p className="mt-2 text-[11px] text-[var(--text-dim)] font-mono">
            Enter PIN to view exact arrival dates, express options & COD eligibility.
          </p>
        </div>
      ) : (
        /* Verified Pincode Result View */
        <div className="space-y-3 animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--line)]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[var(--text)]">
                  Delivering to {pincodeInfo.pincode}
                </span>
                {(pincodeInfo.city || pincodeInfo.district) && (
                  <span className="text-[11px] font-mono text-[var(--text-dim)] ml-1.5">
                    ({[pincodeInfo.city || pincodeInfo.district, pincodeInfo.state].filter(Boolean).join(', ')})
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPincodeInfo(null);
                setPincode('');
              }}
              className="text-[11px] font-mono text-[var(--accent)] hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* Delivery Date & Dispatch Highlights */}
          <div className="flex flex-col gap-2 mt-4">
            
            {/* Delivery Date Row */}
            <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)] flex items-center justify-between group hover:border-[var(--accent)]/50 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--text-dim)] font-bold tracking-widest uppercase mb-0.5">Estimated Delivery</span>
                  <span className="font-bold text-[var(--text)] text-sm tracking-wide">
                    {pincodeInfo.deliveryDateStr}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Row */}
            <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)] flex items-center justify-between group hover:border-[var(--accent)]/50 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 group-hover:scale-110 transition-transform">
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--text-dim)] font-bold tracking-widest uppercase mb-0.5">Payment Method</span>
                  <span className="font-bold text-[var(--text)] text-sm tracking-wide">
                    Cash on Delivery Available
                  </span>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
            </div>

          </div>

          {/* Dispatch Notice */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-dim)] pt-2 px-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Order within <span className="text-[var(--text)] font-bold">{pincodeInfo.cutoffHoursRemaining} hours</span> for early studio dispatch.</span>
          </div>

        </div>
      )}

    </div>
  );
}
