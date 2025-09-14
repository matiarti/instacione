import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Reservation from '../../../../../models/Reservation';
import ParkingLot from '../../../../../models/ParkingLot';

export async function GET(
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
    
    const lot = await ParkingLot.findById(reservation.lotId);
    
    return NextResponse.json({
      id: reservation._id,
      state: reservation.state,
      lot: lot ? {
        id: lot._id,
        name: lot.name,
        address: lot.location.address,
        hourlyRate: lot.pricing.hourly
      } : null,
      arrivalWindow: reservation.arrivalWindow,
      car: reservation.car,
      priceEstimate: reservation.priceEstimate,
      fees: reservation.fees,
      payment: reservation.payment,
      checkinAt: reservation.checkinAt,
      checkoutAt: reservation.checkoutAt,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt
    });
    
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    );
  }
}
