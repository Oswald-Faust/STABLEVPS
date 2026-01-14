import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// Check balance without auth - for debugging only
export async function GET() {
  try {
    await dbConnect();

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
