import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Invoice from '@/models/Invoice';
import { getCurrentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

// GET: Retrieve user balance, payment methods, and recent transactions
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(currentUser.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get recent transactions (last 10)
    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Check if user has saved payment methods
    let hasPaymentMethod = false;
    let paymentMethodLast4 = null;
    let paymentMethodBrand = null;

    if (user.stripeCustomerId) {
      try {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: user.stripeCustomerId,
          type: 'card',
          limit: 1,
        });
        
        if (paymentMethods.data.length > 0) {
          hasPaymentMethod = true;
          paymentMethodLast4 = paymentMethods.data[0].card?.last4;
          paymentMethodBrand = paymentMethods.data[0].card?.brand;
        }
      } catch (e) {
        console.error('Error fetching payment methods:', e);
      }
    }

    return NextResponse.json({
      success: true,
      balance: user.balance || 0,
      currency: 'USD',
      hasPaymentMethod,
      paymentMethod: hasPaymentMethod ? {
        last4: paymentMethodLast4,
        brand: paymentMethodBrand,
      } : null,
      transactions: transactions.map(t => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
      })),
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST: Add funds using saved payment method or create checkout session
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, useNewCard } = body;

    // Validate amount (minimum $5, maximum $1000)
    if (!amount || amount < 5 || amount > 1000) {
      return NextResponse.json(
        { error: 'Amount must be between $5 and $1000' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(currentUser.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has Stripe customer and saved payment method
    if (user.stripeCustomerId && !useNewCard) {
      try {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: user.stripeCustomerId,
          type: 'card',
          limit: 1,
        });

        if (paymentMethods.data.length > 0) {
          // User has saved card - charge directly
          const paymentMethodId = paymentMethods.data[0].id;
          
          // Create pending transaction
          const transaction = await Transaction.create({
            userId: user._id,
            type: 'credit',
            amount: amount,
            currency: 'USD',
            description: `Wallet top-up: $${amount} USD`,
            status: 'pending',
          });

          // Create and confirm PaymentIntent with saved card
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            customer: user.stripeCustomerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
            metadata: {
              userId: user._id.toString(),
              transactionId: transaction._id.toString(),
              type: 'wallet_topup',
            },
          });

          if (paymentIntent.status === 'succeeded') {
            const previousBalance = user.balance || 0;
            const newBalance = previousBalance + amount;
            
            // Payment successful - credit balance immediately
            await User.findByIdAndUpdate(user._id, {
              $inc: { balance: amount }
            });

            await Transaction.findByIdAndUpdate(transaction._id, {
              status: 'completed',
              reference: paymentIntent.id,
            });

            // Create invoice for this wallet top-up
            const invoiceNumber = await Invoice.generateInvoiceNumber();
            await Invoice.create({
              invoiceNumber,
              userId: user._id,
              type: 'wallet_topup',
              amount,
              currency: 'USD',
              status: 'paid',
              paymentMethod: {
                type: 'card',
                last4: paymentMethods.data[0].card?.last4,
                brand: paymentMethods.data[0].card?.brand,
              },
              description: `Rechargement de solde: $${amount} USD`,
              transactionId: transaction._id,
              stripePaymentIntentId: paymentIntent.id,
              metadata: {
                previousBalance,
                newBalance,
              },
              paidAt: new Date(),
            });

            return NextResponse.json({
              success: true,
              charged: true,
              newBalance,
              message: `$${amount} added to your wallet successfully!`,
            });
          } else {
            // Payment requires action or failed
            await Transaction.findByIdAndUpdate(transaction._id, {
              status: 'failed',
              reference: paymentIntent.id,
            });

            return NextResponse.json({
              success: false,
              error: 'Payment failed. Please update your payment method.',
              requiresAction: true,
            });
          }
        }
      } catch (stripeError) {
        console.error('Stripe direct charge error:', stripeError);
        // Fall through to checkout flow if direct charge fails
      }
    }

    // No saved payment method or direct charge failed - use Checkout
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    // Create a pending transaction
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'credit',
      amount: amount,
      currency: 'USD',
      description: `Wallet top-up: $${amount} USD`,
      status: 'pending',
    });

    // Create Stripe Checkout session (will save card for future use)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      payment_intent_data: {
        setup_future_usage: 'off_session', // Save card for future charges
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Wallet Top-Up',
              description: `Add $${amount} to your STABLEVPS wallet`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user._id.toString(),
        transactionId: transaction._id.toString(),
        type: 'wallet_topup',
        amount: amount.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?wallet=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?wallet=canceled`,
    });

    return NextResponse.json({
      success: true,
      charged: false,
      checkoutUrl: session.url,
      transactionId: transaction._id.toString(),
    });

  } catch (error) {
    console.error('Create wallet payment error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing payment' },
      { status: 500 }
    );
  }
}
