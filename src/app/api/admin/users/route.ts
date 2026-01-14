import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const admin = await User.findById(currentUser.userId);

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all users sorted by creation date
    const users = await User.find({})
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })
      .lean();

    const serializedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
      subscription: user.subscription, // Ensure nested objects are preserved
    }));

    return NextResponse.json({ success: true, users: serializedUsers });

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
