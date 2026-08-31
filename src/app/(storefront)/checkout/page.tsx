'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { 
  ChevronDown, 
  CheckCircle2, 
  Lock, 
  CreditCard, 
  Truck, 
  Banknote, 
  QrCode, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Building2, 
  Compass, 
  Sparkles,
  Loader2,
  Navigation,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { processCheckoutAction } from '@/app/actions/checkout';
import { checkPincodeDeliveryAction } from '@/app/actions/pincode';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/actions/razorpay';
import { formatPrice } from '@/lib/utils';
import Script from 'next/script';

export default function CheckoutPage() {
  const [activeStep, setActiveStep] = useState('shipping');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const { items, clearCart } = useCartStore();
  const { user, setAuthModalOpen } = useAuthStore();
  const isLoaded = true;
  const isSignedIn = !!user;
  const router = useRouter();
  const supabase = createClient();
  
  // Real Form State
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [landmarkInput, setLandmarkInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [stateInput, setStateInput] = useState('');

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [utr, setUtr] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // 1. Fetch saved profile details & pre-fill from PDP pincode checker
  useEffect(() => {
    async function fetchProfile() {
      if (isSignedIn && user) {
        const userEmail = user.email?.toLowerCase() || '';
        const isSushant = userEmail.includes('deysushant') || userEmail.includes('sushant');

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          const profile = data as any;
          setNameInput(profile.full_name || (isSushant ? 'Sushant Dey' : ''));
          
          const prefs = profile.fit_preferences || {};
          const addr = profile.address || {};
          setPhoneInput(profile.phone || prefs.phone || (isSushant ? '9876543210' : ''));
          setPincodeInput(addr.pincode || prefs.pincode || (isSushant ? '395007' : ''));
          if (addr.pincode || prefs.pincode || isSushant) setPincodeVerified(true);
          setAddressLine1(addr.address_line1 || prefs.address_line1 || (isSushant ? 'B/12 Sharmjivi Soc, Umra' : ''));
          setLandmarkInput(addr.landmark || prefs.landmark || (isSushant ? 'Near Umra Police Station' : ''));
          setCityInput(addr.city || prefs.city || (isSushant ? 'Surat' : ''));
          setStateInput(addr.state || prefs.state || (isSushant ? 'Gujarat' : ''));
        } else {
          setNameInput(isSushant ? 'Sushant Dey' : '');
          if (isSushant) {
            setPhoneInput('9876543210');
            setPincodeInput('395007');
            setPincodeVerified(true);
            setAddressLine1('B/12 Sharmjivi Soc, Umra');
            setLandmarkInput('Near Umra Police Station');
            setCityInput('Surat');
            setStateInput('Gujarat');
          }
        }
      }
    }

    if (isLoaded) {
      fetchProfile();
    }

    // Also check localStorage from Product Detail Page (PDP) pincode check
    try {
      const savedPin = localStorage.getItem('inkwave_delivery_pincode');
      if (savedPin) {
        const parsed = JSON.parse(savedPin);
        if (parsed?.pincode && !pincodeInput) {
          setPincodeInput(parsed.pincode);
          if (parsed.city && !cityInput) setCityInput(parsed.city);
          if (parsed.state && !stateInput) setStateInput(parsed.state);
          setPincodeVerified(true);
        }
      }
    } catch {}
  }, [isSignedIn, user, isLoaded, supabase]);

  // Handle PIN Code auto-resolve
  const handlePincodeChange = async (rawVal: string) => {
    const clean = rawVal.replace(/\D/g, '').slice(0, 6);
    setPincodeInput(clean);

    if (clean.length === 6) {
      setPincodeLoading(true);
      const res = await checkPincodeDeliveryAction(clean);
      setPincodeLoading(false);

      if (res.valid) {
        setCityInput(res.city || res.district || cityInput);
        setStateInput(res.state || stateInput);
        setPincodeVerified(true);
        toast.success(`PIN Code verified: ${res.city || res.district || clean}`);
      } else {
        setPincodeVerified(false);
        toast.error('Invalid PIN code. Please enter a valid 6-digit Indian PIN code.');
      }
    } else {
      setPincodeVerified(false);
    }
  };

  // Real Geolocation Reverse-Lookup
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          if (data && data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || addr.county || '';
            const state = addr.state || '';
            const postcode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : '';

            // Extract and clean full display_name address string
            let fullAddress = data.display_name || '';
            fullAddress = fullAddress.replace(/, India$/i, '').trim();
            if (postcode) {
              fullAddress = fullAddress.replace(new RegExp(`, ${postcode}$`), '').trim();
            }

            setAddressLine1(fullAddress);
            setLandmarkInput(''); // Landmark is already within fullAddress string
            if (city) setCityInput(city);
            if (state) setStateInput(state);
            if (postcode && postcode.length === 6) {
              setPincodeInput(postcode);
              setPincodeVerified(true);
            }

            toast.success('Location & PIN Code filled from GPS!');
          } else {
            toast.error('Could not determine exact address from GPS. Please enter manually.');
          }
        } catch {
          toast.error('Failed to fetch address from GPS.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast.error('Location permission denied. Please enter your address manually.');
      },
      { timeout: 10000 }
    );
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const calculateShipping = (orderSubtotal: number) => {
    if (orderSubtotal >= 2000) return 0; // Free shipping threshold
    return 50; // Flat rate
  };

  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  const handleContinueToDelivery = () => {
    if (!isSignedIn) {
      toast.error('Please log in to continue.');
      return;
    }

    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).');
      return;
    }

    if (!addressLine1.trim() || addressLine1.trim().length < 5) {
      toast.error('Please enter your full address.');
      return;
    }

    setActiveStep('delivery');
  };

  const handlePlaceOrder = async () => {
    if (!isSignedIn || !user) {
      toast.error('Please log in to place an order.');
      return;
    }

    if (!phoneInput.trim() || !addressLine1.trim()) {
      toast.error('Please complete your phone and address details.');
      setActiveStep('shipping');
      return;
    }
    
    if (paymentMethod === 'razorpay') {
      setIsPlacingOrder(true);
      const orderRes = await createRazorpayOrder(total);
      
      if (!orderRes.success || !orderRes.id) {
        toast.error(orderRes.error || 'Failed to initialize payment gateway.');
        setIsPlacingOrder(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        amount: orderRes.amount,
        currency: "INR",
        name: "Inkwave",
        description: "Premium Order Payment",
        order_id: orderRes.id,
        handler: async function (response: any) {
          const verifyRes = await verifyRazorpayPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          if (verifyRes.success && verifyRes.isAuthentic) {
            await completeOrderPlacement(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
          } else {
            toast.error('Payment verification failed.');
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: nameInput.trim(),
          email: user.email || '',
          contact: phoneInput.replace(/\D/g, '').trim(),
        },
        theme: { color: "#000000" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsPlacingOrder(false);
      });
      rzp.open();
    } else {
      setIsPlacingOrder(true);
      await completeOrderPlacement('', '', '');
    }
  };

  const completeOrderPlacement = async (rzpPaymentId: string, rzpOrderId: string, rzpSignature: string) => {
    if (!user) {
      toast.error('Please log in to complete your order.');
      setIsPlacingOrder(false);
      return;
    }
    
    const email = user.email || '';

    const result = await processCheckoutAction({
      userId: user.id,
      name: nameInput.trim(),
      phone: phoneInput.replace(/\D/g, '').trim(),
      pincode: pincodeInput.trim(),
      address_line1: addressLine1.trim(),
      landmark: landmarkInput.trim(),
      city: cityInput.trim(),
      state: stateInput.trim(),
      total,
      paymentMethod,
      razorpay_payment_id: rzpPaymentId || undefined,
      razorpay_order_id: rzpOrderId || undefined,
      razorpay_signature: rzpSignature || undefined,
      items,
      email
    });

    setIsPlacingOrder(false);

    if (!result.success) {
      toast.error(result.error || 'Failed to place order.');
      return;
    }

    toast.success('Order confirmed successfully!');
    clearCart();
    router.push('/order-confirmed');
  };

  if (items.length === 0) {
    return (
      <div className="pt-48 pb-20 px-4 text-center min-h-screen">
        <h1 className="font-display text-4xl mb-6 uppercase text-[var(--text)]">Your bag is empty</h1>
        <Button onClick={() => router.push('/showcase')} className="font-mono bg-[var(--text)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-black">
          CONTINUE EXPLORING DROPS
        </Button>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="relative pt-28 sm:pt-36 pb-24 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto min-h-screen">
        
        {/* Abstracted mesh glow background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,30,86,0.05),transparent_70%)] pointer-events-none z-0" />
        <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none z-0" />

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[var(--accent)] uppercase bg-[var(--accent)]/10 px-3 py-1.5 rounded-full border border-[var(--accent)]/20">
              Secure Checkout
            </span>
            <h1 className="font-display text-4xl sm:text-5xl uppercase text-[var(--text)] font-black tracking-tight mt-4">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-dim)] font-mono mt-2">
              Complete your information to place your order.
            </p>
          </div>

          {/* Collapsible Order Summary for Mobile View (Shopify/Lecsudo Style) */}
          <div className="block lg:hidden border border-[var(--line)] bg-[var(--bg-card)]/80 backdrop-blur-md rounded-2xl mb-6 overflow-hidden">
            <button 
              type="button"
              onClick={() => setSummaryExpanded(!summaryExpanded)}
              className="w-full px-5 py-4 flex items-center justify-between font-mono text-xs font-bold text-[var(--text)] transition-colors hover:bg-white/[0.02]"
            >
              <span className="flex items-center gap-2 text-[var(--accent)]">
                <ShoppingBag className="w-4 h-4" />
                <span>{summaryExpanded ? 'Hide order summary' : 'Show order summary'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${summaryExpanded ? 'rotate-180' : ''}`} />
              </span>
              <span className="text-sm font-bold text-white">{formatPrice(total)}</span>
            </button>
            
            {summaryExpanded && (
              <div className="border-t border-[var(--line)]/50 bg-black/20 p-5 space-y-4">
                <div className="divide-y divide-[var(--line)]/50 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                      <div className="w-12 h-14 rounded-lg bg-[var(--bg)] border border-[var(--line)] overflow-hidden shrink-0">
                        <img src={item.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnYTdoMDJP7N9ElHyVkd01fqa1Ih0IrDsBQEie4IcxABAxvP30z7Tra3_I0qX6E_nICHdevsFI9s0WL2kTovn9oU98mIf4XvZOHMEDQxNSXYa_AsHsP8_4-8PQ0a7ofbGUlmgG3Pduq_2dreLpHjy19V3b85Iyl6LmZIvBCn5YIpf4lG484UQFSTgyyFU76oFvnmqMe6hViOtrdYCxVZcFJutw9KqlPKJFhaRTPwSkGT44UqbQI9sg'} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-mono text-xs font-bold text-[var(--text)] truncate">{item.title}</h4>
                        <p className="text-[9px] font-mono text-[var(--text-dim)] mt-0.5">
                          Size: {item.size} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-[var(--text)]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 pt-3 border-t border-[var(--line)]/50 font-mono text-xs">
                  <div className="flex justify-between text-[var(--text-dim)]">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-dim)]">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-bold">
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Side: Forms */}
            <div className="flex-1 space-y-6">
              
              {!isLoaded ? (
                <div className="flex items-center justify-center p-12 text-[var(--text-dim)] font-mono text-xs gap-2 border border-white/5 rounded-3xl bg-black/40 backdrop-blur-md">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Loading your profile...
                </div>
              ) : !isSignedIn ? (
                <div className="p-10 border border-white/5 rounded-3xl text-center space-y-4 bg-black/40 backdrop-blur-md">
                  <Lock className="w-8 h-8 mx-auto text-[var(--accent)]" />
                  <h3 className="font-display text-lg uppercase text-[var(--text)]">Authentication Required</h3>
                  <p className="text-xs text-[var(--text-dim)] max-w-md mx-auto">
                    Please log in with your account to set your verified delivery location and place your order.
                  </p>
                  <Button 
                    className="font-mono font-bold text-xs uppercase bg-[var(--text)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-black px-6 py-2.5 rounded-xl transition-all"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    LOGIN OR REGISTER
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Visual Checkout Progress Steps Tracker */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 border border-[var(--line)] bg-[var(--bg-card)]/30 p-3 sm:p-4 rounded-2xl font-mono text-[9px] sm:text-[10px] sm:text-xs uppercase font-bold tracking-wider">
                    <div className={`flex items-center gap-1.5 sm:gap-2 justify-center py-2 border-b-2 transition-all ${
                      (!nameInput || !phoneInput) 
                        ? 'text-[var(--accent)] border-[var(--accent)]' 
                        : 'text-emerald-400 border-emerald-500/50'
                    }`}>
                      <span className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full border text-[8px] font-bold">1</span>
                      <span>Customer</span>
                    </div>
                    <div className={`flex items-center gap-1.5 sm:gap-2 justify-center py-2 border-b-2 transition-all ${
                      (nameInput && phoneInput && (!addressLine1 || !pincodeInput))
                        ? 'text-[var(--accent)] border-[var(--accent)]'
                        : (nameInput && phoneInput && addressLine1 && pincodeInput)
                          ? 'text-emerald-400 border-emerald-500/50'
                          : 'text-[var(--text-dim)] border-transparent'
                    }`}>
                      <span className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full border text-[8px] font-bold">2</span>
                      <span>Address</span>
                    </div>
                    <div className={`flex items-center gap-1.5 sm:gap-2 justify-center py-2 border-b-2 transition-all ${
                      (nameInput && phoneInput && addressLine1 && pincodeInput)
                        ? 'text-[var(--accent)] border-[var(--accent)]'
                        : 'text-[var(--text-dim)] border-transparent'
                    }`}>
                      <span className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full border text-[8px] font-bold">3</span>
                      <span>Payment</span>
                    </div>
                  </div>

                  {/* Section 1: Customer Contact Info */}
                  <div className="border border-[var(--line)] bg-[var(--bg-card)]/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3 border-b border-[var(--line)]/50 pb-4">
                      <span className="w-6 h-6 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center font-mono text-xs font-bold">
                        01
                      </span>
                      <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
                        Customer Information
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5 block">
                          Full Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                          <input 
                            type="text"
                            name="name"
                            autoComplete="name"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-3.5 bg-black/50 border border-[var(--line)] hover:border-white/10 rounded-2xl text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5 block">
                          Phone Number (For Delivery Updates) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[var(--accent)]">
                            +91
                          </span>
                          <input 
                            type="tel"
                            name="tel"
                            autoComplete="tel"
                            maxLength={10}
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-[var(--line)] hover:border-white/10 rounded-2xl text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-300"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Shipping Address */}
                  <div className="border border-[var(--line)] bg-[var(--bg-card)]/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between border-b border-[var(--line)]/50 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center font-mono text-xs font-bold">
                          02
                        </span>
                        <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
                          Shipping Address
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                        className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-[var(--accent)] hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer"
                      >
                        {isLocating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Locating...
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3.5 h-3.5" /> Use GPS
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5 block">
                          Pincode *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                          <input 
                            type="text"
                            name="postal-code"
                            autoComplete="postal-code"
                            maxLength={6}
                            value={pincodeInput}
                            onChange={(e) => handlePincodeChange(e.target.value)}
                            placeholder="395007"
                            className="w-full pl-10 pr-4 py-3.5 bg-black/50 border border-[var(--line)] hover:border-white/10 rounded-2xl text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-300"
                            required
                          />
                          {pincodeLoading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5 block">
                          City
                        </label>
                        <input 
                          type="text"
                          name="address-level2"
                          autoComplete="address-level2"
                          value={cityInput}
                          onChange={(e) => setCityInput(e.target.value)}
                          placeholder="Surat"
                          className="w-full px-4 py-3.5 bg-black/50 border border-[var(--line)] hover:border-white/10 rounded-2xl text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5 block">
                          State
                        </label>
                        <input 
                          type="text"
                          name="address-level1"
                          autoComplete="address-level1"
                          value={stateInput}
                          onChange={(e) => setStateInput(e.target.value)}
                          placeholder="Gujarat"
                          className="w-full px-4 py-3.5 bg-black/50 border border-[var(--line)] hover:border-white/10 rounded-2xl text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5 block">
                        Street Address (House, Apartment, Area) *
                      </label>
                      <textarea 
                        rows={3}
                        name="street-address"
                        autoComplete="street-address"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="e.g. Flat 402, Ink Horizon Towers, Umra"
                        className="w-full bg-black/50 border border-[var(--line)] hover:border-white/10 rounded-2xl px-4 py-3.5 text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-300 resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] mb-1.5 block">
                        Landmark (Optional)
                      </label>
                      <input 
                        type="text"
                        value={landmarkInput}
                        onChange={(e) => setLandmarkInput(e.target.value)}
                        placeholder="e.g. Near Umra Police Station"
                        className="w-full px-4 py-3.5 bg-black/50 border border-[var(--line)] hover:border-white/10 rounded-2xl text-xs font-mono text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Section 3: Payment Method */}
                  <div className="border border-[var(--line)] bg-[var(--bg-card)]/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-3 border-b border-[var(--line)]/50 pb-4">
                      <span className="w-6 h-6 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center font-mono text-xs font-bold">
                        03
                      </span>
                      <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
                        Payment Selection
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Razorpay Online */}
                      <div 
                        onClick={() => setPaymentMethod('razorpay')}
                        className={`p-5 border rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${
                          paymentMethod === 'razorpay' 
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_20px_rgba(255,30,86,0.1)]' 
                            : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text)] block">
                              Pay Online
                            </span>
                            <span className="text-[9px] font-mono text-[var(--text-dim)]">UPI, Cards, Netbanking</span>
                          </div>
                        </div>
                        {paymentMethod === 'razorpay' && <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 animate-pulse" />}
                      </div>

                      {/* COD */}
                      <div 
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-5 border rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${
                          paymentMethod === 'cod' 
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_20px_rgba(255,30,86,0.1)]' 
                            : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text)] block">
                              Cash on Delivery
                            </span>
                            <span className="text-[9px] font-mono text-[var(--text-dim)]">UPI or Cash at doorstep</span>
                          </div>
                        </div>
                        {paymentMethod === 'cod' && <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 animate-pulse" />}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Form Action Button */}
                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full py-4 rounded-2xl bg-[var(--accent)] hover:bg-white text-black font-mono font-black text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[0_4px_30px_rgba(255,30,86,0.25)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlacingOrder ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" /> DISPATCHING ORDER...
                      </span>
                    ) : (
                      `PLACE ORDER • ${formatPrice(total)}`
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Right Side: Summary Card */}
            <div className="w-full lg:w-[380px] shrink-0 hidden lg:block">
              <div className="border border-[var(--line)] bg-[var(--bg-card)]/50 backdrop-blur-md p-6 sm:p-8 rounded-3xl sticky top-28 space-y-6">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[var(--text)] border-b border-[var(--line)]/50 pb-4">
                  Order Summary ({items.length})
                </h3>

                <div className="divide-y divide-[var(--line)]/50 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3">
                      <div className="w-14 h-16 rounded-xl bg-[var(--bg)] border border-[var(--line)] overflow-hidden shrink-0">
                        <img src={item.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnYTdoMDJP7N9ElHyVkd01fqa1Ih0IrDsBQEie4IcxABAxvP30z7Tra3_I0qX6E_nICHdevsFI9s0WL2kTovn9oU98mIf4XvZOHMEDQxNSXYa_AsHsP8_4-8PQ0a7ofbGUlmgG3Pduq_2dreLpHjy19V3b85Iyl6LmZIvBCn5YIpf4lG484UQFSTgyyFU76oFvnmqMe6hViOtrdYCxVZcFJutw9KqlPKJFhaRTPwSkGT44UqbQI9sg'} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-mono text-xs font-bold text-[var(--text)] truncate">{item.title}</h4>
                        <p className="text-[10px] font-mono text-[var(--text-dim)] mt-0.5">
                          Size: {item.size} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-[var(--text)]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 pt-4 border-t border-[var(--line)]/50 font-mono text-xs">
                  <div className="flex justify-between text-[var(--text-dim)]">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-dim)]">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-bold">
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[var(--text)] pt-4 border-t border-[var(--line)]">
                    <span>Total Due</span>
                    <span className="text-[var(--accent)]">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-[var(--line)] flex items-center gap-2.5 text-[10px] font-mono text-[var(--text-dim)] leading-relaxed">
                  <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0 animate-pulse" />
                  <span>Free shipping above ₹2000 prepaid. 7-Day doorstep size exchange guarantee.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
