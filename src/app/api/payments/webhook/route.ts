import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Reservation from '../../../../../models/Reservation';
import User from '../../../../../models/User';
import ParkingLot from '../../../../../models/ParkingLot';
import Stripe from 'stripe';
import { sendReservationConfirmationEmail, sendPaymentFailureEmail } from '../../../../lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
        
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

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const reservationId = paymentIntent.metadata.reservationId;
  
  if (!reservationId) {
    console.error('No reservation ID in payment intent metadata');
    return;
  }
  
  try {
    const reservation = await Reservation.findById(reservationId)
      .populate('userId', 'name email')
      .populate('lotId', 'name location.address');
    
    if (!reservation) {
      console.error(`Reservation ${reservationId} not found`);
      return;
    }
    
    // Update reservation state
    reservation.state = 'CONFIRMED';
    reservation.payment.status = 'PAID';
    await reservation.save();
    
    // Send confirmation email
    if (reservation.userId && reservation.lotId) {
      await sendReservationConfirmationEmail({
        reservationId: reservation._id.toString(),
        userEmail: (reservation.userId as any).email,
        userName: (reservation.userId as any).name,
        lotName: (reservation.lotId as any).name,
        lotAddress: (reservation.lotId as any).location.address,
        carPlate: reservation.car.plate,
        arrivalWindow: reservation.arrivalWindow,
        fees: reservation.fees,
        state: reservation.state,
      });
    }
    
    console.log(`Reservation ${reservationId} confirmed after payment`);
    
  } catch (error) {
    console.error(`Error handling payment success for reservation ${reservationId}:`, error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const reservationId = paymentIntent.metadata.reservationId;
  
  if (!reservationId) {
    console.error('No reservation ID in payment intent metadata');
    return;
  }
  
  try {
    const reservation = await Reservation.findById(reservationId)
      .populate('userId', 'name email')
      .populate('lotId', 'name location.address');
    
    if (!reservation) {
      console.error(`Reservation ${reservationId} not found`);
      return;
    }
    
    // Update reservation state
    reservation.state = 'EXPIRED';
    reservation.payment.status = 'FAILED';
    await reservation.save();
    
    // Send payment failure notification
    if (reservation.userId && reservation.lotId) {
      await sendPaymentFailureEmail({
        reservationId: reservation._id.toString(),
        userEmail: (reservation.userId as any).email,
        userName: (reservation.userId as any).name,
        lotName: (reservation.lotId as any).name,
        lotAddress: (reservation.lotId as any).location.address,
        carPlate: reservation.car.plate,
        arrivalWindow: reservation.arrivalWindow,
        fees: reservation.fees,
        state: reservation.state,
      });
    }
    
    console.log(`Reservation ${reservationId} expired due to payment failure`);
    
  } catch (error) {
    console.error(`Error handling payment failure for reservation ${reservationId}:`, error);
  }
}
