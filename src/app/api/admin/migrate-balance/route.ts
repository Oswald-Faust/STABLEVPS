import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// This endpoint initializes the balance field for all existing users
export async function POST() {
  try {
    await dbConnect();

    // Update all users that don't have a balance field
    const result = await User.updateMany(
      { balance: { $exists: false } },
      { $set: { balance: 0 } }
    );

    // Also update users where balance is null or undefined
    const result2 = await User.updateMany(
      { balance: null },
      { $set: { balance: 0 } }
    );

    return NextResponse.json({
      success: true,
      message: 'Balance field initialized for all users',
      usersUpdatedNoField: result.modifiedCount,
      usersUpdatedNull: result2.modifiedCount,
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    );
  }
}
