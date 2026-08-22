'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';

export async function createRazorpayOrder(amountInRupees: number) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
       console.warn("RAZORPAY_KEY_ID not found. Returning MOCK order ID.");
       return { success: true, id: `order_mock_${Date.now()}`, amount: amountInRupees * 100 };
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amountInRupees * 100), // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return { success: true, id: order.id, amount: order.amount };
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return { success: false, error: error.message || 'Failed to create Razorpay order' };
  }
}

export async function verifyRazorpayPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keySecret) {
      console.warn("RAZORPAY_KEY_SECRET not found. Bypassing signature verification (MOCK).");
      return { success: true, isAuthentic: true };
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === signature;

    return { success: true, isAuthentic };
  } catch (error: any) {
    console.error("Razorpay Verify Error:", error);
    return { success: false, error: error.message || 'Failed to verify payment' };
  }
}
