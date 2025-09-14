import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth';
import connectDB from '../../../../../../lib/mongodb';
import ParkingLot from '../../../../../../models/ParkingLot';
import User from '../../../../../../models/User';
import { z } from 'zod';

// GET /api/operator/lots/[id] - Get lot details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // TODO: Get operator ID from session/auth
    const operatorId = '68c63f29bd2cc35b576495aa'; // Hardcoded for now
    
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
    
    return NextResponse.json({
      success: true,
      lot: {
        id: lot._id,
        name: lot.name,
        address: lot.location.address,
        coordinates: lot.location.geo.coordinates,
        pricing: lot.pricing,
        capacity: lot.capacity,
        availability: lot.availabilityManual,
        amenities: lot.amenities,
        status: lot.status,
        subscription: lot.subscription,
        createdAt: lot.createdAt,
        updatedAt: lot.updatedAt,
      }
    });
    
  } catch (error) {
    console.error('Error fetching lot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lot' },
      { status: 500 }
    );
  }
}

// PATCH /api/operator/lots/[id] - Update lot
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const updateLotSchema = z.object({
      name: z.string().min(1).optional(),
      address: z.string().min(1).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      hourlyRate: z.number().positive().optional(),
      dailyMax: z.number().positive().optional(),
      capacity: z.number().positive().optional(),
      amenities: z.array(z.string()).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    });
    
    const body = await request.json();
    const updates = updateLotSchema.parse(body);
    
    // Verify user is an operator
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'OPERATOR') {
      return NextResponse.json(
        { error: 'Access denied. Operator role required.' },
        { status: 403 }
      );
    }
    
    // Check if lot exists and belongs to operator
    const lot = await ParkingLot.findOne({ 
      _id: params.id, 
      operatorUserId: session.user.id 
    });
    
    if (!lot) {
      return NextResponse.json(
        { error: 'Lot not found or access denied' },
        { status: 404 }
      );
    }
    
    // Update lot fields
    if (updates.name) lot.name = updates.name;
    if (updates.address) lot.location.address = updates.address;
    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      lot.location.geo.coordinates = [updates.longitude, updates.latitude];
    }
    if (updates.hourlyRate !== undefined) lot.pricing.hourly = updates.hourlyRate;
    if (updates.dailyMax !== undefined) lot.pricing.dailyMax = updates.dailyMax;
    if (updates.capacity !== undefined) {
      // Adjust availability if capacity changes
      const capacityDiff = updates.capacity - lot.capacity;
      lot.capacity = updates.capacity;
      lot.availabilityManual = Math.max(0, lot.availabilityManual + capacityDiff);
    }
    if (updates.amenities !== undefined) lot.amenities = updates.amenities;
    if (updates.status !== undefined) lot.status = updates.status;
    
    await lot.save();
    
    return NextResponse.json({
      success: true,
      lot: {
        id: lot._id,
        name: lot.name,
        address: lot.location.address,
        coordinates: lot.location.geo.coordinates,
        pricing: lot.pricing,
        capacity: lot.capacity,
        availability: lot.availabilityManual,
        amenities: lot.amenities,
        status: lot.status,
        updatedAt: lot.updatedAt,
      }
    });
    
  } catch (error) {
    console.error('Error updating lot:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update lot' },
      { status: 500 }
    );
  }
}

// DELETE /api/operator/lots/[id] - Delete lot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
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
    
    // TODO: Check for active reservations before deletion
    
    await ParkingLot.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Lot deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting lot:', error);
    return NextResponse.json(
      { error: 'Failed to delete lot' },
      { status: 500 }
    );
  }
}
