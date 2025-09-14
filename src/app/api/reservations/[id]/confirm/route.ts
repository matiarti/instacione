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
    
    if (reservation.state !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: 'Reservation is not in pending payment state' },
        { status: 400 }
      );
    }
    
    // Update reservation state
    reservation.state = 'CONFIRMED';
    reservation.payment.status = 'PAID';
    await reservation.save();
    
    // Decrement parking lot availability
    await ParkingLot.findByIdAndUpdate(
      reservation.lotId,
      { $inc: { availabilityManual: -1 } }
    );
    
    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation._id,
        state: reservation.state,
        payment: reservation.payment
      }
    });
    
  } catch (error) {
    console.error('Error confirming reservation:', error);
    return NextResponse.json(
      { error: 'Failed to confirm reservation' },
      { status: 500 }
    );
  }
}
