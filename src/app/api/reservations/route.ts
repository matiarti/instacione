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
    console.log('Reservation request body:', body);
    
    const { lotId, carPlate, expectedHours, arrivalTime } = createReservationSchema.parse(body);
    console.log('Parsed reservation data:', { lotId, carPlate, expectedHours, arrivalTime });
    
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
    const reservationFeePercentage = parseFloat(process.env.RESERVATION_FEE_PCT || '0.20');
    let reservationFeeAmount = hourlyRate * reservationFeePercentage;
    
    // Ensure minimum fee of R$ 0.50 to meet Stripe requirements
    reservationFeeAmount = Math.max(reservationFeeAmount, 0.50);
    
    // Get or create a temporary user for testing
    // TODO: Replace with proper authentication
    let userId;
    try {
      // Try to find an existing user or create a temporary one
      const existingUser = await User.findOne({ email: 'test@example.com' });
      if (existingUser) {
        userId = existingUser._id;
      } else {
        const tempUser = new User({
          name: 'Test User',
          email: 'test@example.com',
          role: 'DRIVER',
          provider: 'credentials'
        });
        await tempUser.save();
        userId = tempUser._id;
      }
    } catch (userError) {
      console.error('Error handling user:', userError);
      return NextResponse.json(
        { error: 'Failed to process user authentication' },
        { status: 500 }
      );
    }

    // Create reservation
    const reservation = new Reservation({
      lotId: lot._id,
      userId: userId,
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
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Invalid reservation data', details: error.message },
          { status: 400 }
        );
      } else if (error.name === 'CastError') {
        return NextResponse.json(
          { error: 'Invalid ID format' },
          { status: 400 }
        );
      } else if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create reservation', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
