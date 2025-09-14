import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Reservation from '../../../../../models/Reservation';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const refundSchema = z.object({
  reservationId: z.string(),
  amount: z.number().optional(), // Optional partial refund
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { reservationId, amount } = refundSchema.parse(body);
    
    // Get reservation details
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    if (!reservation.payment.intentId) {
      return NextResponse.json(
        { error: 'No payment intent found for this reservation' },
        { status: 400 }
      );
    }
    
    // Determine refund amount
    const refundAmount = amount || reservation.fees.reservationFeeAmount;
    const refundAmountCents = Math.round(refundAmount * 100);
    
    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: reservation.payment.intentId,
      amount: refundAmountCents,
      metadata: {
        reservationId: reservation._id.toString(),
        reason: 'requested_by_customer',
      },
    });
    
    // Update reservation payment status
    if (refundAmount >= reservation.fees.reservationFeeAmount) {
      reservation.payment.status = 'REFUNDED';
    }
    
    await reservation.save();
    
    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refundAmount,
        status: refund.status,
      },
    });
    
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
