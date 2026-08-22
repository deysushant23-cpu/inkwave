import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required validation fields.' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: 'Razorpay keys not configured on server.' },
        { status: 401 }
      );
    }

    // Generate expected signature
    const signText = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(signText.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    // Reject mismatch
    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature. Transaction may have been tampered.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Payment verified successfully.' });
  } catch (error: any) {
    console.error('Verify Razorpay Payment API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification error' },
      { status: 500 }
    );
  }
}
