import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import OperatorSubscription from '../../../../../models/OperatorSubscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    await connectDB();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.metadata?.subscriptionId;

        if (subscriptionId) {
          // Update subscription status to active
          await OperatorSubscription.findByIdAndUpdate(subscriptionId, {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: 'active',
          });

          // Update user subscription status
          const subscription = await OperatorSubscription.findById(subscriptionId);
          if (subscription) {
            await User.findByIdAndUpdate(subscription.operatorId, {
              subscriptionStatus: 'active',
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.metadata?.subscriptionId;

        if (subscriptionId) {
          await OperatorSubscription.findByIdAndUpdate(subscriptionId, {
            status: subscription.status === 'active' ? 'active' : 'canceled',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.metadata?.subscriptionId;

        if (subscriptionId) {
          await OperatorSubscription.findByIdAndUpdate(subscriptionId, {
            status: 'canceled',
          });

          // Update user subscription status
          const operatorSubscription = await OperatorSubscription.findById(subscriptionId);
          if (operatorSubscription) {
            await User.findByIdAndUpdate(operatorSubscription.operatorId, {
              subscriptionStatus: 'inactive',
            });
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
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
