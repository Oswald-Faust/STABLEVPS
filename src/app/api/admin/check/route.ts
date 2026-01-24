import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_access_token');

  if (token && token.value === 'granted') {
    return NextResponse.json({ authorized: true });
  }

  return NextResponse.json(
    { authorized: false },
    { status: 401 }
  );
}
