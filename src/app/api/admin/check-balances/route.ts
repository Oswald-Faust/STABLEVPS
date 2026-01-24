import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import User from '@/models/User';

// Check balance with admin auth
export async function GET() {
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
      return NextResponse.json({ error: 'DB not connected' }, { status: 500 });
    }
    
    const usersCollection = db.collection('users');
    const users = await usersCollection.find(
      {},
      { projection: { email: 1, balance: 1 } }
    ).toArray();

    return NextResponse.json({
      users: users.map(u => ({
        email: u.email,
        balance: u.balance
      }))
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
