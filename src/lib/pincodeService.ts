export interface PincodeInfo {
  valid: boolean;
  pincode: string;
  city: string;
  district: string;
  state: string;
  serviceable: boolean;
  codAvailable: boolean;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  deliveryDateStr: string;
  cutoffHoursRemaining: number;
  message?: string;
}

// Major Tier 1 Metro Pincode Prefixes (Fast 2-3 day dispatch)
const METRO_PIN_PREFIXES = [
  '11', // Delhi
  '40', // Mumbai
  '56', // Bengaluru
  '70', // Kolkata
  '60', // Chennai
  '50', // Hyderabad
  '41', // Pune
  '38', // Ahmedabad
  '12', // Gurugram / Faridabad
  '20', // Noida / Ghaziabad
];

export async function fetchPincodeDetails(pincode: string): Promise<PincodeInfo> {
  const cleanPin = pincode.replace(/\D/g, '').trim();

  if (cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return {
      valid: false,
      pincode: cleanPin,
      city: '',
      district: '',
      state: '',
      serviceable: false,
      codAvailable: false,
      estimatedDaysMin: 0,
      estimatedDaysMax: 0,
      deliveryDateStr: '',
      cutoffHoursRemaining: 0,
      message: 'Please enter a valid 6-digit Indian Postal PIN Code.'
    };
  }

  let city = '';
  let district = '';
  let state = '';
  let isValid = false;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      next: { revalidate: 86400 } // cache for 24 hrs
    });
    
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        district = po.District || po.Block || '';
        city = po.Name || po.District || '';
        state = po.State || '';
        isValid = true;
      }
    }
  } catch (err) {
    console.warn('Postal API lookup fallback:', err);
  }

  // Fallback heuristic if external API is temporarily down but pincode is valid format
  if (!isValid) {
    isValid = true;
    district = 'Urban District';
    city = 'Postal Region';
    state = 'India';
  }

  const isMetro = METRO_PIN_PREFIXES.some(prefix => cleanPin.startsWith(prefix));
  const daysMin = isMetro ? 2 : 3;
  const daysMax = isMetro ? 3 : 5;

  // Calculate real delivery date
  const now = new Date();
  const deliveryDate = new Date();
  deliveryDate.setDate(now.getDate() + daysMax);

  // If landing on Sunday, push to Monday
  if (deliveryDate.getDay() === 0) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }

  const deliveryDateStr = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Calculate cutoff for same-day dispatch (e.g. 5:00 PM IST)
  const currentHour = now.getHours();
  const cutoffHoursRemaining = Math.max(1, 17 - currentHour);

  return {
    valid: true,
    pincode: cleanPin,
    city,
    district,
    state,
    serviceable: true,
    codAvailable: true,
    estimatedDaysMin: daysMin,
    estimatedDaysMax: daysMax,
    deliveryDateStr,
    cutoffHoursRemaining: currentHour < 17 ? cutoffHoursRemaining : 12
  };
}
