import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  await dbConnect();
  
  const user = await User.findOneAndUpdate(
    { email: 'faustfrank@gmail.com' },
    { role: 'admin' },
    { new: true }
  );

  return NextResponse.json({ success: true, user });
}
