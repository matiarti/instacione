import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../../lib/mongodb';
import ParkingLot from '../../../../../../../models/ParkingLot';
import { z } from 'zod';

// PATCH /api/operator/lots/[id]/availability - Update availability
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const updateAvailabilitySchema = z.object({
      availability: z.number().min(0),
    });
    
    const body = await request.json();
    const { availability } = updateAvailabilitySchema.parse(body);
    
    // TODO: Get operator ID from session/auth
    const operatorId = '68c63f29bd2cc35b576495aa'; // Hardcoded for now
    
    // Check if lot exists and belongs to operator
    const lot = await ParkingLot.findOne({ 
      _id: params.id, 
      operatorUserId: operatorId 
    });
    
    if (!lot) {
      return NextResponse.json(
        { error: 'Lot not found or access denied' },
        { status: 404 }
      );
    }
    
    // Validate availability doesn't exceed capacity
    if (availability > lot.capacity) {
      return NextResponse.json(
        { error: 'Availability cannot exceed capacity' },
        { status: 400 }
      );
    }
    
    // Update availability
    lot.availabilityManual = availability;
    await lot.save();
    
    return NextResponse.json({
      success: true,
      lot: {
        id: lot._id,
        name: lot.name,
        capacity: lot.capacity,
        availability: lot.availabilityManual,
        updatedAt: lot.updatedAt,
      }
    });
    
  } catch (error) {
    console.error('Error updating availability:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}
