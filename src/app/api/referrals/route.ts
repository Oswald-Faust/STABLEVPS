import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Referral from '@/models/Referral';
import { verifyToken } from '@/lib/auth';

// Generate a unique referral code
function generateReferralCode(firstName: string, lastName: string): string {
  const namePart = (firstName.substring(0, 3) + lastName.substring(0, 3)).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}${randomPart}`;
}

// GET - Get user's referral info and stats
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate referral code if not exists
    if (!user.referralCode) {
      let code = generateReferralCode(user.firstName, user.lastName);
      let attempts = 0;
      
      // Make sure code is unique
      while (await User.findOne({ referralCode: code }) && attempts < 10) {
        code = generateReferralCode(user.firstName, user.lastName);
        attempts++;
      }
      
      user.referralCode = code;
      await user.save();
    }

    // Get referral history
    const referrals = await Referral.find({ referrerId: user._id })
      .populate('refereeId', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate stats
    const stats = {
      totalReferrals: user.affiliateStats?.totalReferrals || 0,
      successfulReferrals: user.affiliateStats?.successfulReferrals || 0,
      totalEarnings: user.affiliateStats?.totalEarnings || 0,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    };

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${user.referralCode}`,
      stats,
      referrals: referrals.map(r => ({
        id: r._id,
        referee: r.refereeId,
        status: r.status,
        commissionAmount: r.commissionAmount,
        orderAmount: r.orderAmount,
        paidAt: r.paidAt,
        createdAt: r.createdAt,
      })),
      discountRate: 10, // 10% discount for referees
      commissionRate: 10, // 10% commission for referrers
    });

  } catch (error) {
    console.error('Error fetching referral info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral info' },
      { status: 500 }
    );
  }
}

// POST - Validate a referral code (used during signup)
export async function POST(request: NextRequest) {
  try {
    const { referralCode } = await request.json();
    
    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
    }

    await dbConnect();

    const referrer = await User.findOne({ 
      referralCode: referralCode.toUpperCase() 
    }).select('_id firstName referralCode');

    if (!referrer) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid referral code' 
      }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      referrerId: referrer._id,
      referrerName: referrer.firstName,
      discountRate: 10, // 10% discount
    });

  } catch (error) {
    console.error('Error validating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}
