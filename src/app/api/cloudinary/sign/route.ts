import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

import { verifyAdmin } from '@/lib/admin';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    await verifyAdmin();
    const body = await request.json();
    const { paramsToSign } = body;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Error signing upload payload:', error);
    return NextResponse.json({ error: 'Failed to sign payload' }, { status: 500 });
  }
}
