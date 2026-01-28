import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Check against env variable with fallback
    const adminPassword = process.env.ADMIN_ACCESS_PASSWORD || 'admin_stablevps_2026';
    
    console.log('[Admin Login] Attempting login...');
    
    if (password === adminPassword) {
      const cookieStore = await cookies();
      
      // Set admin cookie
      cookieStore.set('admin_access_token', 'granted', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
