import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import connectDB from './mongodb';
import User from '../models/User';
import OperatorSubscription from '../models/OperatorSubscription';

export interface SubscriptionCheckResult {
  hasAccess: boolean;
  subscriptionStatus: 'active' | 'trial' | 'inactive' | 'canceled' | 'past_due';
  trialEnd?: Date;
  currentPeriodEnd?: Date;
  message?: string;
}

/**
 * Check if an operator has an active subscription
 */
export async function checkOperatorSubscription(
  operatorId: string
): Promise<SubscriptionCheckResult> {
  try {
    await connectDB();
    
    // Get user details
    const user = await User.findById(operatorId);
    if (!user || user.role !== 'OPERATOR') {
      return {
        hasAccess: false,
        subscriptionStatus: 'inactive',
        message: 'User not found or not an operator'
      };
    }

    // Get active subscription
    const subscription = await OperatorSubscription.findOne({
      operatorId,
      status: { $in: ['active', 'trialing'] }
    }).populate('planId');

    if (!subscription) {
      return {
        hasAccess: false,
        subscriptionStatus: 'inactive',
        message: 'No active subscription found'
      };
    }

    // Check if subscription is in trial period
    if (subscription.status === 'trialing') {
      const now = new Date();
      if (subscription.trialEnd && now > subscription.trialEnd) {
        return {
          hasAccess: false,
          subscriptionStatus: 'inactive',
          message: 'Trial period has expired'
        };
      }
      
      return {
        hasAccess: true,
        subscriptionStatus: 'trial',
        trialEnd: subscription.trialEnd,
        currentPeriodEnd: subscription.currentPeriodEnd
      };
    }

    // Check if subscription is active
    if (subscription.status === 'active') {
      const now = new Date();
      if (subscription.currentPeriodEnd && now > subscription.currentPeriodEnd) {
        return {
          hasAccess: false,
          subscriptionStatus: 'past_due',
          message: 'Subscription period has expired'
        };
      }
      
      return {
        hasAccess: true,
        subscriptionStatus: 'active',
        currentPeriodEnd: subscription.currentPeriodEnd
      };
    }

    return {
      hasAccess: false,
      subscriptionStatus: subscription.status as any,
      message: 'Subscription is not active'
    };

  } catch (error) {
    console.error('Error checking operator subscription:', error);
    return {
      hasAccess: false,
      subscriptionStatus: 'inactive',
      message: 'Error checking subscription status'
    };
  }
}

/**
 * Middleware function to protect operator routes
 */
export async function requireActiveSubscription(
  request: NextRequest,
  operatorId?: string
): Promise<NextResponse | null> {
  try {
    // Get operator ID from session if not provided
    if (!operatorId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      operatorId = session.user.id;
    }

    // Check subscription status
    const subscriptionCheck = await checkOperatorSubscription(operatorId);
    
    if (!subscriptionCheck.hasAccess) {
      return NextResponse.json(
        { 
          error: 'Subscription required',
          message: subscriptionCheck.message,
          subscriptionStatus: subscriptionCheck.subscriptionStatus
        },
        { status: 403 }
      );
    }

    // Add subscription info to request headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-subscription-status', subscriptionCheck.subscriptionStatus);
    if (subscriptionCheck.trialEnd) {
      response.headers.set('x-trial-end', subscriptionCheck.trialEnd.toISOString());
    }
    if (subscriptionCheck.currentPeriodEnd) {
      response.headers.set('x-period-end', subscriptionCheck.currentPeriodEnd.toISOString());
    }
    
    return response;

  } catch (error) {
    console.error('Error in subscription middleware:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
