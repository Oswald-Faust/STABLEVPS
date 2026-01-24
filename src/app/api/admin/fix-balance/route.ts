import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import User from '@/models/User';

// Direct MongoDB update to fix balance field for all users
export async function POST() {
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

    const db = mongoose.connection.db;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }
    
    const usersCollection = db.collection('users');

    // Simply set balance to 0 for ALL users
    // This will overwrite any malformed data
    const result = await usersCollection.updateMany(
      {},
      { $set: { balance: 0 } }
    );

    // Get all users to verify
    const users = await usersCollection.find({}, { projection: { email: 1, balance: 1 } }).toArray();

    return NextResponse.json({
      success: true,
      message: 'Balance field set to 0 for all users',
      modifiedCount: result.modifiedCount,
      totalUsers: users.length,
      users: users.map(u => ({
        email: u.email,
        balance: u.balance,
        balanceType: typeof u.balance
      }))
    });

  } catch (error) {
    console.error('Fix balance error:', error);
    return NextResponse.json(
      { error: 'Fix failed', details: String(error) },
      { status: 500 }
    );
  }
}
