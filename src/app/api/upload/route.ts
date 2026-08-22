import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

import { verifyAdmin } from '@/lib/admin';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 60; // Allow sufficient time for media uploads

export async function POST(request: Request) {
  try {
    // 1. Verify admin authorization
    try {
      await verifyAdmin();
    } catch (authErr: any) {
      return NextResponse.json(
        { error: 'Admin session expired or unauthorized. Please re-login.' },
        { status: 401 }
      );
    }

    // 2. Convert raw binary request stream directly to a buffer
    const bytes = await request.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'The uploaded file is empty or missing.' }, { status: 400 });
    }

    // 3. Upload to Cloudinary using direct binary stream for optimal performance & reliability
    // 3. Detect if the upload is a video from its content-type header or filename extension
    const contentType = request.headers.get('content-type') || '';
    const fileName = decodeURIComponent(request.headers.get('x-file-name') || '');
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const videoExtensions = ['mp4', 'webm', 'mov', 'mkv', 'avi', '3gp', 'wmv', 'flv', 'ogg', 'm4v'];
    
    const isVideo = contentType.startsWith('video/') || videoExtensions.includes(extension);

    // 4. Upload to Cloudinary using direct binary stream for optimal performance & reliability
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'inkwave',
          resource_type: isVideo ? 'video' : 'auto', // Explicitly guide Cloudinary for video stream inputs
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    if (!uploadResult?.secure_url) {
      throw new Error('Cloudinary did not return a valid secure URL.');
    }

    return NextResponse.json({ 
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes
    });
  } catch (error: any) {
    console.error('Error uploading file to Cloudinary:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload file to Cloudinary' },
      { status: 500 }
    );
  }
}

