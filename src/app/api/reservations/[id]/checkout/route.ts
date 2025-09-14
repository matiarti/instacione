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
    
    if (reservation.state !== 'CHECKED_IN') {
      return NextResponse.json(
        { error: 'Reservation must be checked in before check-out' },
        { status: 400 }
      );
    }
    
    const now = new Date();
    const checkinTime = new Date(reservation.checkinAt!);
    const parkingDuration = now.getTime() - checkinTime.getTime();
    const parkingHours = Math.ceil(parkingDuration / (1000 * 60 * 60)); // Round up to next hour
    
    // Calculate final payment
    const hourlyRate = reservation.priceEstimate.hourly;
    const totalAmount = parkingHours * hourlyRate;
    const alreadyPaid = reservation.fees.reservationFeeAmount;
    const remainingAmount = totalAmount - alreadyPaid;
    
    // Process check-out
    reservation.state = 'CHECKED_OUT';
    reservation.checkoutAt = now;
    await reservation.save();
    
    // Increment parking lot availability
    await ParkingLot.findByIdAndUpdate(
      reservation.lotId,
      { $inc: { availabilityManual: 1 } }
    );
    
    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation._id,
        state: reservation.state,
        checkoutAt: reservation.checkoutAt,
        parkingDuration: {
          hours: parkingHours,
          totalAmount: totalAmount,
          alreadyPaid: alreadyPaid,
          remainingAmount: Math.max(0, remainingAmount)
        }
      }
    });
    
  } catch (error) {
    console.error('Error processing check-out:', error);
    return NextResponse.json(
      { error: 'Failed to process check-out' },
      { status: 500 }
    );
  }
}
