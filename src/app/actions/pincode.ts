'use server';

import { fetchPincodeDetails, PincodeInfo } from '@/lib/pincodeService';

export async function checkPincodeDeliveryAction(pincode: string): Promise<PincodeInfo> {
  try {
    return await fetchPincodeDetails(pincode);
  } catch (error) {
    console.error('Error checking pincode:', error);
    return {
      valid: false,
      pincode,
      city: '',
      district: '',
      state: '',
      serviceable: false,
      codAvailable: false,
      estimatedDaysMin: 0,
      estimatedDaysMax: 0,
      deliveryDateStr: '',
      cutoffHoursRemaining: 0,
      message: 'Failed to verify pincode. Please try again.'
    };
  }
}
