import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongodb';
import Reservation from '../../../../../models/Reservation';
import User from '../../../../../models/User';

export const dynamic = 'force-dynamic';

// GET /api/user/reservations - Get user's reservations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's reservations with parking lot details
    const reservations = await Reservation.find({ userId: user._id })
      .populate('lotId', 'name location.address')
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedReservations = reservations.map(reservation => ({
      id: reservation._id,
      lotName: (reservation.lotId as any).name,
      lotAddress: (reservation.lotId as any).location.address,
      state: reservation.state,
      arrivalWindow: reservation.arrivalWindow,
      carPlate: reservation.car.plate,
      fees: reservation.fees,
      createdAt: reservation.createdAt,
      checkinAt: reservation.checkinAt,
      checkoutAt: reservation.checkoutAt,
    }));

    return NextResponse.json({
      success: true,
      reservations: formattedReservations,
    });
    
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}
