import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Invoice from '@/models/Invoice';
import { createForexVPS } from '@/lib/vps-provider';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // 1. Verify Payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed yet' }, { status: 400 });
    }

    await dbConnect();
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const location = session.metadata?.location || 'london';

    if (!userId || !planId) {
        return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Check if already provisioned (avoid duplicates if webhook worked fast)
    // Check if any service has this stripeSubscriptionId
    const existingService = user.services.find(s => s.stripeSubscriptionId === session.subscription);
    if (existingService) {
        return NextResponse.json({ success: true, message: 'Already provisioned' });
    }

    // 3. Provisioning Logic (Mirroring Webhook)
    
    // Retrieve subscription details for dates
    let currentPeriodStart = new Date();
    // Default to 1 month from now if unknown
    let currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    
    if (session.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as unknown as { current_period_start?: number, current_period_end?: number };
        
        if (subscription.current_period_start) {
             const start = new Date(subscription.current_period_start * 1000);
             if (!isNaN(start.getTime())) currentPeriodStart = start;
        }
        
        if (subscription.current_period_end) {
             const end = new Date(subscription.current_period_end * 1000);
             if (!isNaN(end.getTime())) currentPeriodEnd = end;
        }
        
      } catch (subError) {
        console.error('Error fetching subscription details (using default dates):', subError);
      }
    }

    // Trigger VPS Provisioning
    let vpsId = '';
    let vpsPassword = '';
    let vpsStatus = 'provisioning';

    try {
        const label = `vps-${user.firstName}-${user.lastName}-${Date.now()}`;
        console.log(`🚀 [Direct Check] Starting provisioning for ${label}...`);
        
        const vps = await createForexVPS(planId, label, location);
        vpsId = vps.instanceId;
        console.log('✅ [Direct Check] VPS Provisioning started:', vpsId);
    } catch (vpsError: any) {
        console.error('❌ [Direct Check] Failed to provision VPS:', vpsError);
        vpsStatus = 'failed';
        
        if (process.env.NODE_ENV !== 'production') {
            vpsId = `mock-vps-${Date.now()}`;
            vpsPassword = `DevPass${Date.now().toString(36)}!`;
            vpsStatus = 'provisioning';
            console.log('⚠️ [Direct Check] Development mode: Using mock VPS ID');
        }
    }

    // Create new Service object
    const newService = {
        planId,
        billingCycle: session.metadata?.billingCycle || 'monthly',
        status: 'active',
        stripeSubscriptionId: session.subscription as string,
        currentPeriodStart,
        currentPeriodEnd,
        serverId: vpsId,
        location,
        vpsStatus: vpsStatus,
        rdpUsername: 'Administrator',
        rdpPassword: vpsPassword,
        createdAt: new Date(),
    };

    // 4. Create Invoice (if not exists)
    // We check if invoice exists for this session
    const existingInvoice = await Invoice.findOne({ stripeSessionId: session.id });
    if (!existingInvoice) {
        const amount = (session.amount_total || 0) / 100;
        const invoiceNumber = await Invoice.generateInvoiceNumber();
        
        await Invoice.create({
            invoiceNumber,
            userId,
            type: 'subscription',
            amount,
            currency: session.currency?.toUpperCase() || 'EUR',
            status: 'paid',
            paymentMethod: { type: 'card' }, // Simplified
            description: `Abonnement VPS ${location} (${session.metadata?.billingCycle || 'monthly'})`,
            stripeSubscriptionId: session.subscription as string,
            stripeSessionId: session.id,
            paidAt: new Date(),
        });
    }

    // 5. Save User with new Service
    await User.findByIdAndUpdate(userId, {
        $push: { services: newService }
    });

    console.log(`✅ [Direct Check] Service activated for user ${userId}`);

    return NextResponse.json({ success: true, vpsId });

  } catch (error: any) {
    console.error('Check session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
