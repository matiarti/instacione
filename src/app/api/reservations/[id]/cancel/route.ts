import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';
import Reservation from '../../../../../../models/Reservation';
import ParkingLot from '../../../../../../models/ParkingLot';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const reservation = await Reservation.findById(params.id);
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    if (reservation.state === 'CHECKED_OUT' || reservation.state === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Reservation cannot be cancelled' },
        { status: 400 }
      );
    }
    
    // Determine if we should refund based on cancellation policy
    const now = new Date();
    const arrivalStart = new Date(reservation.arrivalWindow.start);
    const timeUntilArrival = arrivalStart.getTime() - now.getTime();
    const minutesUntilArrival = timeUntilArrival / (1000 * 60);
    
    let refundAmount = 0;
    
    // Cancellation policy:
    // - Free within 5 minutes of booking
    // - 50% refund if ≥15 minutes before arrival
    // - No refund inside 15 minute window
    if (minutesUntilArrival >= 15) {
      refundAmount = reservation.fees.reservationFeeAmount * 0.5; // 50% refund
    }
    // Free cancellation within 5 minutes of booking
    else if ((now.getTime() - new Date(reservation.createdAt).getTime()) / (1000 * 60) <= 5) {
      refundAmount = reservation.fees.reservationFeeAmount; // Full refund
    }
    
    // Update reservation state
    reservation.state = 'CANCELLED';
    reservation.payment.status = refundAmount > 0 ? 'REFUNDED' : 'PAID';
    await reservation.save();
    
    // Increment parking lot availability if it was confirmed
    if (reservation.state === 'CONFIRMED') {
      await ParkingLot.findByIdAndUpdate(
        reservation.lotId,
        { $inc: { availabilityManual: 1 } }
      );
    }
    
    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation._id,
        state: reservation.state,
        refundAmount: refundAmount
      }
    });
    
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
}
