import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import OperatorSubscription from '../../../../../models/OperatorSubscription';
import SubscriptionPlan from '../../../../../models/SubscriptionPlan';

export const dynamic = 'force-dynamic';

// POST /api/stripe/create-subscription - Create Stripe subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the subscription record
    const subscription = await OperatorSubscription.findById(subscriptionId)
      .populate('planId');
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Get the user
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'OPERATOR') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // In a real implementation, you would:
    // 1. Create a Stripe customer
    // 2. Create a Stripe subscription
    // 3. Update the subscription record with Stripe IDs
    
    // For now, we'll simulate the Stripe integration
    const mockStripeCustomerId = `cus_${Date.now()}`;
    const mockStripeSubscriptionId = `sub_${Date.now()}`;

    // Update the subscription with Stripe IDs
    subscription.stripeCustomerId = mockStripeCustomerId;
    subscription.stripeSubscriptionId = mockStripeSubscriptionId;
    subscription.status = 'active';
    await subscription.save();

    // Update user subscription status
    user.subscriptionStatus = 'active';
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      }
    });

  } catch (error) {
    console.error('Stripe subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
