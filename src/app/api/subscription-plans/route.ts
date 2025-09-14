import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import SubscriptionPlan from '../../../../models/SubscriptionPlan';

// GET /api/subscription-plans - List available subscription plans
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const plans = await SubscriptionPlan.find({ isActive: true })
      .sort({ price: 1 }); // Sort by price ascending
    
    return NextResponse.json({
      success: true,
      plans: plans.map(plan => ({
        id: plan._id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        features: plan.features,
        maxParkingLots: plan.maxParkingLots,
        maxReservationsPerMonth: plan.maxReservationsPerMonth,
        stripePriceId: plan.stripePriceId,
      }))
    });
    
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
