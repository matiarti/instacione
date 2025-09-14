import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import OperatorSubscription from '../../../../../models/OperatorSubscription';
import SubscriptionPlan from '../../../../../models/SubscriptionPlan';

// Ensure models are registered
import '../../../../../models/User';
import '../../../../../models/OperatorSubscription';
import '../../../../../models/SubscriptionPlan';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export const dynamic = 'force-dynamic';

// POST /api/stripe/create-checkout-session - Create Stripe Checkout session
export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Stripe not configured. Please set up your Stripe API keys.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { subscriptionId, userEmail, userName } = body;

    if (!subscriptionId || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the subscription record with plan details
    const subscription = await OperatorSubscription.findById(subscriptionId)
      .populate('planId');
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const plan = subscription.planId as any;

    // Create or get Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        name: userName,
        metadata: {
          subscriptionId: subscriptionId,
        },
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.price, // Price in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/setup-payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/setup-payment?subscriptionId=${subscriptionId}`,
      metadata: {
        subscriptionId: subscriptionId,
        planId: plan._id.toString(),
      },
      subscription_data: {
        metadata: {
          subscriptionId: subscriptionId,
          planId: plan._id.toString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
