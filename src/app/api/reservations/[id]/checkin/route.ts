import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';
import Reservation from '../../../../../../models/Reservation';

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
    
    if (reservation.state !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Reservation must be confirmed before check-in' },
        { status: 400 }
      );
    }
    
    // Check if arrival window has expired
    const now = new Date();
    const arrivalEnd = new Date(reservation.arrivalWindow.end);
    
    if (now > arrivalEnd) {
      // Mark as no-show
      reservation.state = 'NO_SHOW';
      await reservation.save();
      
      return NextResponse.json(
        { error: 'Arrival window has expired. Reservation marked as no-show.' },
        { status: 400 }
      );
    }
    
    // Process check-in
    reservation.state = 'CHECKED_IN';
    reservation.checkinAt = now;
    await reservation.save();
    
    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation._id,
        state: reservation.state,
        checkinAt: reservation.checkinAt
      }
    });
    
  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}
