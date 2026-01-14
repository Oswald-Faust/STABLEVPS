import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

// GET: Debug user balance
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();

    // Get raw user data from MongoDB
    const user = await User.findById(currentUser.userId).lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      userId: currentUser.userId,
      email: user.email,
      balance: user.balance,
      hasBalanceField: 'balance' in user,
      rawBalanceType: typeof user.balance,
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// POST: Manually set balance for testing
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    await dbConnect();

    // Update user balance directly
    const result = await User.findByIdAndUpdate(
      currentUser.userId,
      { $set: { balance: amount } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      newBalance: result?.balance,
      message: `Balance set to $${amount}`,
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
