import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { stripe, PLANS, PlanId, BillingCycle, getPlanPrice } from '@/lib/stripe';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password, firstName, lastName, planId, billingCycle, location, isRegisterOnly } = body;

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

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: email.toLowerCase(),
      name: `${firstName} ${lastName}`,
      metadata: {
        firstName,
        lastName,
      },
    });

    // Create user in database (password will be automatically hashed)
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      stripeCustomerId: stripeCustomer.id,
      ...(isRegisterOnly ? {} : {
        subscription: {
          planId,
          billingCycle,
          status: 'pending',
        },
        vps: {
          location,
          status: 'provisioning',
        },
      })
    });

    if (isRegisterOnly) {
      // Generate JWT token
      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
      });

      const response = NextResponse.json({
        success: true,
        userId: user._id.toString(),
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

    // Calculate price
    const price = getPlanPrice(planId as PlanId, billingCycle as BillingCycle);
    const plan = PLANS[planId as PlanId];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `STABLEVPS ${plan.name}`,
              description: `VPS Trading - ${plan.platforms} plateformes - ${plan.specs.cpu}, ${plan.specs.ram}, ${plan.specs.storage}`,
              images: ['https://stablevps.com/logo.png'],
            },
            unit_amount: price * 100, // Stripe uses cents
            recurring: billingCycle === 'monthly' 
              ? { interval: 'month' }
              : { interval: 'year' },
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
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          planId,
          billingCycle,
          location,
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
