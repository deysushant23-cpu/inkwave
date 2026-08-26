import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_HASH = 'f6b10d506fc31d237761057d467ba7e6f4cb1a250bdda72daffcadd9844cf8ba';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;
const PLAIN_PASSWORD_FALLBACK = process.env.ADMIN_PASSWORD;

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle Logout
    if (body.action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
      response.cookies.set('admin_auth_cookie', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
        sameSite: 'lax'
      });
      return response;
    }

    // Handle Login
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, message: 'Incorrect admin password.' }, { status: 401 });
    }

    const inputHash = await sha256(password.trim());
    const isHashMatch = inputHash === ADMIN_PASSWORD_HASH;
    const isPlainMatch = PLAIN_PASSWORD_FALLBACK ? password.trim() === PLAIN_PASSWORD_FALLBACK : false;

    if (!isHashMatch && !isPlainMatch) {
      return NextResponse.json({ success: false, message: 'Incorrect admin password.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
    
    response.cookies.set('admin_auth_cookie', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 2, // 2 hours
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error during authentication' }, { status: 500 });
  }
}
