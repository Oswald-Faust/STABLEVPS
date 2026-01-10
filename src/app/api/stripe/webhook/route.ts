import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { stripe } from '@/lib/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      // If webhook secret is configured, verify signature
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        // For testing without webhook secret
        event = JSON.parse(body) as Stripe.Event;
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    await dbConnect();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            'subscription.status': 'active',
            'subscription.stripeSubscriptionId': session.subscription as string,
            'subscription.currentPeriodStart': new Date(),
            'vps.status': 'provisioning',
            'vps.createdAt': new Date(),
          });
          
          console.log(`✅ Subscription activated for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            'subscription.status': subscription.status === 'active' ? 'active' : 
                                   subscription.status === 'past_due' ? 'past_due' : 
                                   subscription.status === 'canceled' ? 'canceled' : 'pending',
            'subscription.currentPeriodStart': new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000),
            'subscription.currentPeriodEnd': new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
          });
          
          console.log(`📝 Subscription updated for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            'subscription.status': 'canceled',
            'vps.status': 'suspended',
          });
          
          console.log(`❌ Subscription canceled for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          await User.findByIdAndUpdate(user._id, {
            'subscription.status': 'past_due',
          });
          
          console.log(`⚠️ Payment failed for user ${user._id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
