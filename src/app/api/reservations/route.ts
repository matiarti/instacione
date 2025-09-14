import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Reservation from '../../../../models/Reservation';
import ParkingLot from '../../../../models/ParkingLot';
import User from '../../../../models/User';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createReservationSchema = z.object({
  lotId: z.string(),
  carPlate: z.string().min(1),
  expectedHours: z.number().optional().default(2),
  arrivalTime: z.string().datetime().optional(), // ISO string
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { lotId, carPlate, expectedHours, arrivalTime } = createReservationSchema.parse(body);
    
    // Get parking lot details
    const lot = await ParkingLot.findById(lotId);
    if (!lot) {
      return NextResponse.json(
        { error: 'Parking lot not found' },
        { status: 404 }
      );
    }
    
    if (lot.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Parking lot is not available' },
        { status: 400 }
      );
    }
    
    if (lot.availabilityManual <= 0) {
      return NextResponse.json(
        { error: 'No available spots' },
        { status: 400 }
      );
    }
    
    // Calculate arrival window (default to 30 minutes from now)
    const now = new Date();
    const arrivalStart = arrivalTime ? new Date(arrivalTime) : now;
    const arrivalEnd = new Date(arrivalStart.getTime() + (30 * 60 * 1000)); // 30 minutes window
    
    // Calculate pricing
    const hourlyRate = lot.pricing.hourly;
    const reservationFeePercentage = parseFloat(process.env.RESERVATION_FEE_PCT || '0.12');
    const reservationFeeAmount = hourlyRate * reservationFeePercentage;
    
    // Create reservation
    const reservation = new Reservation({
      lotId: lot._id,
      userId: '68c63f29bd2cc35b576495aa', // TODO: Get from session/auth
      state: 'PENDING_PAYMENT',
      arrivalWindow: {
        start: arrivalStart,
        end: arrivalEnd
      },
      car: {
        plate: carPlate
      },
      priceEstimate: {
        hourly: hourlyRate,
        expectedHours: expectedHours
      },
      fees: {
        reservationPct: reservationFeePercentage,
        reservationFeeAmount: reservationFeeAmount
      },
      payment: {
        provider: 'stripe',
        status: 'REQUIRES_PAYMENT'
      }
    });
    
    await reservation.save();
    
    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation._id,
        lot: {
          id: lot._id,
          name: lot.name,
          address: lot.location.address,
          hourlyRate: lot.pricing.hourly
        },
        arrivalWindow: reservation.arrivalWindow,
        carPlate: reservation.car.plate,
        fees: reservation.fees,
        payment: {
          status: reservation.payment.status,
          amount: reservationFeeAmount
        }
      }
    });
    
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
