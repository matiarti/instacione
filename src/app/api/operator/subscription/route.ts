import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { requireActiveSubscription } from '../../../../../lib/subscription-middleware';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import OperatorSubscription from '../../../../../models/OperatorSubscription';
import SubscriptionPlan from '../../../../../models/SubscriptionPlan';

export const dynamic = 'force-dynamic';

// GET /api/operator/subscription - Get operator's subscription details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Verify user is an operator
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'OPERATOR') {
      return NextResponse.json(
        { error: 'Access denied. Operator role required.' },
        { status: 403 }
      );
    }

    // Get subscription details
    const subscription = await OperatorSubscription.findOne({
      operatorId: session.user.id
    }).populate('planId');

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription._id,
        planId: subscription.planId._id,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        plan: {
          name: subscription.planId.name,
          description: subscription.planId.description,
          price: subscription.planId.price,
          currency: subscription.planId.currency,
          features: subscription.planId.features,
          maxParkingLots: subscription.planId.maxParkingLots,
          maxReservationsPerMonth: subscription.planId.maxReservationsPerMonth,
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching operator subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}
