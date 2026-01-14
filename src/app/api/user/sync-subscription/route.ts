import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { stripe } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/auth';

// POST /api/user/sync-subscription
// Syncs the current user's subscription data from Stripe
export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(currentUser.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscriptionId = user.subscription?.stripeSubscriptionId;

    if (!subscriptionId) {
      return NextResponse.json({ 
        success: false,
        error: 'No Stripe subscription found for this account',
        subscription: user.subscription
      }, { status: 400 });
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

    // Update user with subscription data
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      'subscription.status': subscription.status === 'active' ? 'active' : 
                             subscription.status === 'past_due' ? 'past_due' : 
                             subscription.status === 'canceled' ? 'canceled' : 'pending',
      'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
    }, { new: true });

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      subscription: {
        status: updatedUser?.subscription?.status,
        currentPeriodStart: updatedUser?.subscription?.currentPeriodStart,
        currentPeriodEnd: updatedUser?.subscription?.currentPeriodEnd,
        planId: updatedUser?.subscription?.planId,
        billingCycle: updatedUser?.subscription?.billingCycle,
      }
    });

  } catch (error: any) {
    console.error('Sync subscription error:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({
        success: false,
        error: 'Subscription not found in Stripe. It may have been deleted or the ID is invalid.'
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while syncing subscription' },
      { status: 500 }
    );
  }
}
