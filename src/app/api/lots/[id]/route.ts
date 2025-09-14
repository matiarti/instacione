import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import ParkingLot from '../../../../../models/ParkingLot';
import User from '../../../../../models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const lot = await ParkingLot.findById(params.id);

    if (!lot) {
      return NextResponse.json(
        { error: 'Parking lot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lot);
  } catch (error) {
    console.error('Error fetching parking lot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parking lot' },
      { status: 500 }
    );
  }
}
