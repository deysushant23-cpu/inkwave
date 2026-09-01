'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Smartphone, Mail, MailCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { savePhoneNumber } from '@/app/actions/auth';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, needsPhoneCapture, setNeedsPhoneCapture, user, setProfile } = useAuthStore();
  const { signInWithOtp, verifyOtp, signInWithGoogle, isLoading, signOut } = useAuth();
  
  const [tab, setTab] = useState<'phone' | 'email'>('email');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneCaptureValue, setPhoneCaptureValue] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const targetIdentifier = emailAddress;

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneCaptureValue || !user) return;
    
    // Strict client side check before sending
    if (!/^[0-9]{10}$/.test(phoneCaptureValue)) {
      toast.error('Please enter exactly 10 digits.');
      return;
    }

    setIsSavingPhone(true);
    
    // Secure Server Action Call
    const res = await savePhoneNumber(phoneCaptureValue);
    
    setIsSavingPhone(false);

    if (!res.success) {
      toast.error(res.error || 'Failed to save phone number');
    } else {
      toast.success('Phone number saved securely!');
      setProfile(res.profile as any);
      setNeedsPhoneCapture(false);
      setAuthModalOpen(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = emailAddress;
    if (!target) return;

    const success = await signInWithOtp(target, tab);
    if (success) {
      setStep('otp');
      setResendTimer(60); // Start 60s cooldown
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    const target = emailAddress;
    const success = await verifyOtp(target, otp, tab);
    if (success) {
      // Reset state on successful login
      setStep('input');
      setPhoneNumber('');
      setEmailAddress('');
      setOtp('');
    }
  };

  return (
    <Dialog.Root open={isAuthModalOpen} onOpenChange={setAuthModalOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[100] flex flex-col w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-6 p-8 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl sm:rounded-[2rem] glass-panel bg-black/90 border border-white/20 shadow-2xl">
          
          <Dialog.Close asChild>
            <button className="absolute right-6 top-6 rounded-full p-2 bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-accent text-white/50 hover:text-white">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>

          <div className="flex flex-col mt-2">
            <Dialog.Title className="font-display text-3xl font-bold tracking-tighter uppercase mb-2">
              {needsPhoneCapture ? 'Complete Profile' : 'Access Required'}
            </Dialog.Title>
            <Dialog.Description className="text-sm font-mono tracking-widest text-[var(--text-dim)] uppercase">
              {needsPhoneCapture 
                ? 'We need your phone number for order updates' 
                : step === 'input' ? 'Enter your email to continue' : `Enter code sent to ${targetIdentifier}`}
            </Dialog.Description>
          </div>

          <div className="flex flex-col gap-4">
            {needsPhoneCapture ? (
              <form onSubmit={handleSavePhone} className="flex flex-col gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">+91</span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    value={phoneCaptureValue}
                    onChange={(e) => setPhoneCaptureValue(e.target.value.replace(/\D/g, ''))}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/50 pl-11 pr-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent font-mono"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSavingPhone || phoneCaptureValue.length < 10}
                  className="inline-flex items-center justify-center rounded-xl text-xs uppercase tracking-widest font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 bg-white text-black hover:bg-gray-200 h-11 px-4 py-2 w-full font-mono"
                >
                  {isSavingPhone ? 'Saving...' : 'Save & Continue'}
                </button>
                <button
                  type="button"
                  onClick={() => { signOut(); setNeedsPhoneCapture(false); setAuthModalOpen(false); }}
                  className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-red-400 mt-2"
                >
                  Cancel & Logout
                </button>
              </form>
            ) : (
              <>
                {step === 'input' && (
                  <>
                <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-mono ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 text-white"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !emailAddress}
                    className="inline-flex items-center justify-center rounded-xl text-xs uppercase tracking-widest ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 bg-white text-black hover:bg-gray-200 h-11 px-4 py-2 w-full font-bold font-mono cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                      </span>
                    ) : 'Send Code'}
                  </button>
                </form>

                {/* OR Divider */}
                <div className="relative my-1 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative bg-black px-3 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                    OR
                  </span>
                </div>

                {/* Continue with Google Action Button */}
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-all font-mono text-xs uppercase tracking-wider font-semibold disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="flex h-14 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-center text-2xl font-mono tracking-[0.5em] ring-offset-background placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent text-white"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="inline-flex items-center justify-center rounded-xl text-xs uppercase tracking-widest ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 bg-accent text-background hover:bg-emerald-400 h-11 px-4 py-2 w-full font-bold font-mono"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                    </span>
                  ) : 'Verify & Access'}
                </button>
                
                {/* Resend Cooldown System */}
                <div className="text-center font-mono text-xs">
                  {resendTimer > 0 ? (
                    <span className="text-gray-500">
                      Resend code in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSendOtp()}
                      className="text-accent hover:underline focus:outline-none disabled:opacity-50"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs text-gray-400 hover:text-white mt-1"
                >
                  Back to login options
                </button>
              </form>
            )}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
