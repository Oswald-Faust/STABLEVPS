import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Referral from '@/models/Referral';
import { stripe, PLANS, PlanId, BillingCycle, getPlanPrice } from '@/lib/stripe';
import { signToken } from '@/lib/auth';

// Generate a unique referral code for new users
function generateReferralCode(firstName: string, lastName: string): string {
  const namePart = (firstName.substring(0, 3) + lastName.substring(0, 3)).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password, firstName, lastName, planId, billingCycle, location, isRegisterOnly, referralCode } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!isRegisterOnly && (!planId || !billingCycle || !location)) {
      return NextResponse.json(
        { error: 'Plan, billing cycle and location are required' },
        { status: 400 }
      );
    }

    // Check if plan exists
    if (!isRegisterOnly && !PLANS[planId as PlanId]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Validate referral code if provided
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        );
      }
    }

    // Generate unique referral code for new user
    let newUserReferralCode = generateReferralCode(firstName, lastName);
    let attempts = 0;
    while (await User.findOne({ referralCode: newUserReferralCode }) && attempts < 10) {
      newUserReferralCode = generateReferralCode(firstName, lastName);
      attempts++;
    }

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: email.toLowerCase(),
      name: `${firstName} ${lastName}`,
      metadata: {
        firstName,
        lastName,
        referralCode: referralCode || '',
      },
    });

    // Create user in database (password will be automatically hashed)
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      stripeCustomerId: stripeCustomer.id,
      referralCode: newUserReferralCode,
      referredBy: referrer?._id || undefined,
      affiliateStats: {
        totalReferrals: 0,
        successfulReferrals: 0,
        totalEarnings: 0,
      },
      ...(isRegisterOnly ? {} : {
        subscription: {
          planId,
          billingCycle,
          status: 'pending',
        },
        // Do NOT create VPS object yet. It will be created upon payment success.
      })
    });

    // Create pending referral record if referred
    let referralId = null;
    if (referrer) {
      const referralRecord = await Referral.create({
        referrerId: referrer._id,
        refereeId: user._id,
        status: 'pending',
        discountApplied: 10,
        commissionRate: 10,
      });
      referralId = referralRecord._id.toString();

      // Update referrer's total referrals count
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { 'affiliateStats.totalReferrals': 1 }
      });
    }

    if (isRegisterOnly) {
      // Generate JWT token
      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
      });

      const response = NextResponse.json({
        success: true,
        userId: user._id.toString(),
        referralCode: newUserReferralCode,
      });

      // Set HTTP-only cookie
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    // Calculate price with discount if referred
    let price = getPlanPrice(planId as PlanId, billingCycle as BillingCycle);
    const originalPrice = price;
    const discountPercent = referrer ? 10 : 0; // 10% discount if referred
    
    if (discountPercent > 0) {
      price = Math.round(price * (1 - discountPercent / 100) * 100) / 100;
    }

    const plan = PLANS[planId as PlanId];

    // Create Stripe Checkout Session with coupon for referral discount
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `STABLEVPS ${plan.name}`,
              description: referrer 
                ? `VPS Trading - ${plan.platforms} plateformes - 10% de réduction parrainage!`
                : `VPS Trading - ${plan.platforms} plateformes - ${plan.specs.cpu}, ${plan.specs.ram}, ${plan.specs.storage}`,
              images: ['https://stablevps.com/logo.png'],
            },
            unit_amount: Math.round(price * 100), // Stripe uses cents
            recurring: billingCycle === 'monthly' 
              ? { interval: 'month' as const }
              : { interval: 'year' as const },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?canceled=true`,
      metadata: {
        userId: user._id.toString(),
        planId,
        billingCycle,
        location,
        referralId: referralId || '',
        referrerId: referrer?._id?.toString() || '',
        originalPrice: originalPrice.toString(),
        discountPercent: discountPercent.toString(),
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          planId,
          billingCycle,
          location,
          referralId: referralId || '',
          referrerId: referrer?._id?.toString() || '',
        },
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      userId: user._id.toString(),
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
