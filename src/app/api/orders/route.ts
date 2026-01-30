import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Invoice from '@/models/Invoice';
import Referral from '@/models/Referral';
import Transaction from '@/models/Transaction';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { PLANS, PlanId, BillingCycle, getPlanPrice } from '@/lib/plans';
import { createForexVPS } from '@/lib/vps-provider';

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

    // Check for referral discount eligibility (First order only)
    let discountRate = 0;
    let referralId = null;
    let referrerId = null;
    let originalPrice = getPlanPrice(planId as PlanId, billingCycle as BillingCycle);

    if (user.referredBy && (!user.services || user.services.length === 0)) {
        // First order + has referrer -> Apply discount
        discountRate = 10; // 10%
        referrerId = user.referredBy;
        
        const referral = await Referral.findOne({ refereeId: user._id, status: 'pending' });
        if (referral) {
            referralId = referral._id.toString();
        } else {
            // Should exist if referredBy is set, but just in case create one or handle it
             // Let's rely on referredBy mainly for discount
             // If referral record is missing, commission might not be tracked perfectly unless we create it here
             // For now, let's assume it exists or we won't process commission if missing
        }
    }

    const plan = PLANS[planId as PlanId];
    let price = originalPrice;
    
    if (discountRate > 0) {
        price = price * (1 - discountRate / 100);
        price = Math.round(price * 100) / 100;
    }

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
      let vpsPassword = ''; // Password will be retrieved when VPS is active
      
      try {
        const label = `vps-${user.firstName}-${user.lastName}-${Date.now()}`;
        const vps = await createForexVPS(planId as PlanId, label, location);
        vpsId = vps.instanceId;
        console.log('✅ VPS Provisioning started:', vpsId);
      } catch (vpsError) {
        console.error('❌ Failed to provision VPS (continuing with mock):', vpsError);
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ 
            error: 'Failed to provision VPS. Please try again or contact support.' 
          }, { status: 500 });
        }
        vpsPassword = `DevPass${Date.now().toString(36)}!`;
        console.log('⚠️ Development mode: Using mock VPS ID and password');
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
        rdpUsername: 'Administrator',
        rdpPassword: vpsPassword,
        createdAt: new Date(),
      };

      // Add new VPS to user's services array and update balance
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
        currency: 'EUR',
        status: 'paid',
        paymentMethod: { type: 'wallet' },
        description: `VPS ${plan.name} - ${billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}`,
        metadata: {
          planId,
          billingCycle,
          location,
          referralId: referralId || '',
          discountPercent: discountRate.toString(),
        },
        paidAt: new Date(),
      });

      // Process REFERRAL COMMISSION for Wallet Payment
      if (referralId && referrerId && price > 0) {
          try {
              const commissionRate = 10;
              const commissionAmount = Math.round(price * (commissionRate / 100) * 100) / 100;

              // Update referral status
              await Referral.findByIdAndUpdate(referralId, {
                  status: 'completed',
                  commissionAmount,
                  orderAmount: price,
                  orderId: vpsId, // Using VPS ID as order ID for wallet
                  paidAt: new Date(),
              });

              // Credit referrer
              await User.findByIdAndUpdate(referrerId, {
                  $inc: {
                      balance: commissionAmount,
                      'affiliateStats.successfulReferrals': 1,
                      'affiliateStats.totalEarnings': commissionAmount,
                  }
              });

              // Transaction record
              await Transaction.create({
                  userId: referrerId,
                  type: 'credit',
                  amount: commissionAmount,
                  currency: 'EUR',
                  description: `Commission parrainage - 10% sur commande wallet`,
                  reference: `referral-${referralId}`,
                  status: 'completed',
                  metadata: {
                      referralId,
                      refereeId: user._id,
                      orderAmount: price,
                      commissionRate,
                  }
              });
              
              console.log(`🎁 Referral commission (Wallet): ${commissionAmount}€ credited to ${referrerId}`);
          } catch (refError) {
              console.error('Error processing wallet referral commission:', refError);
          }
      }

      return NextResponse.json({
        success: true,
        message: 'Order placed successfully',
        newBalance,
        vpsId,
      });
    }

    // Handle card payment via Stripe
    if (paymentMethod === 'card') {
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

      // Add referral metadata
      const stripeMetadata: Record<string, string> = {
          userId: user._id.toString(),
          planId,
          billingCycle,
          location,
          referralId: referralId || '',
          referrerId: referrerId ? referrerId.toString() : '',
          discountPercent: discountRate.toString(),
          originalPrice: originalPrice.toString(),
      };

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
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
              unit_amount: Math.round(price * 100), // Use discounted price
              recurring: billingCycle === 'monthly' 
                ? { interval: 'month' }
                : { interval: 'year' },
            },
            quantity: 1,
            // If discount applied, show original price ? Stripe doesn't support showing strikethrough easily in checkout session without coupon object, 
            // but we are changing the unit_amount directly which is simpler.
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/services?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/order?canceled=true`,
        metadata: stripeMetadata,
        subscription_data: {
          metadata: stripeMetadata,
        },
      });

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
    
    const errorMessage = process.env.NODE_ENV !== 'production' 
      ? `Error: ${error?.message || 'Unknown error'}` 
      : 'An error occurred processing your order';
    
    return NextResponse.json(
      { error: errorMessage, stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined },
      { status: 500 }
    );
  }
}
