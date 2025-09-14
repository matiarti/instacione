import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Reservation from '../../../../../models/Reservation';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { reservationId } = body;
    
    if (!reservationId) {
      return NextResponse.json(
        { error: 'Reservation ID is required' },
        { status: 400 }
      );
    }
    
    // Get reservation details
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    if (reservation.state !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: 'Reservation is not in pending payment state' },
        { status: 400 }
      );
    }
    
    // Create Stripe payment intent
    // Ensure minimum amount for Stripe (50 cents = 50 BRL cents)
    const amountInCents = Math.max(Math.round(reservation.fees.reservationFeeAmount * 100), 50);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'brl', // Brazilian Real
      metadata: {
        reservationId: reservation._id.toString(),
        userId: reservation.userId.toString(),
        lotId: reservation.lotId.toString(),
      },
      description: `Reservation fee for parking lot`,
    });
    
    // Update reservation with payment intent ID
    reservation.payment.intentId = paymentIntent.id;
    await reservation.save();
    
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: reservation.fees.reservationFeeAmount,
    });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: 'Failed to create payment intent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
