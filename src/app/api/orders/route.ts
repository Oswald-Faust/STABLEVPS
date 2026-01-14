import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Invoice from '@/models/Invoice';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { PLANS, PlanId, BillingCycle, getPlanPrice } from '@/lib/plans';
import { createWindowsVPS } from '@/lib/vultr';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, billingCycle, location, paymentMethod } = body;

    // Validate inputs
    if (!planId || !PLANS[planId as PlanId]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    if (!paymentMethod || !['wallet', 'card'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(currentUser.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = PLANS[planId as PlanId];
    const price = getPlanPrice(planId as PlanId, billingCycle as BillingCycle);

    // Handle wallet payment
    if (paymentMethod === 'wallet') {
      // Check if user has sufficient balance
      if (user.balance < price) {
        return NextResponse.json({ 
          error: 'Insufficient balance',
          required: price,
          available: user.balance
        }, { status: 400 });
      }

      // Deduct from wallet
      const newBalance = user.balance - price;

      // Create VPS (non-blocking in dev mode)
      let vpsId = `mock-vps-${Date.now()}`;
      try {
        const label = `vps-${user.firstName}-${user.lastName}-${Date.now()}`;
        const vps = await createWindowsVPS(planId as PlanId, label);
        vpsId = vps.id;
        console.log('✅ VPS Provisioning started:', vpsId);
      } catch (vpsError) {
        console.error('❌ Failed to provision VPS (continuing with mock):', vpsError);
        // In development, continue with mock VPS ID
        // In production, you might want to fail here
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ 
            error: 'Failed to provision VPS. Please try again or contact support.' 
          }, { status: 500 });
        }
        // Dev mode: continue with mock VPS
        console.log('⚠️ Development mode: Using mock VPS ID');
      }

      // Calculate period dates
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      if (billingCycle === 'monthly') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      }

      // Create new VPS service object
      const newService = {
        planId,
        billingCycle,
        status: 'active',
        currentPeriodStart,
        currentPeriodEnd,
        serverId: vpsId,
        location,
        vpsStatus: 'provisioning',
        createdAt: new Date(),
      };

      // Add new VPS to user's services array (supports multiple VPS)
      await User.findByIdAndUpdate(user._id, {
        balance: newBalance,
        $push: { services: newService },
      });

      // Create invoice
      const invoiceNumber = await Invoice.generateInvoiceNumber();
      await Invoice.create({
        invoiceNumber,
        userId: user._id,
        type: 'subscription',
        amount: price,
        currency: 'USD',
        status: 'paid',
        paymentMethod: { type: 'wallet' },
        description: `VPS ${plan.name} - ${billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}`,
        metadata: {
          planId,
          billingCycle,
          location,
        },
        paidAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Order placed successfully',
        newBalance,
        vpsId,
      });
    }

    // Handle card payment via Stripe
    if (paymentMethod === 'card') {
      // Create or get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user._id.toString(),
          },
        });
        stripeCustomerId = customer.id;
        
        await User.findByIdAndUpdate(user._id, {
          stripeCustomerId: customer.id,
        });
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
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
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/services?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/order?canceled=true`,
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

      // Update user with pending subscription info
      await User.findByIdAndUpdate(user._id, {
        'subscription.planId': planId,
        'subscription.billingCycle': billingCycle,
        'subscription.status': 'pending',
        'vps.location': location,
        'vps.status': 'provisioning',
      });

      return NextResponse.json({
        success: true,
        checkoutUrl: session.url,
      });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  } catch (error: any) {
    console.error('Order error:', error);
    
    // In development, return more detailed error info
    const errorMessage = process.env.NODE_ENV !== 'production' 
      ? `Error: ${error?.message || 'Unknown error'}` 
      : 'An error occurred processing your order';
    
    return NextResponse.json(
      { error: errorMessage, stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined },
      { status: 500 }
    );
  }
}
