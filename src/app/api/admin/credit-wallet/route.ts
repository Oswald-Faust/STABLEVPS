import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

// Credit a user's wallet manually (for testing/admin purposes)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, amount, reason } = body;

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const previousBalance = user.balance || 0;
    const newBalance = previousBalance + amount;

    // Update user balance
    await User.findByIdAndUpdate(user._id, {
      $set: { balance: newBalance }
    });

    // Create transaction record
    await Transaction.create({
      userId: user._id,
      type: 'credit',
      amount: amount,
      currency: 'USD',
      description: reason || `Manual credit: $${amount} USD`,
      status: 'completed',
      reference: `manual_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      email: user.email,
      previousBalance,
      amountCredited: amount,
      newBalance,
      message: `Successfully credited $${amount} to ${email}`,
    });

  } catch (error) {
    console.error('Credit wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to credit wallet', details: String(error) },
      { status: 500 }
    );
  }
}
