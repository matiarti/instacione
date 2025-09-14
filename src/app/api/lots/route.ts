import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import ParkingLot from '../../../../models/ParkingLot';

export const dynamic = 'force-dynamic';
import { z } from 'zod';

const searchSchema = z.object({
  lat: z.string().transform(Number).optional(),
  lng: z.string().transform(Number).optional(),
  radius: z.string().transform(Number).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const { lat, lng, radius } = searchSchema.parse({
      lat: searchParams.get('lat') || '0',
      lng: searchParams.get('lng') || '0',
      radius: searchParams.get('radius') || '5000', // Default to 5km
    });

    // For now, get all active lots (we'll add geospatial search later)
    const lots = await ParkingLot.find({
      status: 'ACTIVE'
    });

    return NextResponse.json(lots);
  } catch (error) {
    console.error('Error fetching parking lots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parking lots' },
      { status: 500 }
    );
  }
}
