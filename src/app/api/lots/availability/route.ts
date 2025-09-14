import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import ParkingLot from '../../../../../models/ParkingLot';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const availabilityRequestSchema = z.object({
  lotIds: z.array(z.string()),
});

// POST /api/lots/availability - Get availability for multiple lots
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { lotIds } = availabilityRequestSchema.parse(body);
    
    if (lotIds.length === 0) {
      return NextResponse.json({
        success: true,
        availability: {},
      });
    }

    const lots = await ParkingLot.find({
      _id: { $in: lotIds },
      status: 'ACTIVE',
    }).select('_id availabilityManual');

    const availability: Record<string, number> = {};
    lots.forEach(lot => {
      availability[lot._id.toString()] = lot.availabilityManual;
    });

    return NextResponse.json({
      success: true,
      availability,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error fetching availability:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
