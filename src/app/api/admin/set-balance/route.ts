import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import User from '@/models/User';

// Force set balance using native MongoDB
export async function POST(req: Request) {
  try {
    // Auth Check
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');
    await dbConnect();

    if (adminToken && adminToken.value === 'granted') {
       // Allow access
    } else {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        const adminUser = await User.findById(currentUser.userId);
        if (!adminUser || adminUser.role !== 'admin') {
          return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }
    }

    const body = await req.json();
    const { email, amount } = body;

    if (!email || amount === undefined) {
      return NextResponse.json({ error: 'Email and amount required' }, { status: 400 });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'DB not connected' }, { status: 500 });
    }
    
    const usersCollection = db.collection('users');
    
    // Update using native MongoDB driver
    const result = await usersCollection.updateOne(
      { email: email.toLowerCase() },
      { $set: { balance: amount } }
    );

    // Verify the update
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    return NextResponse.json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      email: email,
      newBalance: user?.balance,
      balanceType: typeof user?.balance
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
