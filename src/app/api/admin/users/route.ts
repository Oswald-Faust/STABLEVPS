import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    // Check for hardcoded admin cookie first
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');
    
    await dbConnect();

    if (adminToken && adminToken.value === 'granted') {
      // Allow access, hardcoded admin
    } else {
      // Fallback to regular user role check
      if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      const admin = await User.findById(currentUser.userId);
      if (!admin || admin.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
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

export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    // Check for hardcoded admin cookie first
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');
    
    await dbConnect();

    if (adminToken && adminToken.value === 'granted') {
      // Allow access, hardcoded admin
    } else {
      // Fallback to regular user role check
      if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      const admin = await User.findById(currentUser.userId);
      if (!admin || admin.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const body = await req.json();
    const { _id, firstName, lastName, role, balance } = body;

    if (!_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(_id, {
      firstName,
      lastName,
      role,
      balance
    }, { new: true }).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');
    
    await dbConnect();

    if (adminToken && adminToken.value === 'granted') {
      // Allow access
    } else {
      if (!currentUser) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      const admin = await User.findById(currentUser.userId);
      if (!admin || admin.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });

  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
