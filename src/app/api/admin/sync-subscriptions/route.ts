import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { stripe } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

// POST /api/admin/sync-subscriptions
// Syncs subscription data from Stripe for all users with a stripeSubscriptionId
export async function POST(request: NextRequest) {
  try {
    // Check for hardcoded admin cookie first
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');
    
    await dbConnect();
    
    if (adminToken && adminToken.value === 'granted') {
       // Allow access
    } else {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify admin role
        const adminUser = await User.findById(currentUser.userId);
        if (!adminUser || adminUser.role !== 'admin') {
          return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }
    }

    // Find all users with a Stripe subscription ID
    const usersWithSubscription = await User.find({
      'subscription.stripeSubscriptionId': { $exists: true, $ne: null }
    });

    const results = {
      total: usersWithSubscription.length,
      updated: 0,
      failed: 0,
      details: [] as { email: string; status: string; error?: string }[]
    };

    for (const user of usersWithSubscription) {
      try {
        const subscriptionId = user.subscription?.stripeSubscriptionId;
        
        if (!subscriptionId) {
          results.details.push({
            email: user.email,
            status: 'skipped',
            error: 'No subscription ID'
          });
          continue;
        }

        // Fetch subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

        // Update user with subscription data
        await User.findByIdAndUpdate(user._id, {
          'subscription.status': subscription.status === 'active' ? 'active' : 
                                 subscription.status === 'past_due' ? 'past_due' : 
                                 subscription.status === 'canceled' ? 'canceled' : 'pending',
          'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        });

        results.updated++;
        results.details.push({
          email: user.email,
          status: 'updated'
        });

      } catch (error: any) {
        results.failed++;
        results.details.push({
          email: user.email,
          status: 'failed',
          error: error.message || 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${results.updated} subscriptions, ${results.failed} failed`,
      results
    });

  } catch (error) {
    console.error('Sync subscriptions error:', error);
    return NextResponse.json(
      { error: 'An error occurred while syncing subscriptions' },
      { status: 500 }
    );
  }
}

// GET /api/admin/sync-subscriptions?userId=xxx
// Sync a single user's subscription data from Stripe
export async function GET(request: NextRequest) {
  try {
    // Check for hardcoded admin cookie first
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_access_token');
    
    await dbConnect();
    
    if (adminToken && adminToken.value === 'granted') {
       // Allow access
    } else {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify admin role
        const adminUser = await User.findById(currentUser.userId);
        if (!adminUser || adminUser.role !== 'admin') {
          return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscriptionId = user.subscription?.stripeSubscriptionId;

    if (!subscriptionId) {
      return NextResponse.json({ 
        error: 'User has no Stripe subscription ID',
        user: {
          email: user.email,
          subscription: user.subscription
        }
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
      user: {
        email: updatedUser?.email,
        subscription: updatedUser?.subscription
      },
      stripeData: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      }
    });

  } catch (error: any) {
    console.error('Sync subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while syncing subscription' },
      { status: 500 }
    );
  }
}
