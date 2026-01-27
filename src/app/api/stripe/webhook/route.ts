import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Invoice from '@/models/Invoice';
import { stripe } from '@/lib/stripe';
import { createForexVPS } from '@/lib/vps-provider';

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
        const sessionType = session.metadata?.type;
        
        if (userId) {
          // Handle wallet top-up
          if (sessionType === 'wallet_topup') {
            const amount = parseFloat(session.metadata?.amount || '0');
            const transactionId = session.metadata?.transactionId;
            
            if (amount > 0) {
              // Get user for balance info
              const user = await User.findById(userId);
              const previousBalance = user?.balance || 0;
              const newBalance = previousBalance + amount;
              
              // Credit the user's balance
              await User.findByIdAndUpdate(userId, {
                $inc: { balance: amount }
              });
              
              // Update transaction status
              if (transactionId) {
                await Transaction.findByIdAndUpdate(transactionId, {
                  status: 'completed',
                  reference: session.payment_intent as string,
                });
              }
              
              // Get payment method details from the payment intent
              let paymentMethodDetails = { type: 'card' as const, last4: undefined as string | undefined, brand: undefined as string | undefined };
              if (session.payment_intent) {
                try {
                  const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
                  if (paymentIntent.payment_method) {
                    const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
                    paymentMethodDetails = {
                      type: 'card',
                      last4: pm.card?.last4,
                      brand: pm.card?.brand,
                    };
                  }
                } catch (pmError) {
                  console.error('Error fetching payment method for invoice:', pmError);
                }
              }
              
              // Create invoice for this wallet top-up
              const invoiceNumber = await Invoice.generateInvoiceNumber();
              await Invoice.create({
                invoiceNumber,
                userId,
                type: 'wallet_topup',
                amount,
                currency: 'EUR',
                status: 'paid',
                paymentMethod: paymentMethodDetails,
                description: `Rechargement de solde: ${amount}€ EUR`,
                transactionId: transactionId || undefined,
                stripePaymentIntentId: session.payment_intent as string,
                stripeSessionId: session.id,
                metadata: {
                  previousBalance,
                  newBalance,
                },
                paidAt: new Date(),
              });
              
              console.log(`✅ Wallet credited: ${amount}€ for user ${userId} - Invoice ${invoiceNumber} created`);
            }
            // Handle subscription checkout
            // Retrieve metadata from session
            const planId = session.metadata?.planId;
            const location = session.metadata?.location || 'london';
            // Note: billingCycle is stored in session metadata, but redundant here as we get dates from subscription object

            if (userId && planId) {
               
               // Retrieve subscription to get period dates
               let currentPeriodStart = new Date();
               let currentPeriodEnd = new Date();
               
               if (session.subscription) {
                 try {
                   const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;
                   currentPeriodStart = new Date(subscription.current_period_start * 1000);
                   currentPeriodEnd = new Date(subscription.current_period_end * 1000);
                 } catch (subError) {
                   console.error('Error fetching subscription details:', subError);
                 }
               }

               // Trigger VPS Provisioning
               let vpsId = '';
               let vpsPassword = '';
               let vpsStatus = 'provisioning';

               try {
                 const user = await User.findById(userId);
                 if (user) {
                    const label = `vps-${user.firstName}-${user.lastName}-${Date.now()}`;
                    console.log(`🚀 Starting provisioning for ${label} on ${location}...`);
                    
                    const vps = await createForexVPS(planId, label, location);
                    vpsId = vps.instanceId;
                    console.log('✅ VPS Provisioning started:', vpsId);
                 }
               } catch (vpsError: any) {
                 console.error('❌ Failed to provision VPS during webhook:', vpsError);
                 // Mark as failed so user/admin knows
                 vpsStatus = 'failed';
                 
                 // If in dev mode, use mock
                 if (process.env.NODE_ENV !== 'production') {
                    vpsId = `mock-vps-${Date.now()}`;
                    vpsPassword = `DevPass${Date.now().toString(36)}!`;
                    vpsStatus = 'provisioning'; // Reset status to allow testing
                    console.log('⚠️ Development mode: Using mock VPS ID');
                 }
               }

               // Create new Service object with password
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


               // Create Invoice for the subscription payment
               const amount = (session.amount_total || 0) / 100; // Convert cents to dollars
               if (amount > 0) {
                   const invoiceNumber = await Invoice.generateInvoiceNumber();
                   
                   // Fetch payment method details if available
                   let paymentMethodDetails = { type: 'card' as const, last4: undefined as string | undefined, brand: undefined as string | undefined };
                   if (session.payment_intent) {
                        try {
                            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
                            if (paymentIntent.payment_method) {
                                const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
                                paymentMethodDetails = {
                                    type: 'card', 
                                    last4: pm.card?.last4,
                                    brand: pm.card?.brand,
                                };
                            }
                        } catch (err) {
                            console.error('Error fetching PM for sub invoice:', err);
                        }
                   }

                   await Invoice.create({
                        invoiceNumber,
                        userId,
                        type: 'subscription',
                        amount,
                        currency: session.currency?.toUpperCase() || 'EUR',
                        status: 'paid',
                        paymentMethod: paymentMethodDetails,
                        description: `Abonnement VPS ${location} (${session.metadata?.billingCycle || 'monthly'})`,
                        stripeSubscriptionId: session.subscription as string,
                        stripeSessionId: session.id,
                        paidAt: new Date(),
                   });
                   console.log(`✅ Invoice ${invoiceNumber} created for subscription.`);
               }

               // Add to user services array
               await User.findByIdAndUpdate(userId, {
                  $push: { services: newService }
               });
               
               console.log(`✅ Subscription activated for user ${userId}. New VPS service added.`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // Search user by stripeSubscriptionId in services array
        const stripeSubId = subscription.id;
        
        // Find user who has this subscription
        const user = await User.findOne({ 'services.stripeSubscriptionId': stripeSubId });
        
        if (user) {
          // Update the specific service in the array
          await User.findOneAndUpdate(
            { 'services.stripeSubscriptionId': stripeSubId },
            {
              $set: {
                'services.$.status': subscription.status === 'active' ? 'active' : 
                                     subscription.status === 'past_due' ? 'past_due' : 
                                     subscription.status === 'canceled' ? 'canceled' : 'pending',
                'services.$.currentPeriodStart': new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000),
                'services.$.currentPeriodEnd': new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
              }
            }
          );
          console.log(`📝 Service subscription updated for user ${user._id}`);
        } else {
             // Fallback for legacy support (if user still has old structure)
             const legacyUser = await User.findOne({ 'subscription.stripeSubscriptionId': stripeSubId });
             if (legacyUser) {
                  await User.findByIdAndUpdate(legacyUser._id, {
                    'subscription.status': subscription.status === 'active' ? 'active' : 
                                           subscription.status === 'past_due' ? 'past_due' : 
                                           subscription.status === 'canceled' ? 'canceled' : 'pending',
                    'subscription.currentPeriodStart': new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000),
                    'subscription.currentPeriodEnd': new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
                  });
                  console.log(`📝 Legacy subscription updated for user ${legacyUser._id}`);
             }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubId = subscription.id;
        
        // Find user and update specific service
        const user = await User.findOne({ 'services.stripeSubscriptionId': stripeSubId });
        
        if (user) {
             await User.findOneAndUpdate(
                { 'services.stripeSubscriptionId': stripeSubId },
                {
                  $set: {
                    'services.$.status': 'canceled',
                    'services.$.vpsStatus': 'suspended',
                  }
                }
             );
             console.log(`❌ Service subscription canceled for user ${user._id}`);
        } else {
            // Legacy fallback
             const legacyUser = await User.findOne({ 'subscription.stripeSubscriptionId': stripeSubId });
             if (legacyUser) {
                  await User.findByIdAndUpdate(legacyUser._id, {
                    'subscription.status': 'canceled',
                    'vps.status': 'suspended',
                  });
                  console.log(`❌ Legacy subscription canceled for user ${legacyUser._id}`);
             }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const stripeInvoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (stripeInvoice as unknown as { subscription: string | null }).subscription;
        
        if (subscriptionId) {
             const user = await User.findOne({ 'services.stripeSubscriptionId': subscriptionId });
             if (user) {
                  await User.findOneAndUpdate(
                    { 'services.stripeSubscriptionId': subscriptionId },
                    { $set: { 'services.$.status': 'past_due' } }
                  );
                  console.log(`⚠️ Payment failed for user ${user._id} (service sub)`);
             } else {
                 // Legacy fallback
                 // Try finding by customer ID as fallback if subscription ID match fails
                 const customerId = stripeInvoice.customer as string;
                 const legacyUser = await User.findOne({ stripeCustomerId: customerId });
                 if (legacyUser) {
                      // We can't be sure WHICH subscription failed if they have multiple and we only have customer ID
                      // But for legacy single-sub users, this is fine.
                      await User.findByIdAndUpdate(legacyUser._id, {
                        'subscription.status': 'past_due',
                      });
                      console.log(`⚠️ Payment failed for user ${legacyUser._id} (legacy/customer match)`);
                 }
             }
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
