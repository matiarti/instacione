import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Reservation from '../../../../../models/Reservation';
import ParkingLot from '../../../../../models/ParkingLot';

export const dynamic = 'force-dynamic';

// GET /api/operator/reservations - List operator's reservations
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const lotId = searchParams.get('lotId');
    const state = searchParams.get('state');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // TODO: Get operator ID from session/auth
    const operatorId = '68c63f29bd2cc35b576495aa'; // Hardcoded for now
    
    // Build query
    const query: any = {};
    
    if (lotId) {
      // Verify lot belongs to operator
      const lot = await ParkingLot.findOne({ 
        _id: lotId, 
        operatorUserId: operatorId 
      });
      
      if (!lot) {
        return NextResponse.json(
          { error: 'Lot not found or access denied' },
          { status: 404 }
        );
      }
      
      query.lotId = lotId;
    } else {
      // Get all lots for this operator
      const operatorLots = await ParkingLot.find({ operatorUserId: operatorId });
      const lotIds = operatorLots.map(lot => lot._id);
      query.lotId = { $in: lotIds };
    }
    
    if (state) {
      query.state = state;
    }
    
    // Fetch reservations
    const reservations = await Reservation.find(query)
      .populate('userId', 'name email phone')
      .populate('lotId', 'name location.address')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    
    // Get total count for pagination
    const total = await Reservation.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      reservations: reservations.map(reservation => ({
        id: reservation._id,
        state: reservation.state,
        arrivalWindow: reservation.arrivalWindow,
        car: reservation.car,
        priceEstimate: reservation.priceEstimate,
        fees: reservation.fees,
        payment: reservation.payment,
        checkinAt: reservation.checkinAt,
        checkoutAt: reservation.checkoutAt,
        createdAt: reservation.createdAt,
        user: {
          id: reservation.userId._id,
          name: reservation.userId.name,
          email: reservation.userId.email,
          phone: reservation.userId.phone,
        },
        lot: {
          id: reservation.lotId._id,
          name: reservation.lotId.name,
          address: reservation.lotId.location.address,
        },
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    });
    
  } catch (error) {
    console.error('Error fetching operator reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}
