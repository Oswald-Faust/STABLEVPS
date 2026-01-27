import { NextResponse } from 'next/server';
import { listVPSInstances } from '@/lib/zomro';

export async function GET() {
  try {
    const user = process.env.ZOMRO_USER;
    const pass = !!process.env.ZOMRO_PASSWORD; // Don't leak password
    
    if (!user || !pass) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Credentials missing in .env',
        env: { user, hasPassword: pass }
      });
    }

    // Try to list instances to verify auth
    console.log('Testing Zomro connection...');
    const instances = await listVPSInstances();
    
    return NextResponse.json({
      status: 'success',
      message: 'Connection to Zomro successful',
      instanceCount: instances.length,
      credentials: { user, hasPassword: pass },
      // Note: We can't easily check balance without a specific API call, 
      // but if this works, auth is good.
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
